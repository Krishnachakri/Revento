import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Building2,
  RefreshCw,
  Clock,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCurrency } from '../lib/currency';

export function HomePage() {
  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 gradient-hero text-white">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-emerald-400 backdrop-blur-md shadow-inner">
              <Sparkles className="w-3.5 h-3.5" />
              <span>B2B Event Resource-Coordination Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Plan Smarter. Share Better.{' '}
              <span className="text-emerald-400 underline decoration-emerald-500/50 decoration-wavy">
                Waste Less.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Event businesses have idle audio, visual, and staging assets. Others struggle to source verified gear for short-term summits. 
              <strong> ReVento coordinates complete event requirements</strong> across multiple providers instead of displaying simple product listings.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link to="/planner">
                <Button
                  variant="emerald"
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full sm:w-auto shadow-lg shadow-emerald-500/20"
                >
                  Start Event Planning Wizard
                </Button>
              </Link>

              <Link to="/marketplace">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto bg-slate-900/60 text-white border-slate-700 hover:bg-slate-800 hover:text-white"
                >
                  Browse Equipment Marketplace
                </Button>
              </Link>

              <Link to="/provider-dashboard">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full sm:w-auto text-slate-300 hover:text-white hover:bg-slate-800/60"
                >
                  List Provider Inventory
                </Button>
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-slate-800/80 max-w-4xl mx-auto text-xs">
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <div className="font-extrabold text-white text-lg text-emerald-400">100%</div>
                <div className="text-slate-400">Deterministic Date Verification</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <div className="font-extrabold text-white text-lg text-sky-400">Multi-Supplier</div>
                <div className="text-slate-400">Automated Split Allocations</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <div className="font-extrabold text-white text-lg text-amber-400">Zero Guesswork</div>
                <div className="text-slate-400">Honest Shortage Detection</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <div className="font-extrabold text-white text-lg text-indigo-400">PostgreSQL</div>
                <div className="text-slate-400">Row Level Security (RLS)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Coordination Preview Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-20">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Live Platform Coordination Engine
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                South Asia AI & Cloud Summit 2026 (Live Demonstration)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                850 Attendees • BIEC Bengaluru • Nov 20 - Nov 22, 2026 (3 Days)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/planner">
                <Button variant="emerald" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Open Full Planning Wizard
                </Button>
              </Link>
            </div>
          </div>

          {/* Demonstration Matrix Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 cols: Coordinated Allocations */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                Coordinated Inventory Matrix Across 3 Verified Suppliers:
              </h4>

              <div className="space-y-2 text-xs">
                {/* Item 1: Multi-provider line array */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        16x Main Stage Line Array Loudspeakers
                      </span>
                      <Badge variant="purple" size="sm">
                        Multi-Provider Split
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-x-4">
                      <span>• 12 units from <strong>Apex Pro Audio</strong> (Bengaluru)</span>
                      <span>• 4 units from <strong>Sahara Stage & Power</strong> (Bengaluru)</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-extrabold text-slate-900 text-sm">₹2,19,600</span>
                    <span className="text-[10px] text-slate-400 block">3 rental days</span>
                  </div>
                </div>

                {/* Item 2: LED Video Wall */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        36x Keynote Curved P2.6 LED Wall Panels
                      </span>
                      <Badge variant="success" size="sm">
                        Single Provider Full
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      <span>• 36 units from <strong>Optix Visual Displays</strong> (Bengaluru stock)</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-extrabold text-slate-900 text-sm">₹1,94,400</span>
                    <span className="text-[10px] text-slate-400 block">3 rental days</span>
                  </div>
                </div>

                {/* Item 3: Banquet Chairs */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        250x Executive Conference Banquet Chairs
                      </span>
                      <Badge variant="success" size="sm">
                        Single Provider Full
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      <span>• 250 units from <strong>Metro Seating Solutions</strong></span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-extrabold text-slate-900 text-sm">₹1,87,500</span>
                    <span className="text-[10px] text-slate-400 block">3 rental days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right col: Real-time Budget & Coordination KPI */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col justify-between space-y-6">
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                  Event Coordination Summary
                </p>
                <div className="mt-3 space-y-3">
                  <div>
                    <span className="text-xs text-slate-400 block">Total Event Resource Budget</span>
                    <span className="text-2xl font-extrabold text-white">₹12,00,000</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Estimated Coordinated Cost</span>
                    <span className="text-xl font-bold text-emerald-400">₹6,01,500</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Remaining Budget Savings</span>
                    <span className="text-base font-semibold text-sky-400">+ ₹5,98,500 buffer</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Requirement Fulfillment:</span>
                  <span className="font-bold text-emerald-400">100% (346 units)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Providers Coordinated:</span>
                  <span className="font-bold text-white">3 Verified Partners</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Dispatch Mode:</span>
                  <span className="font-bold text-white">1-Click Split Booking</span>
                </div>
              </div>

              <Link to="/planner" className="w-full">
                <Button variant="emerald" size="md" className="w-full">
                  Customize This Event Plan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Problem Statement vs Solution */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <Badge variant="purple">The Core Differentiator</Badge>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Why Generic Rental Directories Fail Event Organizers
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Corporate events require multi-discipline coordination across sound, lighting, video, staging, and power. 
            Browsing separate ecommerce product pages wastes days of manual back-and-forth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Old way */}
          <div className="p-8 rounded-3xl bg-rose-50/50 border border-rose-200 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-rose-950 text-lg">
                The Fragmented Traditional Way
              </h3>
            </div>
            <ul className="space-y-3 text-xs text-rose-900/90 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Organizers spend 40+ hours calling 12 different vendors trying to patch together enough speakers, microphones, and stage decks.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Websites show fake availability claims, leading to last-minute cancellations 48 hours before showtime.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Event equipment sits idle in provider warehouses 70% of weekdays, losing asset value.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Zero real-time budget comparison; unexpected overtime and double booking costs ruin margins.</span>
              </li>
            </ul>
          </div>

          {/* ReVento way */}
          <div className="p-8 rounded-3xl bg-emerald-50/60 border border-emerald-200 space-y-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-emerald-950 text-lg">
                The ReVento Coordinated Engine
              </h3>
            </div>
            <ul className="space-y-3 text-xs text-emerald-900/90 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Holistic Requirements:</strong> Enter your full equipment requirements once; our engine matches every category simultaneously.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Multi-Provider Sourcing:</strong> If one supplier lacks 16 line-array speakers, ReVento combines 12 from Supplier A and 4 from Supplier B.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>Honest Shortage Detection:</strong> Never reports gear as available if blocked by dates or capacity. Clear alternative suggestions provided.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>1-Click Multi-Booking Dispatch:</strong> Dispatches clean, segregated requests to each supplier and tracks confirmations in real time.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Deterministic Matching</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              No black-box or hallucinated results. Matching algorithm strictly evaluates category specifications, city proximity, validated dates, and unit budgets.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-sky-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Concurrency & RLS Protected</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Acceptance triggers server-side inventory verification to prevent overbooking. PostgreSQL Row Level Security keeps organizer plans strictly private.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Sustainable Asset Sharing</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Maximizes circular equipment usage across event companies. Eliminates redundant equipment purchases and cuts capital depreciation.
            </p>
          </div>
        </div>
      </section>

      {/* 5. CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-8 lg:p-12 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Coordinate Your Next Production?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Create an event plan in 2 minutes, run deterministic inventory matching across verified suppliers, and submit split booking requests.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to="/planner">
                <Button variant="emerald" size="lg">
                  Launch Event Planning Wizard
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                  Search Equipment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
