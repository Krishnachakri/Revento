// ============================================================================
// ReVento - Initial Seed Data & Local Fallback Store
// Ensures seamless, instant end-to-end functionality in dev & testing
// ============================================================================

import {
  BookingRequest,
  Category,
  EventPlan,
  EventRequirement,
  Profile,
  Resource,
  ResourceBlackout,
  ResourceSelection,
} from '../types/database';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-sound',
    name: 'Sound & Audio',
    slug: 'sound-audio',
    description: 'Line array systems, digital consoles, microphones, stage monitors, and amplifiers',
    icon: 'Volume2',
    display_order: 1,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-lighting',
    name: 'Lighting & Visual FX',
    slug: 'lighting-visual',
    description: 'Moving head beams, LED pars, follow spots, laser bars, and DMX lighting consoles',
    icon: 'Sparkles',
    display_order: 2,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-displays',
    name: 'LED Screens & Displays',
    slug: 'led-displays',
    description: 'High-res P2.6/P3.9 LED walls, laser projectors, confidence monitors, and video switchers',
    icon: 'Monitor',
    display_order: 3,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-staging',
    name: 'Staging & Trussing',
    slug: 'staging-trussing',
    description: 'Modular stage platforms, aluminum box trusses, rigging motors, and backdrops',
    icon: 'Layers',
    display_order: 4,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-power',
    name: 'Power & Generators',
    slug: 'power-generators',
    description: 'Silent portable generators, 3-phase power distribution boxes, and heavy duty cables',
    icon: 'Zap',
    display_order: 5,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-seating',
    name: 'Seating & Furniture',
    slug: 'seating-furniture',
    description: 'Banquet chairs, executive lounge seating, bar stools, cocktail tables, and podiums',
    icon: 'Armchair',
    display_order: 6,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-climate',
    name: 'Climate & Ventilation',
    slug: 'climate-ventilation',
    description: 'Commercial misting fans, portable heavy-duty ACs, and outdoor heating towers',
    icon: 'Wind',
    display_order: 7,
    created_at: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'usr-organizer-demo',
    role: 'organizer',
    full_name: 'Aditi Sharma',
    company_name: 'Elevate Summits & Expos',
    phone: '+91 98450 11223',
    city: 'Bengaluru',
    address: 'Residency Road, Bengaluru Central',
    bio: 'Enterprise corporate event organizer handling annual summits, product launches, and industry conferences.',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'usr-provider-apex',
    role: 'provider',
    full_name: 'Karan Mehta',
    company_name: 'Apex Pro Audio & Staging',
    phone: '+91 98201 12345',
    city: 'Bengaluru',
    address: 'Indiranagar 100ft Road',
    bio: 'Premier B2B sound reinforcement and concert staging provider since 2018.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    created_at: '2026-01-05T09:00:00Z',
    updated_at: '2026-01-05T09:00:00Z',
  },
  {
    id: 'usr-provider-lumina',
    role: 'provider',
    full_name: 'Priya Sundaram',
    company_name: 'Lumina Event Tech',
    phone: '+91 98450 54321',
    city: 'Bengaluru',
    address: 'Koramangala 4th Block',
    bio: 'Specialized in intelligent concert lighting, architectural washes, and DMX systems.',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    created_at: '2026-01-06T11:00:00Z',
    updated_at: '2026-01-06T11:00:00Z',
  },
  {
    id: 'usr-provider-optix',
    role: 'provider',
    full_name: 'Rajesh Verma',
    company_name: 'Optix Visual Displays',
    phone: '+91 98110 67890',
    city: 'Mumbai',
    address: 'Andheri East MIDC',
    bio: 'B2B rental house for indoor/outdoor LED video screens and presentation switchers.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    created_at: '2026-01-07T12:00:00Z',
    updated_at: '2026-01-07T12:00:00Z',
  },
  {
    id: 'usr-provider-sahara',
    role: 'provider',
    full_name: 'Ananya Deshmukh',
    company_name: 'Sahara Stage & Power',
    phone: '+91 99220 89123',
    city: 'Bengaluru',
    address: 'Electronic City Phase 1',
    bio: 'Heavy-duty silent generators, mobile stages, and certified aluminum trussing.',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    created_at: '2026-01-08T14:00:00Z',
    updated_at: '2026-01-08T14:00:00Z',
  },
  {
    id: 'usr-provider-metro',
    role: 'provider',
    full_name: 'Vikram Singh',
    company_name: 'Metro Seating Solutions',
    phone: '+91 98100 23456',
    city: 'Bengaluru',
    address: 'Whitefield Main Road',
    bio: 'High-capacity corporate conference seating, banquet packages, and staging furniture.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    created_at: '2026-01-09T15:00:00Z',
    updated_at: '2026-01-09T15:00:00Z',
  },
];

export const INITIAL_RESOURCES: Resource[] = [
  // Sound & Audio (Bengaluru)
  {
    id: 'res-jbl-vtx',
    provider_id: 'usr-provider-apex',
    category_id: 'cat-sound',
    title: '[Demo] JBL VTX A8 Compact Line Array Module',
    description: 'Dual 8-inch compact line array loudspeaker for high-impact corporate galas and music events. Flown or ground-stacked with pristine vocal clarity.',
    model_or_specs: 'JBL VTX A8, 110° dispersion, 350W LF / 160W HF, NL4 connectors',
    total_quantity: 12,
    price_per_day_cents: 450000, // ₹4,500/day
    location_city: 'Bengaluru',
    location_state: 'Karnataka',
    location_pincode: '560038',
    image_urls: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'],
    is_available: true,
    is_seed: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'res-shure-axient',
    provider_id: 'usr-provider-apex',
    category_id: 'cat-sound',
    title: '[Demo] Shure Axient Digital Wireless Mic System (Quad)',
    description: 'Four-channel wireless receiver with handheld Beta58A capsules, rechargeable battery sleds, and active directional antenna distribution.',
    model_or_specs: 'Shure AD4Q quad receiver + 4x AD2/B58 handheld transmitters, Dante enabled',
    total_quantity: 6,
    price_per_day_cents: 600000, // ₹6,000/day
    location_city: 'Bengaluru',
    location_state: 'Karnataka',
    location_pincode: '560038',
    image_urls: ['https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80'],
    is_available: true,
    is_seed: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  // Secondary Audio Provider for Multi-Provider Matching test
  {
    id: 'res-dbaudio-v8',
    provider_id: 'usr-provider-sahara',
    category_id: 'cat-sound',
    title: '[Demo] d&b audiotechnik V8 Line Array Loudspeaker',
    description: '3-way passive line array loudspeaker featuring 2x 10" neodymium drivers and 1.4" compression driver. Perfect multi-provider companion to scale venue coverage.',
    model_or_specs: 'd&b V8, 80° horizontal dispersion, D80 amplifier pack',
    total_quantity: 8,
    price_per_day_cents: 480000, // ₹4,800/day
    location_city: 'Bengaluru',
    location_state: 'Karnataka',
    location_pincode: '560100',
    image_urls: ['https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'],
    is_available: true,
    is_seed: true,
    created_at: '2026-01-11T10:00:00Z',
    updated_at: '2026-01-11T10:00:00Z',
  },
  // Lighting & Visual
  {
    id: 'res-robe-pointe',
    provider_id: 'usr-provider-lumina',
    category_id: 'cat-lighting',
    title: '[Demo] Robe Pointe 280W Beam/Spot Hybrid Fixture',
    description: 'Fast moving head fixture with sharp parallel beam, dual prisms, and rich CMY-style color wheel. Touring condition with road cases.',
    model_or_specs: 'Osram Sirius HRI 280W, 2.5° - 20° zoom, DMX 512, PowerCON TRUE1',
    total_quantity: 16,
    price_per_day_cents: 280000, // ₹2,800/day
    location_city: 'Bengaluru',
    location_state: 'Karnataka',
    location_pincode: '560095',
    image_urls: ['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80'],
    is_available: true,
    is_seed: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'res-chauvet-wellfit',
    provider_id: 'usr-provider-lumina',
    category_id: 'cat-lighting',
    title: '[Demo] Chauvet Professional WELL Fit Wireless Uplight',
    description: 'Battery-powered RGBA LED uplight with built-in W-DMX wireless control and IP65 outdoor casing. Quick magnetic charging flightcase.',
    model_or_specs: '4x 10W RGBA LEDs, 8-hour battery runtime at full output, wireless DMX',
    total_quantity: 24,
    price_per_day_cents: 120000, // ₹1,200/day
    location_city: 'Bengaluru',
    location_state: 'Karnataka',
    location_pincode: '560095',
    image_urls: ['https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80'],
    is_available: true,
    is_seed: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  // LED Screens & Displays
  {
    id: 'res-unilumin-p26',
    provider_id: 'usr-provider-optix',
    category_id: 'cat-displays',
    title: '[Demo] Unilumin P2.6 Indoor Curved LED Video Panel (500x500mm)',
    description: 'Ultra fine pitch rental LED display panel with 3840Hz refresh rate and magnetic front servicing. Includes rigging bars and NovaStar 4K processors.',
    model_or_specs: 'Pixel pitch 2.6mm, 1000 nits, NovaStar A8s receiving card, curve lock system',
    total_quantity: 40,
    price_per_day_cents: 180000, // ₹1,800/day per tile
    location_city: 'Bengaluru',
    location_state: 'Karnataka',
    location_pincode: '560001',
    image_urls: ['https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80'],
    is_available: true,
    is_seed: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  // Staging & Trussing
  {
    id: 'res-prolyte-deck',
    provider_id: 'usr-provider-sahara',
    category_id: 'cat-staging',
    title: '[Demo] Prolyte StageDex Modular Platform (2m x 1m) Deck',
    description: 'Heavy-duty non-slip aluminum stage deck rated for 750 kg/m² load. Includes telescopic legs (40-80cm) and safety clamp joiners.',
    model_or_specs: '2m x 1m birch plywood with black anti-slip top, aluminum profile frame',
    total_quantity: 30,
    price_per_day_cents: 150000, // ₹1,500/day
    location_city: 'Bengaluru',
    location_state: 'Karnataka',
    location_pincode: '560100',
    image_urls: ['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'],
    is_available: true,
    is_seed: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  // Power & Generators
  {
    id: 'res-cummins-125kva',
    provider_id: 'usr-provider-sahara',
    category_id: 'cat-power',
    title: '[Demo] Cummins 125 kVA Acoustic Silent Diesel Generator',
    description: 'Ultra-quiet sound attenuated diesel genset for sensitive audio/broadcast events. Includes 63A distro board and certified operator.',
    model_or_specs: '125 kVA prime power, 415V 3-phase, 68 dB(A) at 7m acoustic canopy',
    total_quantity: 3,
    price_per_day_cents: 1800000, // ₹18,000/day
    location_city: 'Bengaluru',
    location_state: 'Karnataka',
    location_pincode: '560100',
    image_urls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
    is_available: true,
    is_seed: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
  // Seating & Furniture
  {
    id: 'res-banquet-chair',
    provider_id: 'usr-provider-metro',
    category_id: 'cat-seating',
    title: '[Demo] Ergonomic Executive Conference Banquet Chair',
    description: 'Stackable premium cushioned chair in charcoal grey with brushed chrome frame. Cleaned and inspected before every dispatch.',
    model_or_specs: 'High-density foam, steel frame, stackable up to 10 units, fire-retardant fabric',
    total_quantity: 300,
    price_per_day_cents: 25000, // ₹250/day per chair
    location_city: 'Bengaluru',
    location_state: 'Karnataka',
    location_pincode: '560066',
    image_urls: ['https://images.unsplash.com/photo-1580481077197-c81b63873400?auto=format&fit=crop&w=800&q=80'],
    is_available: true,
    is_seed: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z',
  },
];

export const INITIAL_EVENTS: EventPlan[] = [
  {
    id: 'evt-tech-summit-2026',
    organizer_id: 'usr-organizer-demo',
    name: 'South Asia AI & Cloud Summit 2026',
    event_type: 'Conference',
    location_city: 'Bengaluru',
    venue_name: 'Bangalore International Exhibition Centre (BIEC) Hall 3',
    start_date: '2026-11-20',
    end_date: '2026-11-22',
    attendee_count: 850,
    budget_cents: 120000000, // ₹12,00,000 budget
    status: 'planning',
    notes: 'Keynote hall requires crystal clear acoustics, curved LED backdrop, and 300 executive banquet chairs.',
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-01T10:00:00Z',
  },
];

export const INITIAL_EVENT_REQUIREMENTS: EventRequirement[] = [
  {
    id: 'req-audio-main',
    event_id: 'evt-tech-summit-2026',
    category_id: 'cat-sound',
    requirement_name: 'Main Stage Line Array Loudspeakers',
    specifications: 'Compact line array modules for 850 capacity hall, minimum 110-degree dispersion',
    required_quantity: 16, // Notice: Apex has 12, Sahara has 8. Will test multi-provider coordination!
    max_unit_budget_cents: 500000, // Max ₹5,000/day
    created_at: '2026-02-01T10:05:00Z',
  },
  {
    id: 'req-mics',
    event_id: 'evt-tech-summit-2026',
    category_id: 'cat-sound',
    requirement_name: 'Executive Wireless Handheld Microphones',
    specifications: 'Digital wireless UHF quad receiver systems with Beta58 heads',
    required_quantity: 4,
    max_unit_budget_cents: 700000,
    created_at: '2026-02-01T10:06:00Z',
  },
  {
    id: 'req-led-wall',
    event_id: 'evt-tech-summit-2026',
    category_id: 'cat-displays',
    requirement_name: 'Keynote Backdrop P2.6 LED Video Wall Tiles',
    specifications: 'P2.6 indoor curved LED video tiles 500x500mm with rigging hardware',
    required_quantity: 36,
    max_unit_budget_cents: 200000,
    created_at: '2026-02-01T10:07:00Z',
  },
  {
    id: 'req-stage-decks',
    event_id: 'evt-tech-summit-2026',
    category_id: 'cat-staging',
    requirement_name: 'Modular Stage Platform Decks (2x1m)',
    specifications: 'Heavy duty stage decks with non-slip finish and 60cm telescopic legs',
    required_quantity: 20,
    max_unit_budget_cents: 200000,
    created_at: '2026-02-01T10:08:00Z',
  },
  {
    id: 'req-chairs',
    event_id: 'evt-tech-summit-2026',
    category_id: 'cat-seating',
    requirement_name: 'Executive Conference Banquet Chairs',
    specifications: 'Cushioned banquet seating in charcoal or dark fabric',
    required_quantity: 250,
    max_unit_budget_cents: 30000,
    created_at: '2026-02-01T10:09:00Z',
  },
];

export const INITIAL_BOOKINGS: BookingRequest[] = [
  {
    id: 'bk-demo-001',
    request_number: 'REQ-2026-081',
    event_id: 'evt-tech-summit-2026',
    organizer_id: 'usr-organizer-demo',
    provider_id: 'usr-provider-apex',
    status: 'pending',
    start_date: '2026-11-20',
    end_date: '2026-11-22',
    total_amount_cents: 23400000, // ₹2,34,000
    organizer_notes: 'Delivery and rigging required by 8:00 AM on Nov 19 for sound check.',
    provider_notes: null,
    created_at: '2026-02-02T11:00:00Z',
    updated_at: '2026-02-02T11:00:00Z',
    items: [
      {
        id: 'bki-001',
        booking_request_id: 'bk-demo-001',
        resource_id: 'res-jbl-vtx',
        requirement_id: 'req-audio-main',
        quantity: 12,
        daily_price_cents: 450000,
        rental_days: 3,
        subtotal_cents: 16200000,
        created_at: '2026-02-02T11:00:00Z',
      },
      {
        id: 'bki-002',
        booking_request_id: 'bk-demo-001',
        resource_id: 'res-shure-axient',
        requirement_id: 'req-mics',
        quantity: 4,
        daily_price_cents: 600000,
        rental_days: 3,
        subtotal_cents: 7200000,
        created_at: '2026-02-02T11:00:00Z',
      },
    ],
  },
];

// Helper: load local store or initialize with seeds
const STORAGE_PREFIX = 'revento_db_';

export function getLocalStore<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

export function setLocalStore<T>(key: string, val: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
  } catch (err) {
    console.error('Local storage write error:', err);
  }
}
