import { describe, it, expect, beforeEach } from 'vitest';
import { calculateResourceAvailability } from '../src/lib/matchingEngine';
import { updateBookingRequestStatus } from '../src/lib/supabase';
import { BookingRequest, Resource, ResourceBlackout } from '../src/types/database';
import { setLocalStore } from '../src/lib/storageFallback';

describe('Booking Workflow & Inventory Safety', () => {
  const testResource: Resource = {
    id: 'res-inv-test',
    provider_id: 'prov-inv-1',
    category_id: 'cat-sound',
    title: 'High-Output Subwoofer',
    description: 'Dual 18-inch sub',
    model_or_specs: '2000W RMS',
    total_quantity: 10,
    price_per_day_cents: 300000,
    location_city: 'Bengaluru',
    location_state: 'Karnataka',
    location_pincode: '560001',
    image_urls: [],
    is_available: true,
    is_seed: false,
    created_at: '',
    updated_at: '',
  };

  it('deducts inventory when dates overlap with accepted bookings', () => {
    const overlappingAcceptedBooking: BookingRequest = {
      id: 'bk-1',
      request_number: 'REQ-001',
      event_id: 'evt-1',
      organizer_id: 'org-1',
      provider_id: 'prov-inv-1',
      status: 'accepted',
      start_date: '2026-11-20',
      end_date: '2026-11-22',
      total_amount_cents: 900000,
      organizer_notes: null,
      provider_notes: null,
      created_at: '',
      updated_at: '',
      items: [
        {
          id: 'item-1',
          booking_request_id: 'bk-1',
          resource_id: 'res-inv-test',
          requirement_id: null,
          quantity: 6, // 6 units booked
          daily_price_cents: 300000,
          rental_days: 3,
          subtotal_cents: 900000,
          created_at: '',
        },
      ],
    };

    // Query for same date window: total 10 - 6 booked = 4 remaining
    const avail = calculateResourceAvailability(
      testResource,
      '2026-11-20',
      '2026-11-22',
      [],
      [overlappingAcceptedBooking]
    );

    expect(avail).toBe(4);
  });

  it('does NOT deduct inventory for non-overlapping dates', () => {
    const futureBooking: BookingRequest = {
      id: 'bk-2',
      request_number: 'REQ-002',
      event_id: 'evt-2',
      organizer_id: 'org-2',
      provider_id: 'prov-inv-1',
      status: 'accepted',
      start_date: '2026-12-01',
      end_date: '2026-12-05',
      total_amount_cents: 1000000,
      organizer_notes: null,
      provider_notes: null,
      created_at: '',
      updated_at: '',
      items: [
        {
          id: 'item-2',
          booking_request_id: 'bk-2',
          resource_id: 'res-inv-test',
          requirement_id: null,
          quantity: 8,
          daily_price_cents: 300000,
          rental_days: 5,
          subtotal_cents: 1000000,
          created_at: '',
        },
      ],
    };

    // Query for November: December booking should not affect availability
    const avail = calculateResourceAvailability(
      testResource,
      '2026-11-20',
      '2026-11-22',
      [],
      [futureBooking]
    );

    expect(avail).toBe(10);
  });

  it('deducts inventory for scheduled maintenance blackout windows', () => {
    const maintenanceBlackout: ResourceBlackout = {
      id: 'blk-1',
      resource_id: 'res-inv-test',
      start_date: '2026-11-19',
      end_date: '2026-11-21',
      quantity_blocked: 3,
      reason: 'Scheduled driver recalibration',
      created_at: '',
    };

    const avail = calculateResourceAvailability(
      testResource,
      '2026-11-20',
      '2026-11-22',
      [maintenanceBlackout],
      []
    );

    expect(avail).toBe(7); // 10 total - 3 blocked = 7
  });

  it('prevents overlapping bookings from exceeding total capacity upon acceptance', async () => {
    // Setup test state in local store
    setLocalStore('resources', [testResource]);

    const acceptedBooking: BookingRequest = {
      id: 'bk-existing',
      request_number: 'REQ-EXISTING',
      event_id: 'evt-1',
      organizer_id: 'org-1',
      provider_id: 'prov-inv-1',
      status: 'accepted',
      start_date: '2026-11-20',
      end_date: '2026-11-22',
      total_amount_cents: 100000,
      organizer_notes: null,
      provider_notes: null,
      created_at: '',
      updated_at: '',
      items: [
        {
          id: 'item-exist',
          booking_request_id: 'bk-existing',
          resource_id: 'res-inv-test',
          requirement_id: null,
          quantity: 8, // 8 out of 10 booked
          daily_price_cents: 300000,
          rental_days: 3,
          subtotal_cents: 100000,
          created_at: '',
        },
      ],
    };

    const competingPendingRequest: BookingRequest = {
      id: 'bk-competing',
      request_number: 'REQ-COMPETING',
      event_id: 'evt-2',
      organizer_id: 'org-2',
      provider_id: 'prov-inv-1',
      status: 'pending',
      start_date: '2026-11-20',
      end_date: '2026-11-22',
      total_amount_cents: 100000,
      organizer_notes: null,
      provider_notes: null,
      created_at: '',
      updated_at: '',
      items: [
        {
          id: 'item-competing',
          booking_request_id: 'bk-competing',
          resource_id: 'res-inv-test',
          requirement_id: null,
          quantity: 4, // Needs 4, but only 2 available (10 - 8 = 2)
          daily_price_cents: 300000,
          rental_days: 3,
          subtotal_cents: 100000,
          created_at: '',
        },
      ],
    };

    setLocalStore('booking_requests', [acceptedBooking, competingPendingRequest]);

    // Provider tries to accept the competing request
    const result = await updateBookingRequestStatus(
      'bk-competing',
      'prov-inv-1',
      'accepted',
      'Accepted'
    );

    // Should be rejected due to insufficient inventory!
    expect(result.success).toBe(false);
    expect(result.error).toContain('Insufficient inventory');
  });

  it('rejects status changes from unauthorized users', async () => {
    const pendingRequest: BookingRequest = {
      id: 'bk-auth-test',
      request_number: 'REQ-AUTH',
      event_id: 'evt-1',
      organizer_id: 'org-1',
      provider_id: 'prov-legitimate',
      status: 'pending',
      start_date: '2026-11-20',
      end_date: '2026-11-22',
      total_amount_cents: 100000,
      organizer_notes: null,
      provider_notes: null,
      created_at: '',
      updated_at: '',
      items: [],
    };

    setLocalStore('booking_requests', [pendingRequest]);

    // Malicious user 'prov-hacker' attempts to accept prov-legitimate's request
    const result = await updateBookingRequestStatus(
      'bk-auth-test',
      'prov-hacker',
      'accepted'
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('Unauthorized');
  });
});
