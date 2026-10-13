// ============================================================================
// ReVento - Database & Application Types
// ============================================================================

export type UserRole = 'organizer' | 'provider' | 'both';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  company_name: string | null;
  phone: string | null;
  city: string;
  address: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  created_at: string;
}

export interface Resource {
  id: string;
  provider_id: string;
  category_id: string;
  title: string;
  description: string;
  model_or_specs: string | null;
  total_quantity: number;
  price_per_day_cents: number; // Stored in integer cents/paise (e.g. 450000 = ₹4,500.00)
  location_city: string;
  location_state: string | null;
  location_pincode: string | null;
  image_urls: string[];
  is_available: boolean;
  is_seed: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  provider?: Profile;
  category?: Category;
}

export interface ResourceBlackout {
  id: string;
  resource_id: string;
  start_date: string;
  end_date: string;
  quantity_blocked: number;
  reason: string | null;
  created_at: string;
}

export type EventStatus = 'draft' | 'planning' | 'requests_sent' | 'finalized' | 'archived';

export interface EventPlan {
  id: string;
  organizer_id: string;
  name: string;
  event_type: string;
  location_city: string;
  venue_name: string | null;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  attendee_count: number;
  budget_cents: number; // Stored in cents/paise
  status: EventStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  requirements?: EventRequirement[];
  selections?: ResourceSelection[];
}

export interface EventRequirement {
  id: string;
  event_id: string;
  category_id: string;
  requirement_name: string;
  specifications: string | null;
  required_quantity: number;
  max_unit_budget_cents: number | null;
  created_at: string;
  // Joined fields
  category?: Category;
}

export interface ResourceSelection {
  id: string;
  event_id: string;
  requirement_id: string;
  resource_id: string;
  provider_id: string;
  allocated_quantity: number;
  daily_price_cents: number;
  rental_days: number;
  subtotal_cents: number;
  created_at: string;
  // Joined fields
  resource?: Resource;
  provider?: Profile;
}

export type BookingStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed';

export interface BookingRequest {
  id: string;
  request_number: string;
  event_id: string;
  organizer_id: string;
  provider_id: string;
  status: BookingStatus;
  start_date: string;
  end_date: string;
  total_amount_cents: number;
  organizer_notes: string | null;
  provider_notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  event?: EventPlan;
  organizer?: Profile;
  provider?: Profile;
  items?: BookingRequestItem[];
}

export interface BookingRequestItem {
  id: string;
  booking_request_id: string;
  resource_id: string;
  requirement_id: string | null;
  quantity: number;
  daily_price_cents: number;
  rental_days: number;
  subtotal_cents: number;
  created_at: string;
  // Joined fields
  resource?: Resource;
  requirement?: EventRequirement;
}
