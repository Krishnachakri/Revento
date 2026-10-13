import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../context/EventContext';
import { Resource, BookingRequest } from '../types/database';
import { getResources, getBookingRequests } from '../lib/supabase';
import { formatCurrency } from '../lib/currency';
import { ProviderInventoryTable } from '../components/dashboard/ProviderInventoryTable';
import { AddResourceModal } from '../components/dashboard/AddResourceModal';
import { BookingRequestCard } from '../components/dashboard/BookingRequestCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Layers,
  Clock,
  Plus,
  RefreshCw,
  Building,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  TrendingUp,
} from 'lucide-react';

export function ProviderDashboardPage() {
  const { profile } = useAuth();
  const { categories } = useEvent();

  const [providerResources, setProviderResources] = useState<Resource[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'requests'>('requests');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const fetchProviderData = async () => {
    if (!profile) return;
    setIsLoading(true);
    try {
      const [resList, reqList] = await Promise.all([
        getResources({ providerId: profile.id }),
        getBookingRequests({ providerId: profile.id }),
      ]);
      setProviderResources(resList);
      setIncomingRequests(reqList);
    } catch (err) {
      console.error('Failed to load provider data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderData();
  }, [profile?.id]);

  const totalStockUnits = providerResources.reduce((sum, r) => sum + r.total_quantity, 0);
  const activeConfirmedBookings = incomingRequests.filter((r) => r.status === 'accepted');
  const pendingIncomingRequests = incomingRequests.filter((r) => r.status === 'pending');
  const totalRevenue = activeConfirmedBookings.reduce((sum, r) => sum + r.total_amount_cents, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Provider Equipment Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {profile?.company_name || profile?.full_name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Equipment Supplier • Operating in {profile?.city} • Verified B2B Inventory
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProviderData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="emerald"
            size="sm"
            onClick={() => {
              setEditingResource(null);
              setIsAddModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            List New Equipment
          </Button>
        </div>
      </div>

      {/* KPI 4-Card Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider block">
            Listed Equipment Lines
          </span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
            {providerResources.length}
          </span>
          <span className="text-slate-500 mt-0.5 block">{totalStockUnits} total stock units</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider block">
            Incoming Review Requests
          </span>
          <span className="text-2xl font-extrabold text-amber-600 mt-1 block">
            {pendingIncomingRequests.length}
          </span>
          <span className="text-slate-500 mt-0.5 block">Pending your Accept / Decline</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider block">
            Confirmed Bookings
          </span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
            {activeConfirmedBookings.length}
          </span>
          <span className="text-slate-500 mt-0.5 block">Approved production contracts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider block">
            Confirmed Revenue
          </span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
            {formatCurrency(totalRevenue)}
          </span>
          <span className="text-slate-500 mt-0.5 block">From confirmed rentals</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Incoming Booking Requests ({incomingRequests.length})</span>
          {pendingIncomingRequests.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>My Equipment Inventory ({providerResources.length})</span>
        </button>
      </div>

      {/* TAB 1: Incoming Booking Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {incomingRequests.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">No incoming booking requests yet</h4>
              <p className="text-xs text-slate-500">
                When organizers plan an event matching your gear and city, split requests will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingRequests.map((req) => (
                <BookingRequestCard
                  key={req.id}
                  request={req}
                  viewerRole="provider"
                  currentUserId={profile?.id || ''}
                  onStatusUpdated={fetchProviderData}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Equipment Inventory Table */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="emerald"
              size="sm"
              onClick={() => {
                setEditingResource(null);
                setIsAddModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add New Listing
            </Button>
          </div>

          <ProviderInventoryTable
            resources={providerResources}
            providerId={profile?.id || ''}
            onEditResource={(res) => {
              setEditingResource(res);
              setIsAddModalOpen(true);
            }}
            onRefresh={fetchProviderData}
          />
        </div>
      )}

      {/* Add / Edit Resource Modal */}
      <AddResourceModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingResource(null);
        }}
        categories={categories}
        providerId={profile?.id || ''}
        defaultCity={profile?.city || 'Bengaluru'}
        existingResource={editingResource}
        onSuccess={() => {
          fetchProviderData();
        }}
      />
    </div>
  );
}
