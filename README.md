# ReVento — B2B Event Resource Coordination Platform

> **Plan Smarter. Share Better. Waste Less.**

ReVento is a production-ready, full-stack B2B event resource-coordination platform. Rather than functioning as a generic equipment listing catalog or ecommerce cart, ReVento coordinates an event's **complete resource requirements** across multiple verified suppliers, performs deterministic multi-provider inventory matching, detects market shortages honestly, and submits segregated booking requests to each supplier.

---

## 🎯 Problem Statement & Solution

* **The Problem:** Event management companies and production houses frequently struggle with idle, depreciating gear during off-peak periods, while corporate organizers waste dozens of hours calling fragmented vendors trying to patch together enough line-array speakers, LED wall tiles, staging decks, and silent power generators. Websites often claim false availability, leading to show-stopping cancellations.
* **The Solution:** ReVento allows organizers to define complete event parameters (dates, attendee counts, venues, multi-discipline requirements), evaluates database inventory in real-time, greedily combines partial quantities across multiple providers when a single provider cannot fulfill the full demand, compares estimated costs against budgets, and dispatches split booking requests with atomic concurrency safety.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, React Router, Tailwind CSS, Lucide Icons, Canvas Confetti |
| **Backend & DB** | Supabase (PostgreSQL 15+, Auth, Storage, Row Level Security, RPC Functions) |
| **Testing** | Vitest, JSDOM |
| **Deployment** | Vercel (Frontend SPA with `vercel.json` rewrites) + Supabase Cloud (Database & Storage) |

---

## 📐 Key Differentiators & Architecture

1. **Deterministic Resource Matching Engine:**
   * Category and technical specifications matching (tokenized relevance scoring).
   * Real-time availability calculation: `Total - (Overlapping Accepted Bookings) - (Maintenance Blackouts)`.
   * Provider city and regional proximity scoring.
   * Target unit budget and total event budget fit analysis.
2. **Multi-Provider Greedy Allocation:**
   * When a single provider lacks the required quantity (e.g. 16 line array speakers needed; Provider A has 12, Provider B has 8), ReVento automatically combines available stock across suppliers to satisfy the requirement.
3. **Honest Shortage Detection:**
   * If total market inventory is insufficient for the selected date window, ReVento never makes false availability claims. It flags the exact shortage count (e.g., *Missing 4 units*) and presents compatible alternatives.
4. **Budget & Financial Integrity:**
   * Calculates financial amounts using integer minor units (paise/cents) to prevent floating-point rounding errors.
   * Real-time budget progress bar, remaining savings buffer, and overrun alerts.
5. **Atomic Booking Concurrency Safety:**
   * PostgreSQL stored procedure `accept_booking_request` re-verifies date availability and capacity inside a row lock prior to confirmation, preventing double-allocation race conditions.
6. **Row Level Security (RLS):**
   * Organizers can only read and manage their own event plans.
   * Providers can only manage their own equipment inventory and incoming requests.
   * Booking records are visible strictly to the participating organizer and provider.
7. **Hybrid Resilient Runtime:**
   * Connects directly to Supabase when environment variables are supplied.
   * Operates seamlessly with persistent storage and pre-seeded realistic inventory for testing and demonstration prior to setting up personal cloud keys.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
* Node.js v18.0.0 or higher
* npm v9.0.0 or higher

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/revento.git
cd revento

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase project credentials (safe public anon key only):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here
VITE_APP_CURRENCY=INR
```
*(Note: If left blank or using placeholders, the app automatically runs in self-contained deterministic local mode with pre-seeded demo suppliers).*

### 4. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 5. Run Automated Test Suite
```bash
npm test
```
Executes 13 unit tests covering:
* Single-provider full match vs. multi-provider partial allocations
* Market shortage detection & unfulfilled inventory alerts
* Currency & rental days calculations using integer minor units
* Date blackout overlap deductions
* Concurrency conflict prevention during request acceptance
* Unauthorized status manipulation rejection

### 6. Production Build
```bash
npm run build
```
Generates production assets in `dist/`.

---

## 🗄️ Database Setup & Supabase Migrations

To apply the database schema, security policies, and seed data to your Supabase project:

1. Log in to [Supabase Dashboard](https://supabase.com).
2. Create a new project (e.g. `revento-production`).
3. Navigate to **SQL Editor** in the left sidebar.
4. Execute the migration scripts located in `supabase/migrations/` in the following sequence:

### Migration 1: Core Schema & Policies
Execute [`supabase/migrations/20261013000001_initial_schema.sql`](supabase/migrations/20261013000001_initial_schema.sql):
* Creates tables: `profiles`, `categories`, `resources`, `resource_blackouts`, `events`, `event_requirements`, `resource_selections`, `booking_requests`, `booking_request_items`.
* Sets up foreign keys, cascading constraints, check constraints, and performance indexes.
* Enables Row Level Security (RLS) on all tables with granular read/write policies.
* Creates `handle_new_user()` trigger for automated user profiles upon auth sign-up.
* Creates `get_resource_available_quantity()` and `accept_booking_request()` PostgreSQL functions.

### Migration 2: Initial Categories & Demo Seed Listings
Execute [`supabase/migrations/20261013000002_seed_data.sql`](supabase/migrations/20261013000002_seed_data.sql):
* Inserts equipment categories: Sound & Audio, Lighting & Visual FX, LED Screens & Displays, Staging & Trussing, Power & Generators, Seating & Furniture, Climate & Ventilation.
* Inserts verified demo suppliers and inventory clearly flagged with `is_seed = true`.

### Migration 3: Image Storage Bucket
Execute [`supabase/migrations/20261013000003_storage.sql`](supabase/migrations/20261013000003_storage.sql):
* Creates the public storage bucket `resource-images` (5 MB file size limit, image mime types).
* Grants public read access and authenticated provider upload access.

### 4. Supabase Authentication Settings
* In Supabase Dashboard, go to **Authentication -> URL Configuration**.
* Add your local URL: `http://localhost:5173`
* Add your production Vercel domain: `https://your-revento-app.vercel.app`

---

## ☁️ Deployment Guide (Vercel)

ReVento is configured for one-click deployment on Vercel:

1. Push your repository to GitHub / GitLab.
2. In [Vercel Dashboard](https://vercel.com), click **Add New -> Project** and select your `revento` repository.
3. Configure Project Settings:
   * **Framework Preset:** Vite
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
4. In the **Environment Variables** section, add:
   * `VITE_SUPABASE_URL`: Your Supabase Project URL
   * `VITE_SUPABASE_ANON_KEY`: Your Supabase Public Anonymous Key
   * `VITE_APP_CURRENCY`: `INR`
5. Click **Deploy**.
6. The included `vercel.json` automatically handles SPA routing rewrites (`/* -> /index.html`) and cache headers for optimized CDN delivery.

---

## 🔄 Complete End-to-End User Journey

You can test the entire complete user journey out-of-the-box:

1. **Step 1: Organizer Plans an Event**
   * Visit `/planner`.
   * Click the **"South Asia AI & Cloud Summit 2026"** preset (or create your own).
   * Notice: 850 attendees, Nov 20–Nov 22 (3 rental days), ₹12,00,000 budget.
2. **Step 2: Define Requirements**
   * Click **"Proceed to Equipment Requirements"**.
   * Review or add line items: 16x Line Array Speakers, 36x P2.6 LED Wall Tiles, 20x Stage Decks, 250x Banquet Chairs.
3. **Step 3: Run Deterministic Matching**
   * Click **"Run Smart Matching Engine"**.
   * Observe the **Multi-Provider Greedy Allocation**: 12 speakers from *Apex Pro Audio* + 4 speakers from *Sahara Stage & Power* to satisfy 16 speakers.
   * Inspect the **Budget Comparison Bar** and **Honest Shortage Detection Banner**.
4. **Step 4: Split Dispatch**
   * Click **"Proceed to Review & Split Dispatch"**.
   * Add optional load-in rigging notes and click **"Submit Booking Requests to All Providers"**.
   * ReVento splits the allocations and generates distinct requests for each provider with celebration confetti.
5. **Step 5: Provider Reviews & Accepts**
   * Use the **Role Persona Switcher** in the top navigation to switch to **"Karan Mehta (Audio Provider)"**.
   * Navigate to `/provider-dashboard`.
   * View the incoming booking request with allocated items and rental dates.
   * Click **"Accept & Confirm Booking"**. The engine re-verifies inventory availability and confirms the booking.
6. **Step 6: Organizer Checks Confirmation**
   * Switch persona back to **"Aditi Sharma (Organizer)"** or navigate to `/organizer-dashboard`.
   * View the updated status: **Confirmed / Accepted** with confirmed spend tally.

---

## 🔒 Security & Data Privacy

* **No Service Role Keys in Frontend:** Only the safe anonymous public key is exposed.
* **Database Row Level Security (RLS):** Prevents cross-tenant access to events and provider inventories.
* **Deletion Safety Guard:** Inventory deletion is prevented if active or confirmed bookings exist for the item.
* **Input Validation:** Enforced on both client and database levels (e.g. `quantity > 0`, `price_per_day_cents >= 0`, `end_date >= start_date`).

---

## 📄 License
MIT License. © 2026 ReVento Technologies Inc.
