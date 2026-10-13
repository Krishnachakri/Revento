import { describe, it, expect } from 'vitest';
import {
  matchEventResources,
  calculateResourceAvailability,
  scoreResource,
} from '../src/lib/matchingEngine';
import { EventPlan, EventRequirement, Resource } from '../src/types/database';

describe('Resource Matching Engine', () => {
  const dummyEvent: EventPlan = {
    id: 'evt-test-1',
    organizer_id: 'org-1',
    name: 'Tech Conference 2026',
    event_type: 'Conference',
    location_city: 'Bengaluru',
    venue_name: 'Main Hall',
    start_date: '2026-11-20',
    end_date: '2026-11-22', // 3 days
    attendee_count: 500,
    budget_cents: 50000000, // ₹5,00,000
    status: 'planning',
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const dummyResources: Resource[] = [
    {
      id: 'res-audio-a',
      provider_id: 'prov-1',
      category_id: 'cat-sound',
      title: 'JBL VTX A8 Line Array',
      description: 'Compact line array module',
      model_or_specs: 'VTX A8, 110 deg',
      total_quantity: 10,
      price_per_day_cents: 450000, // ₹4,500/day
      location_city: 'Bengaluru',
      location_state: 'Karnataka',
      location_pincode: '560001',
      image_urls: [],
      is_available: true,
      is_seed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      provider: {
        id: 'prov-1',
        role: 'provider',
        full_name: 'Apex Audio',
        company_name: 'Apex Pro',
        phone: null,
        city: 'Bengaluru',
        address: null,
        bio: null,
        avatar_url: null,
        created_at: '',
        updated_at: '',
      },
    },
    {
      id: 'res-audio-b',
      provider_id: 'prov-2',
      category_id: 'cat-sound',
      title: 'd&b audiotechnik V8 Loudspeaker',
      description: '3-way passive line array',
      model_or_specs: 'V8 80 deg',
      total_quantity: 8,
      price_per_day_cents: 500000, // ₹5,000/day
      location_city: 'Bengaluru',
      location_state: 'Karnataka',
      location_pincode: '560001',
      image_urls: [],
      is_available: true,
      is_seed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      provider: {
        id: 'prov-2',
        role: 'provider',
        full_name: 'Sahara Stage',
        company_name: 'Sahara Ltd',
        phone: null,
        city: 'Bengaluru',
        address: null,
        bio: null,
        avatar_url: null,
        created_at: '',
        updated_at: '',
      },
    },
  ];

  it('correctly matches a single provider when sufficient quantity exists', () => {
    const requirements: EventRequirement[] = [
      {
        id: 'req-1',
        event_id: 'evt-test-1',
        category_id: 'cat-sound',
        requirement_name: 'Line Array Loudspeakers',
        specifications: 'JBL compact line array',
        required_quantity: 8, // Provider A has 10
        max_unit_budget_cents: 500000,
        created_at: new Date().toISOString(),
      },
    ];

    const evaluation = matchEventResources(dummyEvent, requirements, dummyResources);

    expect(evaluation.fulfillmentPercent).toBe(100);
    expect(evaluation.requirementResults[0].status).toBe('fully_matched_single');
    expect(evaluation.allAllocations.length).toBe(1);
    expect(evaluation.allAllocations[0].resourceId).toBe('res-audio-a');
    expect(evaluation.allAllocations[0].allocatedQuantity).toBe(8);
  });

  it('greedily combines multiple providers when a single provider lacks sufficient quantity', () => {
    const requirements: EventRequirement[] = [
      {
        id: 'req-multi',
        event_id: 'evt-test-1',
        category_id: 'cat-sound',
        requirement_name: 'Line Array Modules',
        specifications: 'High output line array',
        required_quantity: 15, // Provider A has 10, Provider B has 8 -> Total 18 available
        max_unit_budget_cents: 600000,
        created_at: new Date().toISOString(),
      },
    ];

    const evaluation = matchEventResources(dummyEvent, requirements, dummyResources);

    expect(evaluation.fulfillmentPercent).toBe(100);
    expect(evaluation.requirementResults[0].status).toBe('fully_matched_combined');
    expect(evaluation.allAllocations.length).toBe(2);

    const totalAllocated = evaluation.allAllocations.reduce((sum, a) => sum + a.allocatedQuantity, 0);
    expect(totalAllocated).toBe(15);

    // Splits should be distributed between prov-1 and prov-2
    expect(Object.keys(evaluation.providerSplits).length).toBe(2);
  });

  it('detects and honestly flags market shortages when total inventory is insufficient', () => {
    const requirements: EventRequirement[] = [
      {
        id: 'req-shortage',
        event_id: 'evt-test-1',
        category_id: 'cat-sound',
        requirement_name: 'Stadium Line Array Modules',
        specifications: 'Array modules',
        required_quantity: 25, // Only 18 available in market (10 + 8)
        max_unit_budget_cents: 600000,
        created_at: new Date().toISOString(),
      },
    ];

    const evaluation = matchEventResources(dummyEvent, requirements, dummyResources);

    expect(evaluation.totalShortageUnits).toBe(7); // 25 needed - 18 allocated = 7 short
    expect(evaluation.requirementResults[0].status).toBe('partially_matched');
    expect(evaluation.requirementResults[0].shortageQuantity).toBe(7);
    expect(evaluation.requirementResults[0].shortageNote).toContain('Shortage of 7 units');
  });

  it('evaluates completely unfulfilled requirements honestly', () => {
    const requirements: EventRequirement[] = [
      {
        id: 'req-missing-cat',
        event_id: 'evt-test-1',
        category_id: 'cat-nonexistent',
        requirement_name: 'Laser Harp',
        specifications: 'Experimental lasers',
        required_quantity: 2,
        max_unit_budget_cents: null,
        created_at: new Date().toISOString(),
      },
    ];

    const evaluation = matchEventResources(dummyEvent, requirements, dummyResources);

    expect(evaluation.fulfillmentPercent).toBe(0);
    expect(evaluation.requirementResults[0].status).toBe('unfulfilled');
    expect(evaluation.requirementResults[0].allocatedQuantity).toBe(0);
    expect(evaluation.requirementResults[0].shortageQuantity).toBe(2);
  });
});
