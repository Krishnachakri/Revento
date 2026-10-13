-- ============================================================================
-- ReVento: Seed Data Migration (Development & Demo Only)
-- All seed items are clearly flagged with is_seed = true
-- Uses standard RFC-4122 hexadecimal UUID format [0-9a-f]
-- ============================================================================

-- Ensure profiles can accept seed data without requiring auth.users entries
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 1. Insert Categories
INSERT INTO public.categories (id, name, slug, description, icon, display_order)
VALUES
    ('c1111111-1111-1111-1111-111111111101', 'Sound & Audio', 'sound-audio', 'Line array systems, digital consoles, microphones, stage monitors, and amplifiers', 'Volume2', 1),
    ('c1111111-1111-1111-1111-111111111102', 'Lighting & Visual FX', 'lighting-visual', 'Moving head beams, LED pars, follow spots, laser bars, and DMX lighting consoles', 'Sparkles', 2),
    ('c1111111-1111-1111-1111-111111111103', 'LED Screens & Displays', 'led-displays', 'High-res P2.6/P3.9 LED walls, laser projectors, confidence monitors, and video switchers', 'Monitor', 3),
    ('c1111111-1111-1111-1111-111111111104', 'Staging & Trussing', 'staging-trussing', 'Modular stage platforms, aluminum box trusses, rigging motors, and backdrops', 'Layers', 4),
    ('c1111111-1111-1111-1111-111111111105', 'Power & Generators', 'power-generators', 'Silent portable generators, 3-phase power distribution boxes, and heavy duty cables', 'Zap', 5),
    ('c1111111-1111-1111-1111-111111111106', 'Seating & Furniture', 'seating-furniture', 'Banquet chairs, executive lounge seating, bar stools, cocktail tables, and podiums', 'Armchair', 6),
    ('c1111111-1111-1111-1111-111111111107', 'Climate & Ventilation', 'climate-ventilation', 'Commercial misting fans, portable heavy-duty ACs, and outdoor heating towers', 'Wind', 7)
ON CONFLICT (id) DO NOTHING;

-- 2. Mock Provider Profiles for Development Seed
INSERT INTO public.profiles (id, role, full_name, company_name, phone, city, address, bio, avatar_url)
VALUES
    ('a1111111-1111-1111-1111-111111111101', 'provider', 'Karan Mehta', 'Apex Pro Audio & Staging', '+91 98201 12345', 'Bengaluru', 'Indiranagar 100ft Road', 'Premier B2B sound reinforcement and concert staging provider since 2018.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'),
    ('a1111111-1111-1111-1111-111111111102', 'provider', 'Priya Sundaram', 'Lumina Event Tech', '+91 98450 54321', 'Bengaluru', 'Koramangala 4th Block', 'Specialized in intelligent concert lighting, architectural washes, and DMX systems.', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'),
    ('a1111111-1111-1111-1111-111111111103', 'provider', 'Rajesh Verma', 'Optix Visual Displays', '+91 98110 67890', 'Mumbai', 'Andheri East MIDC', 'B2B rental house for indoor/outdoor LED video screens and presentation switchers.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'),
    ('a1111111-1111-1111-1111-111111111104', 'provider', 'Ananya Deshmukh', 'Sahara Stage & Power', '+91 99220 89123', 'Mumbai', 'Bandra Kurla Complex', 'Heavy-duty silent generators, mobile stages, and certified aluminum trussing.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'),
    ('a1111111-1111-1111-1111-111111111105', 'provider', 'Vikram Singh', 'Metro Seating Solutions', '+91 98100 23456', 'Delhi', 'Connaught Place', 'High-capacity corporate conference seating, lounge packages, and staging accessories.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Resources (Clearly marked with is_seed = true)
INSERT INTO public.resources (
    id, provider_id, category_id, title, description, model_or_specs,
    total_quantity, price_per_day_cents, location_city, location_state, location_pincode,
    image_urls, is_available, is_seed
)
VALUES
    -- Sound & Audio (Bengaluru)
    (
        'b1111111-1111-1111-1111-111111111101',
        'a1111111-1111-1111-1111-111111111101',
        'c1111111-1111-1111-1111-111111111101',
        '[Demo] JBL VTX A8 Compact Line Array Module',
        'Dual 8-inch compact line array loudspeaker for high-impact corporate galas and music events. Flown or ground-stacked.',
        'JBL VTX A8, 110-degree dispersion, 350W LF / 160W HF, NL4 connectors',
        12,
        450000, -- ₹4,500/day
        'Bengaluru', 'Karnataka', '560038',
        ARRAY['https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'],
        true, true
    ),
    (
        'b1111111-1111-1111-1111-111111111102',
        'a1111111-1111-1111-1111-111111111101',
        'c1111111-1111-1111-1111-111111111101',
        '[Demo] Shure Axient Digital Wireless Mic System (Quad)',
        'Four-channel wireless receiver with handheld Beta58A capsules, rechargeable battery sleds, and antenna distro.',
        'Shure AD4Q quad receiver + 4x AD2/B58 handheld transmitters, Dante enabled',
        6,
        600000, -- ₹6,000/day
        'Bengaluru', 'Karnataka', '560038',
        ARRAY['https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80'],
        true, true
    ),
    -- Lighting & Visual (Bengaluru)
    (
        'b1111111-1111-1111-1111-111111111103',
        'a1111111-1111-1111-1111-111111111102',
        'c1111111-1111-1111-1111-111111111102',
        '[Demo] Robe Pointe 280W Beam/Spot Hybrid Fixture',
        'Very bright and super-fast moving head fixture with sharp parallel beam and zoom prism effects.',
        'Osram Sirius HRI 280W, 2.5 - 20 degree zoom, DMX 512, PowerCON TRUE1',
        16,
        280000, -- ₹2,800/day
        'Bengaluru', 'Karnataka', '560095',
        ARRAY['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80'],
        true, true
    ),
    (
        'b1111111-1111-1111-1111-111111111104',
        'a1111111-1111-1111-1111-111111111102',
        'c1111111-1111-1111-1111-111111111102',
        '[Demo] Chauvet Professional WELL Fit Wireless Uplight',
        'Battery-powered RGBA LED uplight with built-in W-DMX wireless control and IP65 outdoor casing.',
        '4x 10W RGBA LEDs, 8-hour battery runtime at full output, wireless DMX',
        24,
        120000, -- ₹1,200/day
        'Bengaluru', 'Karnataka', '560095',
        ARRAY['https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80'],
        true, true
    ),
    -- LED Screens & Displays (Bengaluru / Mumbai)
    (
        'b1111111-1111-1111-1111-111111111105',
        'a1111111-1111-1111-1111-111111111103',
        'c1111111-1111-1111-1111-111111111103',
        '[Demo] Unilumin P2.6 Indoor Curved LED Video Panel (500x500mm)',
        'Ultra fine pitch rental LED display panel with 3840Hz refresh rate and magnetic front servicing.',
        'Pixel pitch 2.6mm, 1000 nits, NovaStar A8s receiving card, curve lock system',
        40,
        180000, -- ₹1,800/day per tile
        'Bengaluru', 'Karnataka', '560001',
        ARRAY['https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80'],
        true, true
    ),
    (
        'b1111111-1111-1111-1111-111111111106',
        'a1111111-1111-1111-1111-111111111103',
        'c1111111-1111-1111-1111-111111111103',
        '[Demo] Barco ClickShare & Analog Way Seamless 4K Switcher Kit',
        'Broadcast-grade 4K60 video presentation switcher with redundant power and multi-screen preview.',
        'Analog Way Pulse 4K, 8 inputs (HDMI/DP/12G-SDI), ultra-low latency',
        2,
        950000, -- ₹9,500/day
        'Mumbai', 'Maharashtra', '400069',
        ARRAY['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80'],
        true, true
    ),
    -- Staging & Trussing (Bengaluru / Mumbai)
    (
        'b1111111-1111-1111-1111-111111111107',
        'a1111111-1111-1111-1111-111111111104',
        'c1111111-1111-1111-1111-111111111104',
        '[Demo] Prolyte StageDex Modular Platform (2m x 1m) Deck',
        'Heavy-duty non-slip aluminum stage deck rated for 750 kg/m2 load. Includes telescopic legs (40-80cm).',
        '2m x 1m birch plywood with black anti-slip top, aluminum profile frame',
        30,
        150000, -- ₹1,500/day
        'Bengaluru', 'Karnataka', '560001',
        ARRAY['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'],
        true, true
    ),
    (
        'b1111111-1111-1111-1111-111111111108',
        'a1111111-1111-1111-1111-111111111104',
        'c1111111-1111-1111-1111-111111111104',
        '[Demo] Global Truss F34 Square Aluminum Truss (3-Meter)',
        'TUV-certified 290mm square aluminum box truss with conical couplers and safety pins.',
        'Main tube 50x2mm, braces 20x2mm, alloy EN-AW 6082 T6, weight 14.5 kg',
        20,
        90000, -- ₹900/day
        'Mumbai', 'Maharashtra', '400051',
        ARRAY['https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'],
        true, true
    ),
    -- Power & Generators (Bengaluru / Mumbai)
    (
        'b1111111-1111-1111-1111-111111111109',
        'a1111111-1111-1111-1111-111111111104',
        'c1111111-1111-1111-1111-111111111105',
        '[Demo] Cummins 125 kVA Acoustic Silent Diesel Generator',
        'Ultra-quiet sound attenuated diesel genset for sensitive audio/broadcast events. Includes 63A distro board.',
        '125 kVA prime power, 415V 3-phase, 68 dB(A) at 7m acoustic canopy',
        3,
        1800000, -- ₹18,000/day
        'Bengaluru', 'Karnataka', '560001',
        ARRAY['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
        true, true
    ),
    -- Seating & Furniture (Bengaluru / Delhi)
    (
        'b1111111-1111-1111-1111-111111111110',
        'a1111111-1111-1111-1111-111111111105',
        'c1111111-1111-1111-1111-111111111106',
        '[Demo] Ergonomic Executive Conference Banquet Chair',
        'Stackable premium cushioned chair in charcoal grey with brushed chrome frame for conferences and galas.',
        'High-density foam, steel frame, stackable up to 10 units, fire-retardant fabric',
        250,
        25000, -- ₹250/day per chair
        'Bengaluru', 'Karnataka', '560001',
        ARRAY['https://images.unsplash.com/photo-1580481077197-c81b63873400?auto=format&fit=crop&w=800&q=80'],
        true, true
    )
ON CONFLICT (id) DO NOTHING;
