import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Layers,
  Calendar,
  Store,
  LayoutDashboard,
  Users,
  ChevronDown,
  LogOut,
  UserCheck,
  Menu,
  X,
  Database,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SupabaseConfigModal } from './SupabaseConfigModal';

export function Navbar() {
  const { user, profile, role, signOut, switchDemoAccount, availableDemoAccounts, isSupabaseConnected } =
    useAuth();
  const location = useLocation();

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md shadow-slate-900/10 group-hover:scale-105 transition-transform duration-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-950 opacity-90" />
                  <span className="relative font-bold text-white text-lg tracking-wider">R</span>
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xl text-slate-950 tracking-tight font-sans">
                      Re<span className="text-emerald-600">Vento</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      B2B
                    </span>
                  </div>
                  <p className="hidden sm:block text-[10px] text-slate-500 font-medium tracking-tight">
                    Plan Smarter. Share Better. Waste Less.
                  </p>
                </div>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  to="/planner"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/planner')
                      ? 'bg-slate-900 text-white font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span>Event Planner</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                    Smart Match
                  </span>
                </Link>

                <Link
                  to="/marketplace"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/marketplace')
                      ? 'bg-slate-900 text-white font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Store className="w-4 h-4 text-slate-400" />
                  <span>Marketplace</span>
                </Link>

                {/* Role-Specific Dashboards */}
                <Link
                  to="/organizer-dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/organizer-dashboard')
                      ? 'bg-slate-900 text-white font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-sky-500" />
                  <span>Organizer Hub</span>
                </Link>

                <Link
                  to="/provider-dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/provider-dashboard')
                      ? 'bg-slate-900 text-white font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-4 h-4 text-emerald-500" />
                  <span>Provider Hub</span>
                </Link>
              </nav>
            </div>

            {/* Right Action Section */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Supabase Status Pill */}
              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 hover:bg-slate-100 transition-colors text-slate-600 border-slate-200"
                title="Click to view backend configuration & RLS status"
              >
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Backend: {isSupabaseConnected ? 'Supabase' : 'Active'}</span>
              </button>

              {/* Demo Persona Switcher Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-sm transition-all"
                >
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Role:</span>
                  <span
                    className={`font-semibold capitalize px-1.5 py-0.5 rounded text-[11px] ${
                      role === 'organizer'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {profile?.role || 'Guest'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isAccountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-slide-in">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Switch Test Persona
                      </p>
                      <p className="text-xs text-slate-500">
                        Experience both sides of multi-provider coordination:
                      </p>
                    </div>

                    <div className="max-h-60 overflow-y-auto py-1">
                      {availableDemoAccounts.map((acc) => (
                        <button
                          key={acc.id}
                          onClick={() => {
                            switchDemoAccount(acc.id);
                            setIsAccountMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                            profile?.id === acc.id ? 'bg-slate-50 font-semibold text-slate-900' : 'text-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={acc.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover border border-slate-200 flex-shrink-0"
                            />
                            <div className="truncate">
                              <p className="truncate font-medium">{acc.full_name}</p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {acc.company_name || acc.city}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={acc.role === 'organizer' ? 'info' : 'success'}
                            size="sm"
                          >
                            {acc.role}
                          </Badge>
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 pt-1 px-3">
                      <Link
                        to="/profile"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="w-full text-left py-1.5 text-xs text-slate-600 hover:text-slate-900 flex items-center gap-2"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Manage Profile Details</span>
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setIsAccountMenuOpen(false);
                        }}
                        className="w-full text-left py-1.5 text-xs text-rose-600 hover:text-rose-700 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile avatar or Auth buttons */}
              {profile ? (
                <Link
                  to="/profile"
                  className="flex items-center gap-2 pl-2 text-left hover:opacity-80 transition"
                  title="View user profile"
                >
                  <img
                    src={profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                    alt={profile.full_name}
                    className="w-8 h-8 rounded-full border border-slate-300 object-cover"
                  />
                  <div className="hidden xl:block">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                      {profile.full_name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize">{profile.city}</p>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="emerald" size="sm">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu toggle button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Toggle Navigation"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
            <nav className="flex flex-col gap-1">
              <Link
                to="/planner"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Event Planner Wizard
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                  Smart Match
                </span>
              </Link>
              <Link
                to="/marketplace"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Store className="w-4 h-4 text-slate-500" />
                Marketplace Inventory
              </Link>
              <Link
                to="/organizer-dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-sky-500" />
                Organizer Dashboard
              </Link>
              <Link
                to="/provider-dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-emerald-500" />
                Provider Inventory Hub
              </Link>
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-indigo-500" />
                Profile & Settings
              </Link>
            </nav>

            {/* Mobile switch persona */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Active User ({profile?.full_name})
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    switchDemoAccount('usr-organizer-demo');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 text-xs"
                >
                  As Organizer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    switchDemoAccount('usr-provider-apex');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 text-xs"
                >
                  As Audio Provider
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Supabase Config / Architecture Info Modal */}
      <SupabaseConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </>
  );
}
