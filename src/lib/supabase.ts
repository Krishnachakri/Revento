// ============================================================================
// ReVento - Supabase Client & Data Access Layer
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import {
  BookingRequest,
  BookingStatus,
  Category,
  EventPlan,
  EventRequirement,
  Profile,
  Resource,
  ResourceBlackout,
  ResourceSelection,
  UserRole,
} from '../types/database';
import {
  INITIAL_BOOKINGS,
  INITIAL_CATEGORIES,
  INITIAL_EVENTS,
  INITIAL_EVENT_REQUIREMENTS,
  INITIAL_PROFILES,
  INITIAL_RESOURCES,
  getLocalStore,
  setLocalStore,
} from './storageFallback';
import { SelectedAllocation } from '../types/matching';
import { calculateRentalDays } from './currency';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Detect if real Supabase environment variables are provided
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('placeholder')
);

// Instantiate Supabase client (fallback to dummy url if not configured to prevent crash during import)
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder-revento.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key'
);

// ============================================================================
// DATA ACCESS LAYER (Hybrid: Supabase PostgreSQL with local persistent fallback)
// ============================================================================

// --- 1. Categories ---
export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) return data;
    } catch (err) {
      console.warn('Supabase getCategories error, falling back to local store:', err);
    }
  }
  return getLocalStore('categories', INITIAL_CATEGORIES);
}

// --- 2. Resources (Marketplace & Inventory) ---
export async function getResources(filter?: {
  categoryId?: string;
  city?: string;
  providerId?: string;
  search?: string;
}): Promise<Resource[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('resources').select(`
        *,
        provider:profiles(*),
        category:categories(*)
      `);

      if (filter?.categoryId) query = query.eq('category_id', filter.categoryId);
      if (filter?.city) query = query.ilike('location_city', `%${filter.city}%`);
      if (filter?.providerId) query = query.eq('provider_id', filter.providerId);
      if (filter?.search) {
        query = query.or(
          `title.ilike.%${filter.search}%,description.ilike.%${filter.search}%,model_or_specs.ilike.%${filter.search}%`
        );
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase getResources error, falling back:', err);
    }
  }

  // Local fallback
  const all = getLocalStore<Resource[]>('resources', INITIAL_RESOURCES);
  const profiles = getLocalStore<Profile[]>('profiles', INITIAL_PROFILES);
  const categories = getLocalStore<Category[]>('categories', INITIAL_CATEGORIES);

  // Attach joins
  const enriched = all.map((r) => ({
    ...r,
    provider: profiles.find((p) => p.id === r.provider_id),
    category: categories.find((c) => c.id === r.category_id),
  }));

  return enriched.filter((r) => {
    if (filter?.categoryId && r.category_id !== filter.categoryId) return false;
    if (
      filter?.city &&
      !r.location_city.toLowerCase().includes(filter.city.toLowerCase().trim())
    )
      return false;
    if (filter?.providerId && r.provider_id !== filter.providerId) return false;
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      const match =
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.model_or_specs && r.model_or_specs.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });
}

export async function getResourceById(id: string): Promise<Resource | null> {
  const list = await getResources();
  return list.find((r) => r.id === id) || null;
}

export async function createResource(
  resource: Omit<Resource, 'id' | 'created_at' | 'updated_at' | 'is_seed'>
): Promise<Resource> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert({
          ...resource,
          is_seed: false,
        })
        .select()
        .single();
      if (!error && data) return data;
      if (error) throw error;
    } catch (err) {
      console.error('Supabase createResource error:', err);
      throw err;
    }
  }

  // Local store
  const all = getLocalStore<Resource[]>('resources', INITIAL_RESOURCES);
  const newRes: Resource = {
    ...resource,
    id: 'res-' + Math.random().toString(36).substring(2, 9),
    is_seed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  all.unshift(newRes);
  setLocalStore('resources', all);
  return newRes;
}

export async function updateResource(
  id: string,
  updates: Partial<Omit<Resource, 'id' | 'provider_id' | 'created_at'>>
): Promise<Resource> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('resources')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data;
      if (error) throw error;
    } catch (err) {
      console.error('Supabase updateResource error:', err);
      throw err;
    }
  }

  const all = getLocalStore<Resource[]>('resources', INITIAL_RESOURCES);
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('Resource not found');
  const updated: Resource = {
    ...all[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  all[idx] = updated;
  setLocalStore('resources', all);
  return updated;
}

export async function deleteResource(id: string, providerId: string): Promise<boolean> {
  // Check active booking safety
  const bookings = await getBookingRequests();
  const hasActiveBooking = bookings.some(
    (b) =>
      b.status === 'accepted' &&
      new Date(b.end_date) >= new Date() &&
      b.items?.some((item) => item.resource_id === id)
  );

  if (hasActiveBooking) {
    throw new Error('Cannot delete equipment with active or confirmed upcoming bookings.');
  }

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id)
        .eq('provider_id', providerId);
      if (!error) return true;
      if (error) throw error;
    } catch (err) {
      console.error('Supabase deleteResource error:', err);
      throw err;
    }
  }

  const all = getLocalStore<Resource[]>('resources', INITIAL_RESOURCES);
  const filtered = all.filter((r) => r.id !== id);
  setLocalStore('resources', filtered);
  return true;
}

// Upload image to Supabase Storage 'resource-images'
export async function uploadResourceImage(file: File): Promise<string> {
  if (isSupabaseConfigured) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 12)}_${Date.now()}.${fileExt}`;
      const filePath = `listings/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resource-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('resource-images').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.warn('Supabase storage upload failed, creating local object URL:', err);
    }
  }

  // Fallback: convert file to data URL for preview/mock
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

// --- 3. Events & Requirements ---
export async function getEventsByOrganizer(organizerId: string): Promise<EventPlan[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          requirements:event_requirements(*),
          selections:resource_selections(*)
        `)
        .eq('organizer_id', organizerId)
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase getEventsByOrganizer error, falling back:', err);
    }
  }

  const events = getLocalStore<EventPlan[]>('events', INITIAL_EVENTS);
  const reqs = getLocalStore<EventRequirement[]>('event_requirements', INITIAL_EVENT_REQUIREMENTS);
  const selections = getLocalStore<ResourceSelection[]>('resource_selections', []);

  return events
    .filter((e) => e.organizer_id === organizerId)
    .map((e) => ({
      ...e,
      requirements: reqs.filter((r) => r.event_id === e.id),
      selections: selections.filter((s) => s.event_id === e.id),
    }));
}

export async function getEventById(id: string): Promise<EventPlan | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          requirements:event_requirements(*, category:categories(*)),
          selections:resource_selections(*, resource:resources(*))
        `)
        .eq('id', id)
        .single();
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase getEventById error, falling back:', err);
    }
  }

  const events = getLocalStore<EventPlan[]>('events', INITIAL_EVENTS);
  const target = events.find((e) => e.id === id);
  if (!target) return null;

  const reqs = getLocalStore<EventRequirement[]>('event_requirements', INITIAL_EVENT_REQUIREMENTS);
  const categories = getLocalStore<Category[]>('categories', INITIAL_CATEGORIES);
  const selections = getLocalStore<ResourceSelection[]>('resource_selections', []);

  return {
    ...target,
    requirements: reqs
      .filter((r) => r.event_id === target.id)
      .map((r) => ({ ...r, category: categories.find((c) => c.id === r.category_id) })),
    selections: selections.filter((s) => s.event_id === target.id),
  };
}

export async function saveEventPlan(
  eventData: Omit<EventPlan, 'id' | 'created_at' | 'updated_at'>,
  requirements: Omit<EventRequirement, 'id' | 'event_id' | 'created_at'>[],
  eventId?: string
): Promise<EventPlan> {
  if (isSupabaseConfigured) {
    try {
      let savedEventId = eventId;
      if (!savedEventId) {
        const { data: newEvt, error: errEvt } = await supabase
          .from('events')
          .insert(eventData)
          .select()
          .single();
        if (errEvt) throw errEvt;
        savedEventId = newEvt.id;
      } else {
        const { error: errUpd } = await supabase
          .from('events')
          .update({
            ...eventData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', savedEventId);
        if (errUpd) throw errUpd;

        // Delete existing requirements to replace with updated list
        await supabase.from('event_requirements').delete().eq('event_id', savedEventId);
      }

      // Insert requirements
      if (requirements.length > 0) {
        const rows = requirements.map((r) => ({
          ...r,
          event_id: savedEventId,
        }));
        const { error: errReq } = await supabase.from('event_requirements').insert(rows);
        if (errReq) throw errReq;
      }

      const complete = await getEventById(savedEventId!);
      if (complete) return complete;
    } catch (err) {
      console.warn('Supabase saveEventPlan failed, storing locally:', err);
    }
  }

  // Local store
  const events = getLocalStore<EventPlan[]>('events', INITIAL_EVENTS);
  let allReqs = getLocalStore<EventRequirement[]>('event_requirements', INITIAL_EVENT_REQUIREMENTS);

  let finalId = eventId;
  let finalEvent: EventPlan;

  if (eventId) {
    const idx = events.findIndex((e) => e.id === eventId);
    if (idx !== -1) {
      finalEvent = {
        ...events[idx],
        ...eventData,
        updated_at: new Date().toISOString(),
      };
      events[idx] = finalEvent;
    } else {
      finalEvent = {
        ...eventData,
        id: eventId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      events.unshift(finalEvent);
    }
    // Remove old requirements for this event
    allReqs = allReqs.filter((r) => r.event_id !== eventId);
  } else {
    finalId = 'evt-' + Math.random().toString(36).substring(2, 9);
    finalEvent = {
      ...eventData,
      id: finalId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    events.unshift(finalEvent);
  }

  // Add new requirements
  const newReqObjects: EventRequirement[] = requirements.map((r) => ({
    ...r,
    id: 'req-' + Math.random().toString(36).substring(2, 9),
    event_id: finalId!,
    created_at: new Date().toISOString(),
  }));

  allReqs.push(...newReqObjects);

  setLocalStore('events', events);
  setLocalStore('event_requirements', allReqs);

  return {
    ...finalEvent,
    requirements: newReqObjects,
  };
}

// --- 4. Booking Requests & Workflow ---
export async function getBookingRequests(filter?: {
  organizerId?: string;
  providerId?: string;
}): Promise<BookingRequest[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('booking_requests').select(`
        *,
        event:events(*),
        organizer:profiles!booking_requests_organizer_id_fkey(*),
        provider:profiles!booking_requests_provider_id_fkey(*),
        items:booking_request_items(*, resource:resources(*))
      `);

      if (filter?.organizerId) query = query.eq('organizer_id', filter.organizerId);
      if (filter?.providerId) query = query.eq('provider_id', filter.providerId);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase getBookingRequests error, falling back:', err);
    }
  }

  const bookings = getLocalStore<BookingRequest[]>('booking_requests', INITIAL_BOOKINGS);
  const profiles = getLocalStore<Profile[]>('profiles', INITIAL_PROFILES);
  const events = getLocalStore<EventPlan[]>('events', INITIAL_EVENTS);
  const resources = getLocalStore<Resource[]>('resources', INITIAL_RESOURCES);

  return bookings
    .filter((b) => {
      if (filter?.organizerId && b.organizer_id !== filter.organizerId) return false;
      if (filter?.providerId && b.provider_id !== filter.providerId) return false;
      return true;
    })
    .map((b) => ({
      ...b,
      organizer: profiles.find((p) => p.id === b.organizer_id),
      provider: profiles.find((p) => p.id === b.provider_id),
      event: events.find((e) => e.id === b.event_id),
      items: b.items?.map((item) => ({
        ...item,
        resource: resources.find((r) => r.id === item.resource_id),
      })),
    }));
}

/**
 * Submit Multi-Provider Booking Requests
 * Splits allocations by provider and creates separate BookingRequests and Items
 */
export async function submitMultiProviderBookingRequests(
  event: EventPlan,
  allocations: SelectedAllocation[],
  organizerId: string,
  notes?: string
): Promise<BookingRequest[]> {
  // Group allocations by provider
  const groupedByProvider = new Map<string, SelectedAllocation[]>();
  for (const a of allocations) {
    const list = groupedByProvider.get(a.providerId) || [];
    list.push(a);
    groupedByProvider.set(a.providerId, list);
  }

  const createdRequests: BookingRequest[] = [];
  const rentalDays = calculateRentalDays(event.start_date, event.end_date);

  for (const [providerId, items] of groupedByProvider.entries()) {
    const totalAmount = items.reduce((sum, item) => sum + item.subtotalCents, 0);
    const reqNumber = `REQ-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 899 + 100)}`;

    if (isSupabaseConfigured) {
      try {
        const { data: bReq, error: bErr } = await supabase
          .from('booking_requests')
          .insert({
            request_number: reqNumber,
            event_id: event.id,
            organizer_id: organizerId,
            provider_id: providerId,
            status: 'pending',
            start_date: event.start_date,
            end_date: event.end_date,
            total_amount_cents: totalAmount,
            organizer_notes: notes || null,
          })
          .select()
          .single();

        if (bErr) throw bErr;

        const itemRows = items.map((i) => ({
          booking_request_id: bReq.id,
          resource_id: i.resourceId,
          requirement_id: i.requirementId || null,
          quantity: i.allocatedQuantity,
          daily_price_cents: i.dailyPriceCents,
          rental_days: rentalDays,
          subtotal_cents: i.subtotalCents,
        }));

        await supabase.from('booking_request_items').insert(itemRows);
        createdRequests.push(bReq);
        continue;
      } catch (err) {
        console.warn('Supabase booking creation failed, using local store:', err);
      }
    }

    // Local store fallback
    const allBookings = getLocalStore<BookingRequest[]>('booking_requests', INITIAL_BOOKINGS);
    const bookingId = 'bk-' + Math.random().toString(36).substring(2, 9);
    const newBooking: BookingRequest = {
      id: bookingId,
      request_number: reqNumber,
      event_id: event.id,
      organizer_id: organizerId,
      provider_id: providerId,
      status: 'pending',
      start_date: event.start_date,
      end_date: event.end_date,
      total_amount_cents: totalAmount,
      organizer_notes: notes || null,
      provider_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: items.map((i) => ({
        id: 'bki-' + Math.random().toString(36).substring(2, 9),
        booking_request_id: bookingId,
        resource_id: i.resourceId,
        requirement_id: i.requirementId || null,
        quantity: i.allocatedQuantity,
        daily_price_cents: i.dailyPriceCents,
        rental_days: rentalDays,
        subtotal_cents: i.subtotalCents,
        created_at: new Date().toISOString(),
      })),
    };

    allBookings.unshift(newBooking);
    setLocalStore('booking_requests', allBookings);
    createdRequests.push(newBooking);
  }

  // Update event status to 'requests_sent'
  await updateEventStatus(event.id, 'requests_sent');

  return createdRequests;
}

export async function updateEventStatus(eventId: string, status: EventPlan['status']): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('events').update({ status, updated_at: new Date().toISOString() }).eq('id', eventId);
    } catch (err) {
      console.warn('Supabase updateEventStatus error:', err);
    }
  }

  const events = getLocalStore<EventPlan[]>('events', INITIAL_EVENTS);
  const target = events.find((e) => e.id === eventId);
  if (target) {
    target.status = status;
    target.updated_at = new Date().toISOString();
    setLocalStore('events', events);
  }
}

/**
 * Provider responds: Accepts or Declines booking request
 * When accepting, re-verifies date availability and inventory!
 */
export async function updateBookingRequestStatus(
  requestId: string,
  providerId: string,
  newStatus: BookingStatus,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured) {
    try {
      if (newStatus === 'accepted') {
        // Use RPC with server-side atomic inventory re-check
        const { data, error } = await supabase.rpc('accept_booking_request', {
          p_request_id: requestId,
          p_provider_id: providerId,
          p_notes: notes || null,
        });
        if (error) throw error;
        if (data && !data.success) return { success: false, error: data.error };
        return { success: true };
      } else {
        const { error } = await supabase
          .from('booking_requests')
          .update({
            status: newStatus,
            provider_notes: notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', requestId)
          .eq('provider_id', providerId);
        if (error) throw error;
        return { success: true };
      }
    } catch (err: any) {
      console.warn('Supabase booking update error, falling back:', err);
      // Fall through to verify in local mode
    }
  }

  const allBookings = getLocalStore<BookingRequest[]>('booking_requests', INITIAL_BOOKINGS);
  const target = allBookings.find((b) => b.id === requestId);
  if (!target) return { success: false, error: 'Booking request not found' };

  if (target.provider_id !== providerId && newStatus !== 'cancelled') {
    return { success: false, error: 'Unauthorized to respond to this booking request' };
  }

  if (target.status !== 'pending' && newStatus !== 'cancelled') {
    return { success: false, error: `Request is already ${target.status}` };
  }

  if (newStatus === 'accepted') {
    // Inventory re-check: verify available quantity for all items
    const allResources = getLocalStore<Resource[]>('resources', INITIAL_RESOURCES);
    for (const item of target.items || []) {
      const res = allResources.find((r) => r.id === item.resource_id);
      if (!res) continue;

      // Calculate already booked quantity in other accepted bookings for the same date window
      const overlappingBooked = allBookings
        .filter((b) => b.id !== target.id && b.status === 'accepted')
        .filter((b) => {
          const bStart = new Date(b.start_date).getTime();
          const bEnd = new Date(b.end_date).getTime();
          const tStart = new Date(target.start_date).getTime();
          const tEnd = new Date(target.end_date).getTime();
          return bStart <= tEnd && bEnd >= tStart;
        })
        .reduce((sum, b) => {
          const matchingItem = b.items?.find((i) => i.resource_id === item.resource_id);
          return sum + (matchingItem ? matchingItem.quantity : 0);
        }, 0);

      const availableNow = res.total_quantity - overlappingBooked;
      if (availableNow < item.quantity) {
        return {
          success: false,
          error: `Insufficient inventory for "${res.title}". Requested: ${item.quantity}, currently available: ${availableNow}.`,
        };
      }
    }
  }

  target.status = newStatus;
  if (notes) {
    if (newStatus === 'cancelled') {
      target.organizer_notes = notes;
    } else {
      target.provider_notes = notes;
    }
  }
  target.updated_at = new Date().toISOString();
  setLocalStore('booking_requests', allBookings);

  return { success: true };
}

// --- 5. User Profiles ---
export async function getProfileById(userId: string): Promise<Profile | null> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase getProfileById error:', err);
    }
  }

  const profiles = getLocalStore<Profile[]>('profiles', INITIAL_PROFILES);
  return profiles.find((p) => p.id === userId) || null;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at'>>
): Promise<Profile> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();
      if (!error && data) return data;
      if (error) throw error;
    } catch (err) {
      console.error('Supabase updateProfile error:', err);
      throw err;
    }
  }

  const profiles = getLocalStore<Profile[]>('profiles', INITIAL_PROFILES);
  let target = profiles.find((p) => p.id === userId);
  if (!target) {
    target = {
      id: userId,
      role: updates.role || 'organizer',
      full_name: updates.full_name || 'User',
      company_name: updates.company_name || null,
      phone: updates.phone || null,
      city: updates.city || 'Bengaluru',
      address: updates.address || null,
      bio: updates.bio || null,
      avatar_url: updates.avatar_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    profiles.push(target);
  } else {
    Object.assign(target, updates, { updated_at: new Date().toISOString() });
  }
  setLocalStore('profiles', profiles);
  return target;
}
