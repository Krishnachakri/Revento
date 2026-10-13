// ============================================================================
// ReVento - Matching & Multi-Provider Plan Types
// ============================================================================

import { EventPlan, EventRequirement, Profile, Resource } from './database';

export interface MatchScoreBreakdown {
  categoryScore: number;     // 100 if matching category
  specsScore: number;        // Text match on specifications/model
  quantityScore: number;     // Ratio of available quantity to required
  locationScore: number;     // Same city match bonus
  budgetScore: number;       // Fit within unit budget
  totalScore: number;        // Weighted 0-100 score
  explanations: string[];    // Human-readable transparent explanation bullet points
}

export interface CandidateResource {
  resource: Resource;
  availableQuantity: number;
  scoreBreakdown: MatchScoreBreakdown;
  dailyPriceCents: number;
  totalForDurationCents: number;
}

export interface SelectedAllocation {
  requirementId: string;
  requirementName: string;
  resourceId: string;
  resourceTitle: string;
  providerId: string;
  providerName: string;
  providerCompany: string;
  providerCity: string;
  allocatedQuantity: number;
  dailyPriceCents: number;
  rentalDays: number;
  subtotalCents: number;
  resourceImage?: string;
}

export type RequirementFulfillmentStatus = 
  | 'fully_matched_single' 
  | 'fully_matched_combined' 
  | 'partially_matched' 
  | 'unfulfilled';

export interface RequirementMatchResult {
  requirement: EventRequirement;
  status: RequirementFulfillmentStatus;
  requiredQuantity: number;
  allocatedQuantity: number;
  shortageQuantity: number;
  rentalDays: number;
  
  // Single provider options that can cover full quantity (if any)
  singleProviderOptions: CandidateResource[];
  
  // Multi-provider combination chosen by deterministic algorithm
  allocations: SelectedAllocation[];
  
  // Shortage or alternative explanation
  shortageNote: string | null;
  alternativeOptions: CandidateResource[];
}

export interface ProviderSplitSummary {
  providerId: string;
  providerName: string;
  providerCompany: string;
  providerCity: string;
  items: SelectedAllocation[];
  totalAmountCents: number;
}

export interface PlanEvaluation {
  event: EventPlan;
  rentalDays: number;
  requirementResults: RequirementMatchResult[];
  allAllocations: SelectedAllocation[];
  providerSplits: Record<string, ProviderSplitSummary>;
  
  // Financial metrics
  totalEstimatedCostCents: number;
  budgetCents: number;
  budgetDeltaCents: number; // positive = under budget, negative = overrun
  isOverBudget: boolean;
  budgetUtilizationPercent: number;
  
  // Resource fulfillment metrics
  totalRequiredUnits: number;
  totalAllocatedUnits: number;
  totalShortageUnits: number;
  fulfillmentPercent: number;
}
