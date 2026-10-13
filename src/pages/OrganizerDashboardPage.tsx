import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../context/EventContext';
import { EventPlan, BookingRequest } from '../types/database';
import { getEventsByOrganizer, getBookingRequests } from '../lib/supabase';
import { formatCurrency, formatDateDisplay } from '../lib/currency';
import { BookingRequestCard } from '../components/dashboard/BookingRequestCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Calendar,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit,
  ExternalLink,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function OrganizerDashboardPage() {
  const { profile } = useAuth();
  const { loadSavedEvent, resetToNewEvent } = useEvent();
  const navigate = useNavigate();

  const [events, setEvents] = useState<EventPlan[]>([]);
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'events' | 'bookings'>('bookings');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchOrganizerData = async () => {
    if (!profile) return;
    setIsLoading(true);
    try {
      const [evts, bReqs] = await Promise.all([
        getEventsByOrganizer(profile.id),
        getBookingRequests({ organizerId: profile.id }),
      ]);
      setEvents(evts);
      setRequests(bReqs);
    } catch (err) {
      console.error('Failed to load organizer data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerData();
  }, [profile?.id]);

  const handleOpenEvent = async (eventId: string) => {
    await loadSavedEvent(eventId);
    navigate('/planner');
  };

  const handleCreateNew = () => {
    resetToNewEvent();
    navigate('/planner');
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const acceptedRequests = requests.filter((r) => r.status === 'accepted');
  const totalCommittedSpend = acceptedRequests.reduce((sum, r) => sum + r.total_amount_cents, 0);

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
              Organizer Operations Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Welcome back, {profile?.full_name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {profile?.company_name || 'Event Management'} • Headquartered in {profile?.city}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrganizerData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="emerald"
            size="sm"
            onClick={handleCreateNew}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Plan New Event
          </Button>
        </div>
      </div>

      {/* KPI 4-Card Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider block">
            Saved Event Plans
          </span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
            {events.length}
          </span>
          <span className="text-slate-500 mt-0.5 block">Active productions in planning</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider block">
            Awaiting Provider Review
          </span>
          <span className="text-2xl font-extrabold text-amber-600 mt-1 block">
            {pendingRequests.length}
          </span>
          <span className="text-slate-500 mt-0.5 block">Pending confirmation</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider block">
            Confirmed Bookings
          </span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
            {acceptedRequests.length}
          </span>
          <span className="text-slate-500 mt-0.5 block">Inventory locked & verified</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider block">
            Confirmed Spend
          </span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
            {formatCurrency(totalCommittedSpend)}
          </span>
          <span className="text-slate-500 mt-0.5 block">Across accepted contracts</span>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Dispatched Booking Requests ({requests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'events'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Event Plans ({events.length})</span>
        </button>
      </div>

      {/* TAB 1: Booking Requests List */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {/* Status filter bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-medium">Filter by Status:</span>
            {['all', 'pending', 'accepted', 'declined', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full capitalize font-medium transition ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">No booking requests found</h4>
              <p className="text-xs text-slate-500">
                Create an event plan in the wizard and submit requests to verified providers.
              </p>
              <Button variant="emerald" size="sm" onClick={handleCreateNew}>
                Start Planning
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRequests.map((req) => (
                <BookingRequestCard
                  key={req.id}
                  request={req}
                  viewerRole="organizer"
                  currentUserId={profile?.id || ''}
                  onStatusUpdated={fetchOrganizerData}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Event Plans List */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">No saved event plans</h4>
              <p className="text-xs text-slate-500">
                You haven't saved any event plans yet. Use the planner wizard to organize your gear requirements.
              </p>
              <Button variant="emerald" size="sm" onClick={handleCreateNew}>
                Create Your First Event Plan
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {evt.event_type}
                      </span>
                      <Badge
                        variant={evt.status === 'requests_sent' ? 'success' : 'neutral'}
                        size="sm"
                      >
                        {evt.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <h4 className="font-bold text-slate-900 text-base">{evt.name}</h4>
                    <p className="text-xs text-slate-500">
                      {formatDateDisplay(evt.start_date)} - {formatDateDisplay(evt.end_date)} •{' '}
                      {evt.location_city}
                    </p>

                    <div className="pt-2 text-xs text-slate-600 space-y-1">
                      <div>
                        Target Budget:{' '}
                        <strong className="text-slate-900">
                          {formatCurrency(evt.budget_cents)}
                        </strong>
                      </div>
                      <div>
                        Equipment Needs:{' '}
                        <strong>{evt.requirements?.length || 0} requirements listed</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Button
                      variant="emerald"
                      size="sm"
                      onClick={() => handleOpenEvent(evt.id)}
                      leftIcon={<Edit className="w-3.5 h-3.5" />}
                      className="w-full text-xs"
                    >
                      Reopen & Coordinate Plan
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
