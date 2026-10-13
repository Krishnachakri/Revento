import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, RefreshCw, Layers } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center relative overflow-hidden">
                <span className="font-bold text-white text-base">R</span>
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Re<span className="text-emerald-400">Vento</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Plan Smarter. Share Better. Waste Less.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              B2B event resource-coordination platform coordinating complete event requirements across verified equipment providers.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400/90 font-medium">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
              <span>Circular Equipment Utilization</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
              Platform Features
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/planner" className="hover:text-white transition">
                  Event Requirement Wizard
                </Link>
              </li>
              <li>
                <Link to="/planner" className="hover:text-white transition">
                  Deterministic Smart Matching
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-white transition">
                  Verified Resource Marketplace
                </Link>
              </li>
              <li>
                <Link to="/organizer-dashboard" className="hover:text-white transition">
                  Multi-Provider Cost Breakdown
                </Link>
              </li>
              <li>
                <Link to="/provider-dashboard" className="hover:text-white transition">
                  Provider Inventory Management
                </Link>
              </li>
            </ul>
          </div>

          {/* Coordination Engine Highlights */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
              Coordination Engine
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Deterministic date & inventory verification</span>
              </li>
              <li className="flex items-start gap-2">
                <Layers className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Multi-provider greedy combination</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Honest market shortage detection</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>PostgreSQL Row Level Security (RLS)</span>
              </li>
            </ul>
          </div>

          {/* B2B Contact & Cities */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
              Coverage & Cities
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Serving corporate summits, galas, and festivals across India's top metropolitan hubs:
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune'].map((c) => (
                <span
                  key={c}
                  className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} ReVento Technologies Inc. Built for enterprise event planners and verified resource providers.
          </div>
          <div className="flex items-center gap-6">
            <span>Production-grade PostgreSQL & RLS</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span>Vercel Deployable</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
