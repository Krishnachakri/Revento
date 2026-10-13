// ============================================================================
// ReVento - Deterministic Resource Matching & Allocation Engine
// ============================================================================

import {
  BookingRequest,
  EventPlan,
  EventRequirement,
  Resource,
  ResourceBlackout,
} from '../types/database';
import {
  CandidateResource,
  MatchScoreBreakdown,
  PlanEvaluation,
  ProviderSplitSummary,
  RequirementMatchResult,
  SelectedAllocation,
} from '../types/matching';
import { calculateLineSubtotalCents, calculateRentalDays } from './currency';

/**
 * Check real-time inventory available for a specific resource over a date range
 * respecting blackouts and accepted bookings.
 */
export function calculateResourceAvailability(
  resource: Resource,
  startDate: string,
  endDate: string,
  blackouts: ResourceBlackout[] = [],
  bookings: BookingRequest[] = []
): number {
  if (!resource.is_available || resource.total_quantity <= 0) {
    return 0;
  }

  const reqStart = new Date(startDate).getTime();
  const reqEnd = new Date(endDate).getTime();

  // 1. Calculate blackout deductions
  const blackoutBlocked = blackouts
    .filter((b) => b.resource_id === resource.id)
    .filter((b) => {
      const bStart = new Date(b.start_date).getTime();
      const bEnd = new Date(b.end_date).getTime();
      // Overlap condition: start <= otherEnd && end >= otherStart
      return bStart <= reqEnd && bEnd >= reqStart;
    })
    .reduce((sum, b) => sum + b.quantity_blocked, 0);

  // 2. Calculate accepted booking deductions
  let bookedQuantity = 0;
  for (const b of bookings) {
    if (b.status === 'accepted') {
      const bStart = new Date(b.start_date).getTime();
      const bEnd = new Date(b.end_date).getTime();
      if (bStart <= reqEnd && bEnd >= reqStart && b.items) {
        for (const item of b.items) {
          if (item.resource_id === resource.id) {
            bookedQuantity += item.quantity;
          }
        }
      }
    }
  }

  const netAvailable = resource.total_quantity - (blackoutBlocked + bookedQuantity);
  return Math.max(0, netAvailable);
}

/**
 * Tokenize and score text relevance
 */
function calculateTextRelevance(query: string, target: string): { score: number; matchedWords: string[] } {
  if (!query || !target) return { score: 0, matchedWords: [] };

  const queryTokens = query
    .toLowerCase()
    .split(/[\s,/-]+/)
    .filter((t) => t.length > 2);
  const targetLower = target.toLowerCase();

  const matchedWords: string[] = [];
  let hits = 0;

  for (const token of queryTokens) {
    if (targetLower.includes(token)) {
      hits++;
      matchedWords.push(token);
    }
  }

  const score = queryTokens.length > 0 ? (hits / queryTokens.length) * 30 : 15;
  return { score: Math.min(30, Math.round(score)), matchedWords };
}

/**
 * Score a single resource against a requirement
 */
export function scoreResource(
  resource: Resource,
  req: EventRequirement,
  event: EventPlan,
  rentalDays: number,
  availableQuantity: number
): CandidateResource {
  const explanations: string[] = [];

  // Category matching (40 points)
  let categoryScore = 0;
  if (resource.category_id === req.category_id) {
    categoryScore = 40;
    explanations.push('Exact category match');
  }

  // Specifications and name relevance (up to 30 points)
  const queryText = `${req.requirement_name} ${req.specifications || ''}`;
  const targetText = `${resource.title} ${resource.description} ${resource.model_or_specs || ''}`;
  const { score: specsScore, matchedWords } = calculateTextRelevance(queryText, targetText);
  if (matchedWords.length > 0) {
    explanations.push(`Matched specs: ${matchedWords.slice(0, 3).join(', ')}`);
  }

  // Location match (up to 20 points)
  let locationScore = 10;
  const isCityMatch =
    resource.location_city.trim().toLowerCase() === event.location_city.trim().toLowerCase();
  if (isCityMatch) {
    locationScore = 20;
    explanations.push(`Local provider in ${resource.location_city}`);
  } else {
    explanations.push(`Regional provider (${resource.location_city})`);
  }

  // Budget fit (up to 10 points)
  let budgetScore = 10;
  if (req.max_unit_budget_cents && req.max_unit_budget_cents > 0) {
    if (resource.price_per_day_cents <= req.max_unit_budget_cents) {
      budgetScore = 10;
      explanations.push('Within target unit budget');
    } else {
      const excessPercent = Math.round(
        ((resource.price_per_day_cents - req.max_unit_budget_cents) / req.max_unit_budget_cents) * 100
      );
      budgetScore = Math.max(0, 10 - Math.min(10, Math.floor(excessPercent / 10)));
      explanations.push(`Exceeds target budget by ${excessPercent}%`);
    }
  }

  // Quantity fit
  if (availableQuantity >= req.required_quantity) {
    explanations.push(`Full required quantity available (${availableQuantity}/${req.required_quantity})`);
  } else if (availableQuantity > 0) {
    explanations.push(`Partial quantity available (${availableQuantity}/${req.required_quantity})`);
  } else {
    explanations.push('Unavailable or fully booked on event dates');
  }

  const totalScore = categoryScore + specsScore + locationScore + budgetScore;
  const totalForDurationCents = calculateLineSubtotalCents(
    resource.price_per_day_cents,
    Math.min(availableQuantity, req.required_quantity),
    rentalDays
  );

  const breakdown: MatchScoreBreakdown = {
    categoryScore,
    specsScore,
    quantityScore: availableQuantity >= req.required_quantity ? 100 : Math.round((availableQuantity / req.required_quantity) * 100),
    locationScore,
    budgetScore,
    totalScore: Math.min(100, totalScore),
    explanations,
  };

  return {
    resource,
    availableQuantity,
    scoreBreakdown: breakdown,
    dailyPriceCents: resource.price_per_day_cents,
    totalForDurationCents,
  };
}

/**
 * Core Matching Algorithm for an Event Plan
 * Evaluates every requirement, performs deterministic allocation across single or multiple providers,
 * detects market shortages, and calculates combined financial summaries.
 */
export function matchEventResources(
  event: EventPlan,
  requirements: EventRequirement[],
  allResources: Resource[],
  blackouts: ResourceBlackout[] = [],
  bookings: BookingRequest[] = [],
  customSelections?: SelectedAllocation[]
): PlanEvaluation {
  const rentalDays = calculateRentalDays(event.start_date, event.end_date);
  const requirementResults: RequirementMatchResult[] = [];
  const allAllocations: SelectedAllocation[] = [];

  // Track remaining inventory used within this evaluation across multiple requirements
  const inventoryUsageMap = new Map<string, number>();

  for (const req of requirements) {
    // 1. Find all resources in the requested category
    const categoryResources = allResources.filter((r) => r.category_id === req.category_id);

    // 2. Score candidates and compute dynamic remaining availability
    const candidates: CandidateResource[] = [];
    for (const res of categoryResources) {
      const baseAvailable = calculateResourceAvailability(
        res,
        event.start_date,
        event.end_date,
        blackouts,
        bookings
      );
      const alreadyAllocated = inventoryUsageMap.get(res.id) || 0;
      const netAvailable = Math.max(0, baseAvailable - alreadyAllocated);

      if (netAvailable > 0) {
        const scored = scoreResource(res, req, event, rentalDays, netAvailable);
        candidates.push(scored);
      }
    }

    // Sort candidates:
    // First by totalScore (descending), then by dailyPriceCents (ascending for cost efficiency)
    candidates.sort((a, b) => {
      if (b.scoreBreakdown.totalScore !== a.scoreBreakdown.totalScore) {
        return b.scoreBreakdown.totalScore - a.scoreBreakdown.totalScore;
      }
      return a.dailyPriceCents - b.dailyPriceCents;
    });

    // Single-provider candidates that can cover the full requirement
    const singleProviderOptions = candidates.filter(
      (c) => c.availableQuantity >= req.required_quantity
    );

    // If custom manual selections are provided for this requirement, use those;
    // otherwise run the deterministic auto-allocation algorithm:
    const reqAllocations: SelectedAllocation[] = [];
    let allocatedCount = 0;

    const manualForReq = customSelections?.filter((s) => s.requirementId === req.id);
    if (manualForReq && manualForReq.length > 0) {
      for (const sel of manualForReq) {
        reqAllocations.push(sel);
        allocatedCount += sel.allocatedQuantity;
        inventoryUsageMap.set(
          sel.resourceId,
          (inventoryUsageMap.get(sel.resourceId) || 0) + sel.allocatedQuantity
        );
      }
    } else {
      // Deterministic auto-allocation:
      // Prefer the best single provider if one matches very well (score >= 65);
      // otherwise greedily combine across top candidates.
      if (singleProviderOptions.length > 0 && singleProviderOptions[0].scoreBreakdown.totalScore >= 65) {
        const best = singleProviderOptions[0];
        const count = req.required_quantity;
        const subtotal = calculateLineSubtotalCents(best.dailyPriceCents, count, rentalDays);

        reqAllocations.push({
          requirementId: req.id,
          requirementName: req.requirement_name,
          resourceId: best.resource.id,
          resourceTitle: best.resource.title,
          providerId: best.resource.provider_id,
          providerName: best.resource.provider?.full_name || 'Verified Provider',
          providerCompany: best.resource.provider?.company_name || 'Resource Partner',
          providerCity: best.resource.location_city,
          allocatedQuantity: count,
          dailyPriceCents: best.dailyPriceCents,
          rentalDays,
          subtotalCents: subtotal,
          resourceImage: best.resource.image_urls?.[0],
        });

        allocatedCount = count;
        inventoryUsageMap.set(
          best.resource.id,
          (inventoryUsageMap.get(best.resource.id) || 0) + count
        );
      } else {
        // Multi-provider greedy combination
        let remainingNeeded = req.required_quantity;
        for (const candidate of candidates) {
          if (remainingNeeded <= 0) break;
          const take = Math.min(candidate.availableQuantity, remainingNeeded);
          if (take > 0) {
            const subtotal = calculateLineSubtotalCents(candidate.dailyPriceCents, take, rentalDays);
            reqAllocations.push({
              requirementId: req.id,
              requirementName: req.requirement_name,
              resourceId: candidate.resource.id,
              resourceTitle: candidate.resource.title,
              providerId: candidate.resource.provider_id,
              providerName: candidate.resource.provider?.full_name || 'Verified Provider',
              providerCompany: candidate.resource.provider?.company_name || 'Resource Partner',
              providerCity: candidate.resource.location_city,
              allocatedQuantity: take,
              dailyPriceCents: candidate.dailyPriceCents,
              rentalDays,
              subtotalCents: subtotal,
              resourceImage: candidate.resource.image_urls?.[0],
            });
            remainingNeeded -= take;
            allocatedCount += take;
            inventoryUsageMap.set(
              candidate.resource.id,
              (inventoryUsageMap.get(candidate.resource.id) || 0) + take
            );
          }
        }
      }
    }

    const shortageQuantity = Math.max(0, req.required_quantity - allocatedCount);
    let status: RequirementMatchResult['status'] = 'unfulfilled';
    let shortageNote: string | null = null;

    if (allocatedCount === 0) {
      status = 'unfulfilled';
      shortageNote = `No inventory available in "${req.category?.name || 'Category'}" for ${event.start_date} to ${event.end_date}. Shortage: ${req.required_quantity} units.`;
    } else if (shortageQuantity > 0) {
      status = 'partially_matched';
      shortageNote = `Partial availability: allocated ${allocatedCount} of ${req.required_quantity} units. Shortage of ${shortageQuantity} units across providers.`;
    } else if (reqAllocations.length > 1) {
      status = 'fully_matched_combined';
    } else {
      status = 'fully_matched_single';
    }

    // Alternative options (e.g. nearby candidates not chosen)
    const alternativeOptions = candidates
      .filter((c) => !reqAllocations.some((a) => a.resourceId === c.resource.id))
      .slice(0, 3);

    requirementResults.push({
      requirement: req,
      status,
      requiredQuantity: req.required_quantity,
      allocatedQuantity: allocatedCount,
      shortageQuantity,
      rentalDays,
      singleProviderOptions,
      allocations: reqAllocations,
      shortageNote,
      alternativeOptions,
    });

    allAllocations.push(...reqAllocations);
  }

  // 3. Group allocations by provider (for multi-provider booking split)
  const providerSplits: Record<string, ProviderSplitSummary> = {};
  for (const alloc of allAllocations) {
    if (!providerSplits[alloc.providerId]) {
      providerSplits[alloc.providerId] = {
        providerId: alloc.providerId,
        providerName: alloc.providerName,
        providerCompany: alloc.providerCompany,
        providerCity: alloc.providerCity,
        items: [],
        totalAmountCents: 0,
      };
    }
    providerSplits[alloc.providerId].items.push(alloc);
    providerSplits[alloc.providerId].totalAmountCents += alloc.subtotalCents;
  }

  // 4. Financial and fulfillment calculations
  const totalEstimatedCostCents = allAllocations.reduce((sum, a) => sum + a.subtotalCents, 0);
  const budgetCents = event.budget_cents;
  const budgetDeltaCents = budgetCents - totalEstimatedCostCents;
  const isOverBudget = budgetDeltaCents < 0;
  const budgetUtilizationPercent =
    budgetCents > 0 ? Math.round((totalEstimatedCostCents / budgetCents) * 100) : 0;

  const totalRequiredUnits = requirements.reduce((sum, r) => sum + r.required_quantity, 0);
  const totalAllocatedUnits = allAllocations.reduce((sum, a) => sum + a.allocatedQuantity, 0);
  const totalShortageUnits = Math.max(0, totalRequiredUnits - totalAllocatedUnits);
  const fulfillmentPercent =
    totalRequiredUnits > 0 ? Math.round((totalAllocatedUnits / totalRequiredUnits) * 100) : 100;

  return {
    event,
    rentalDays,
    requirementResults,
    allAllocations,
    providerSplits,
    totalEstimatedCostCents,
    budgetCents,
    budgetDeltaCents,
    isOverBudget,
    budgetUtilizationPercent,
    totalRequiredUnits,
    totalAllocatedUnits,
    totalShortageUnits,
    fulfillmentPercent,
  };
}
