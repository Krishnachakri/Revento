-- ============================================================================
-- ReVento: Initial Database Schema
-- B2B Event Resource Coordination Platform
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. Profiles (Organizers & Resource Providers)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('organizer', 'provider', 'both')),
    full_name TEXT NOT NULL,
    company_name TEXT,
    phone TEXT,
    city TEXT NOT NULL DEFAULT 'Bengaluru',
    address TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for searching and filtering profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);

-- ----------------------------------------------------------------------------
-- 2. Resource Categories
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- ----------------------------------------------------------------------------
-- 3. Resources (Equipment Inventory)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    model_or_specs TEXT,
    total_quantity INT NOT NULL CHECK (total_quantity > 0),
    price_per_day_cents BIGINT NOT NULL CHECK (price_per_day_cents >= 0),
    location_city TEXT NOT NULL,
    location_state TEXT,
    location_pincode TEXT,
    image_urls TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_seed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resources_provider ON public.resources(provider_id);
CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category_id);
CREATE INDEX IF NOT EXISTS idx_resources_city ON public.resources(location_city);
CREATE INDEX IF NOT EXISTS idx_resources_available ON public.resources(is_available);
CREATE INDEX IF NOT EXISTS idx_resources_seed ON public.resources(is_seed);

-- ----------------------------------------------------------------------------
-- 4. Resource Blackouts (Maintenance / Unavailable Windows)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resource_blackouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    quantity_blocked INT NOT NULL CHECK (quantity_blocked > 0),
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_blackout_dates CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_resource_blackouts_resource ON public.resource_blackouts(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_blackouts_dates ON public.resource_blackouts(start_date, end_date);

-- ----------------------------------------------------------------------------
-- 5. Events (Organizer Event Plans)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    location_city TEXT NOT NULL,
    venue_name TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    attendee_count INT NOT NULL CHECK (attendee_count > 0),
    budget_cents BIGINT NOT NULL CHECK (budget_cents > 0),
    status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('draft', 'planning', 'requests_sent', 'finalized', 'archived')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_event_dates CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_city ON public.events(location_city);
CREATE INDEX IF NOT EXISTS idx_events_dates ON public.events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);

-- ----------------------------------------------------------------------------
-- 6. Event Requirements (Organizer equipment specs & counts)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    requirement_name TEXT NOT NULL,
    specifications TEXT,
    required_quantity INT NOT NULL CHECK (required_quantity > 0),
    max_unit_budget_cents BIGINT CHECK (max_unit_budget_cents IS NULL OR max_unit_budget_cents >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_reqs_event ON public.event_requirements(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reqs_cat ON public.event_requirements(category_id);

-- ----------------------------------------------------------------------------
-- 7. Resource Selections (Allocated items in plan)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resource_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    requirement_id UUID NOT NULL REFERENCES public.event_requirements(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE RESTRICT,
    provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    allocated_quantity INT NOT NULL CHECK (allocated_quantity > 0),
    daily_price_cents BIGINT NOT NULL CHECK (daily_price_cents >= 0),
    rental_days INT NOT NULL CHECK (rental_days > 0),
    subtotal_cents BIGINT NOT NULL CHECK (subtotal_cents >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resource_selections_event ON public.resource_selections(event_id);
CREATE INDEX IF NOT EXISTS idx_resource_selections_req ON public.resource_selections(requirement_id);
CREATE INDEX IF NOT EXISTS idx_resource_selections_resource ON public.resource_selections(resource_id);

-- ----------------------------------------------------------------------------
-- 8. Booking Requests (Multi-Provider Split Requests)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.booking_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number TEXT NOT NULL UNIQUE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'completed')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_amount_cents BIGINT NOT NULL CHECK (total_amount_cents >= 0),
    organizer_notes TEXT,
    provider_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_booking_dates CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_bookings_event ON public.booking_requests(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_organizer ON public.booking_requests(organizer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON public.booking_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.booking_requests(start_date, end_date);

-- ----------------------------------------------------------------------------
-- 9. Booking Request Items
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.booking_request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_request_id UUID NOT NULL REFERENCES public.booking_requests(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE RESTRICT,
    requirement_id UUID REFERENCES public.event_requirements(id) ON DELETE SET NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    daily_price_cents BIGINT NOT NULL CHECK (daily_price_cents >= 0),
    rental_days INT NOT NULL CHECK (rental_days > 0),
    subtotal_cents BIGINT NOT NULL CHECK (subtotal_cents >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_items_request ON public.booking_request_items(booking_request_id);
CREATE INDEX IF NOT EXISTS idx_booking_items_resource ON public.booking_request_items(resource_id);

-- ----------------------------------------------------------------------------
-- 10. Database Functions & Triggers
-- ----------------------------------------------------------------------------

-- Function: Automatic user profile sync on Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        role,
        full_name,
        company_name,
        phone,
        city,
        avatar_url
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'role', 'organizer'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'company_name',
        NEW.raw_user_meta_data->>'phone',
        COALESCE(NEW.raw_user_meta_data->>'city', 'Bengaluru'),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Get real-time available quantity for a resource over a date range
CREATE OR REPLACE FUNCTION public.get_resource_available_quantity(
    p_resource_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS INT AS $$
DECLARE
    v_total INT;
    v_booked INT;
    v_blacked_out INT;
    v_available INT;
BEGIN
    -- Get base total quantity and availability flag
    SELECT total_quantity INTO v_total
    FROM public.resources
    WHERE id = p_resource_id AND is_available = true;

    IF NOT FOUND THEN
        RETURN 0;
    END IF;

    -- Calculate max overlapping booked quantity from accepted booking requests
    SELECT COALESCE(SUM(bri.quantity), 0) INTO v_booked
    FROM public.booking_request_items bri
    JOIN public.booking_requests br ON br.id = bri.booking_request_id
    WHERE bri.resource_id = p_resource_id
      AND br.status = 'accepted'
      AND br.start_date <= p_end_date
      AND br.end_date >= p_start_date;

    -- Calculate blacked out quantity
    SELECT COALESCE(SUM(quantity_blocked), 0) INTO v_blacked_out
    FROM public.resource_blackouts
    WHERE resource_id = p_resource_id
      AND start_date <= p_end_date
      AND end_date >= p_start_date;

    v_available := v_total - (v_booked + v_blacked_out);
    IF v_available < 0 THEN
        v_available := 0;
    END IF;

    RETURN v_available;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function: Accept booking request with concurrency lock and inventory re-check
CREATE OR REPLACE FUNCTION public.accept_booking_request(
    p_request_id UUID,
    p_provider_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_request RECORD;
    v_item RECORD;
    v_avail INT;
BEGIN
    -- Lock and retrieve request
    SELECT * INTO v_request
    FROM public.booking_requests
    WHERE id = p_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking request not found');
    END IF;

    IF v_request.provider_id != p_provider_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: you are not the provider for this request');
    END IF;

    IF v_request.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Request is no longer pending (current status: ' || v_request.status || ')');
    END IF;

    -- Re-verify availability for each item
    FOR v_item IN
        SELECT resource_id, quantity, (SELECT title FROM public.resources WHERE id = resource_id) as resource_title
        FROM public.booking_request_items
        WHERE booking_request_id = p_request_id
    LOOP
        v_avail := public.get_resource_available_quantity(
            v_item.resource_id,
            v_request.start_date,
            v_request.end_date
        );

        IF v_avail < v_item.quantity THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Insufficient inventory for "' || v_item.resource_title || '". Required: ' || v_item.quantity || ', Available: ' || v_avail
            );
        END IF;
    END LOOP;

    -- Update status to accepted
    UPDATE public.booking_requests
    SET status = 'accepted',
        provider_notes = COALESCE(p_notes, provider_notes),
        updated_at = now()
    WHERE id = p_request_id;

    RETURN jsonb_build_object('success', true, 'status', 'accepted');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 11. Row Level Security (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_blackouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_request_items ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone authenticated can view; Users can edit only their own
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Categories: Public read
CREATE POLICY "Categories are readable by everyone"
    ON public.categories FOR SELECT
    USING (true);

-- Resources: Public read, provider write
CREATE POLICY "Resources are readable by everyone"
    ON public.resources FOR SELECT
    USING (true);

CREATE POLICY "Providers can insert their own resources"
    ON public.resources FOR INSERT
    WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update their own resources"
    ON public.resources FOR UPDATE
    USING (auth.uid() = provider_id);

CREATE POLICY "Providers can delete their own resources"
    ON public.resources FOR DELETE
    USING (
        auth.uid() = provider_id
        AND NOT EXISTS (
            SELECT 1 FROM public.booking_request_items bri
            JOIN public.booking_requests br ON br.id = bri.booking_request_id
            WHERE bri.resource_id = resources.id
              AND br.status = 'accepted'
              AND br.end_date >= CURRENT_DATE
        )
    );

-- Resource Blackouts: Public read, resource owner write
CREATE POLICY "Resource blackouts are readable by everyone"
    ON public.resource_blackouts FOR SELECT
    USING (true);

CREATE POLICY "Providers can manage their own resource blackouts"
    ON public.resource_blackouts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.resources r
            WHERE r.id = resource_blackouts.resource_id
              AND r.provider_id = auth.uid()
        )
    );

-- Events: Organizers can manage only their own events
CREATE POLICY "Organizers can view their own events"
    ON public.events FOR SELECT
    USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can create events"
    ON public.events FOR INSERT
    WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their own events"
    ON public.events FOR UPDATE
    USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their own events"
    ON public.events FOR DELETE
    USING (auth.uid() = organizer_id);

-- Event Requirements: Event owner only
CREATE POLICY "Event owner can manage requirements"
    ON public.event_requirements FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.events e
            WHERE e.id = event_requirements.event_id
              AND e.organizer_id = auth.uid()
        )
    );

-- Resource Selections: Event owner only
CREATE POLICY "Event owner can manage selections"
    ON public.resource_selections FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.events e
            WHERE e.id = resource_selections.event_id
              AND e.organizer_id = auth.uid()
        )
    );

-- Booking Requests: Accessible by organizer OR provider
CREATE POLICY "Parties can view their booking requests"
    ON public.booking_requests FOR SELECT
    USING (auth.uid() = organizer_id OR auth.uid() = provider_id);

CREATE POLICY "Organizers can create booking requests"
    ON public.booking_requests FOR INSERT
    WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Parties can update booking requests according to role"
    ON public.booking_requests FOR UPDATE
    USING (auth.uid() = organizer_id OR auth.uid() = provider_id);

-- Booking Request Items: Accessible by request organizer or provider
CREATE POLICY "Parties can view booking items"
    ON public.booking_request_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.booking_requests br
            WHERE br.id = booking_request_items.booking_request_id
              AND (br.organizer_id = auth.uid() OR br.provider_id = auth.uid())
        )
    );

CREATE POLICY "Organizers can create booking items"
    ON public.booking_request_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.booking_requests br
            WHERE br.id = booking_request_items.booking_request_id
              AND br.organizer_id = auth.uid()
        )
    );
