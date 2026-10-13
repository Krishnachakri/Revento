import React, { useState } from 'react';
import { Resource } from '../../types/database';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency, calculateRentalDays, calculateLineSubtotalCents } from '../../lib/currency';
import { calculateResourceAvailability } from '../../lib/matchingEngine';
import { MapPin, Building, Calendar, CheckCircle2, ShieldCheck, Plus, AlertCircle } from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { useNotification } from '../../context/NotificationContext';

interface ResourceDetailModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ResourceDetailModal({ resource, isOpen, onClose }: ResourceDetailModalProps) {
  const { activeEvent, addRequirement } = useEvent();
  const { showToast } = useNotification();

  const [testStartDate, setTestStartDate] = useState(activeEvent.start_date);
  const [testEndDate, setTestEndDate] = useState(activeEvent.end_date);
  const [testQuantity, setTestQuantity] = useState(1);

  if (!resource) return null;

  const rentalDays = calculateRentalDays(testStartDate, testEndDate);
  const availableCount = calculateResourceAvailability(resource, testStartDate, testEndDate);
  const estimatedTotal = calculateLineSubtotalCents(
    resource.price_per_day_cents,
    testQuantity,
    rentalDays
  );

  const handleAddRequirement = () => {
    addRequirement({
      categoryId: resource.category_id,
      requirementName: resource.title.replace(/^\[Demo\]\s*/, ''),
      specifications: resource.model_or_specs || resource.description,
      requiredQuantity: testQuantity,
      maxUnitBudgetCents: resource.price_per_day_cents,
    });
    showToast(
      'Added to Event Plan',
      `Allocated ${testQuantity}x "${resource.title}" for your active event plan.`,
      'success'
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={resource.title}
      description={`Category: ${resource.category?.name || 'Equipment'} • Provided by ${resource.provider?.company_name || resource.provider?.full_name}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Main image */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
          <img
            src={resource.image_urls?.[0] || 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'}
            alt={resource.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            {resource.is_seed ? (
              <Badge variant="warning">Demo Seed</Badge>
            ) : (
              <Badge variant="success">Verified Provider</Badge>
            )}
          </div>
        </div>

        {/* Specs and Description */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900">Equipment Specifications & Details</h4>
          <p className="text-xs text-slate-600 leading-relaxed">{resource.description}</p>

          {resource.model_or_specs && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-800">
              <span className="text-slate-400 font-sans block text-[10px] uppercase font-bold mb-1">
                Technical Specifications:
              </span>
              {resource.model_or_specs}
            </div>
          )}
        </div>

        {/* Provider Credential Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <img
              src={resource.provider?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
              alt=""
              className="w-10 h-10 rounded-full object-cover border border-slate-300"
            />
            <div>
              <h5 className="font-bold text-slate-900 text-sm">
                {resource.provider?.company_name || resource.provider?.full_name}
              </h5>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {resource.location_city}, {resource.location_state || 'India'}
              </p>
              {resource.provider?.bio && (
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{resource.provider.bio}</p>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-lg font-extrabold text-slate-900">
              {formatCurrency(resource.price_per_day_cents)}
            </span>
            <span className="text-xs text-slate-500 block">per day</span>
          </div>
        </div>

        {/* Live Date Availability Checker */}
        <div className="p-4 rounded-xl border border-slate-200 space-y-4 bg-white">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Check Real-Time Availability for Event Dates
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={testStartDate}
                onChange={(e) => setTestStartDate(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={testEndDate}
                onChange={(e) => setTestEndDate(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Quantity Needed
              </label>
              <input
                type="number"
                min="1"
                max={resource.total_quantity}
                value={testQuantity}
                onChange={(e) => setTestQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              {availableCount >= testQuantity ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-900">
                    Available: {availableCount} units in stock for {rentalDays} rental day{rentalDays > 1 ? 's' : ''}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-900">
                    Partial inventory: Only {availableCount} units available for these dates
                  </span>
                </>
              )}
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500">Estimated Total: </span>
              <span className="text-sm font-bold text-slate-900">
                {formatCurrency(estimatedTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="emerald"
            onClick={handleAddRequirement}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add to Active Event Plan
          </Button>
        </div>
      </div>
    </Modal>
  );
}
