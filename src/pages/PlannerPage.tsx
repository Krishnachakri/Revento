import React, { useState } from 'react';
import { useEvent, EVENT_TEMPLATES } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { formatCurrency, calculateRentalDays, parseToCents } from '../lib/currency';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MultiProviderMatrix } from '../components/matching/MultiProviderMatrix';
import { ShortageAlertBanner } from '../components/matching/ShortageAlertBanner';
import { BudgetBreakdownChart } from '../components/matching/BudgetBreakdownChart';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building,
  DollarSign,
  Save,
  Send,
  Zap,
} from 'lucide-react';

export function PlannerPage() {
  const {
    activeEvent,
    requirements,
    categories,
    updateEventBasics,
    addRequirement,
    removeRequirement,
    applyTemplate,
    saveActivePlan,
    submitAllBookingRequests,
    planEvaluation,
    isSaving,
  } = useEvent();

  const { profile } = useAuth();
  const { showToast } = useNotification();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Requirement form input state for Step 2
  const [newCategory, setNewCategory] = useState(categories[0]?.id || 'cat-sound');
  const [newName, setNewName] = useState('');
  const [newSpecs, setNewSpecs] = useState('');
  const [newQty, setNewQty] = useState(4);
  const [newBudget, setNewBudget] = useState(5000); // In Rupees

  // Step 4 booking submission notes
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  const rentalDays = calculateRentalDays(activeEvent.start_date, activeEvent.end_date);

  const handleAddRequirementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('Name Required', 'Please enter a requirement name.', 'error');
      return;
    }
    if (newQty <= 0) {
      showToast('Invalid Quantity', 'Quantity must be at least 1.', 'error');
      return;
    }

    addRequirement({
      categoryId: newCategory || categories[0]?.id,
      requirementName: newName.trim(),
      specifications: newSpecs.trim(),
      requiredQuantity: newQty,
      maxUnitBudgetCents: parseToCents(newBudget),
    });

    // Reset fields
    setNewName('');
    setNewSpecs('');
    setNewQty(4);
    setNewBudget(5000);
  };

  const handleFinalSubmit = async () => {
    const res = await submitAllBookingRequests(bookingNotes);
    if (res.success) {
      setBookingSubmitted(true);
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Confetti fallback
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Event Planning & Sourcing Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {activeEvent.name || 'New Event Plan'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {activeEvent.location_city} • {rentalDays} rental day{rentalDays > 1 ? 's' : ''} • Budget: {formatCurrency(activeEvent.budget_cents)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveActivePlan()}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Draft Plan
          </Button>
        </div>
      </div>

      {/* Step Wizard Progress Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {[
          { step: 1, title: '1. Event Scope', desc: 'Basics, dates & budget' },
          { step: 2, title: '2. Equipment Needs', desc: `${requirements.length} item requirements` },
          { step: 3, title: '3. Smart Matching', desc: 'Multi-provider allocations' },
          { step: 4, title: '4. Split Dispatch', desc: 'Submit requests to suppliers' },
        ].map((item) => (
          <button
            key={item.step}
            onClick={() => setCurrentStep(item.step as any)}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              currentStep === item.step
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : currentStep > item.step
                ? 'bg-emerald-50/70 border-emerald-200 text-slate-800'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">{item.title}</span>
              {currentStep > item.step && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              )}
            </div>
            <p
              className={`text-[11px] mt-0.5 ${
                currentStep === item.step ? 'text-slate-300' : 'text-slate-400'
              }`}
            >
              {item.desc}
            </p>
          </button>
        ))}
      </div>

      {/* ====================================================================== */}
      {/* STEP 1: EVENT BASICS */}
      {/* ====================================================================== */}
      {currentStep === 1 && (
        <div className="space-y-8 animate-fade-in">
          {/* Quick Preset Template Bar */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Quick-Start with Production Presets:
              </span>
              <span className="text-[11px] text-slate-500">
                Instantly pre-fill complete requirements
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(EVENT_TEMPLATES).map(([key, tpl]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyTemplate(key)}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-xs transition text-left flex flex-col justify-between group"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs group-hover:text-emerald-700 transition">
                      {tpl.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {tpl.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span>{tpl.requirements.length} equipment items</span>
                    <strong className="text-slate-900">
                      {formatCurrency(tpl.suggestedBudgetCents)}
                    </strong>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900">Event Parameters & Budget</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Event Name *</label>
                <input
                  type="text"
                  value={activeEvent.name}
                  onChange={(e) => updateEventBasics({ name: e.target.value })}
                  placeholder="e.g. South Asia AI & Cloud Summit 2026"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Type *</label>
                <select
                  value={activeEvent.event_type}
                  onChange={(e) => updateEventBasics({ event_type: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 text-xs bg-white"
                >
                  <option value="Conference">Conference / Summit</option>
                  <option value="Gala Dinner">Gala Dinner / Awards</option>
                  <option value="Music Festival">Music Festival / Concert</option>
                  <option value="Corporate Expo">Corporate Expo / Tradeshow</option>
                  <option value="Product Launch">Product Launch</option>
                  <option value="Wedding / Celebration">Wedding / Celebration</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location City *</label>
                <input
                  type="text"
                  value={activeEvent.location_city}
                  onChange={(e) => updateEventBasics({ location_city: e.target.value })}
                  placeholder="e.g. Bengaluru"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Venue Name / Hall</label>
                <input
                  type="text"
                  value={activeEvent.venue_name || ''}
                  onChange={(e) => updateEventBasics({ venue_name: e.target.value })}
                  placeholder="e.g. BIEC Bangalore International Exhibition Centre Hall 3"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  value={activeEvent.start_date}
                  onChange={(e) => updateEventBasics({ start_date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">End Date *</label>
                <input
                  type="date"
                  value={activeEvent.end_date}
                  onChange={(e) => updateEventBasics({ end_date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Expected Attendees *
                </label>
                <input
                  type="number"
                  min="10"
                  value={activeEvent.attendee_count}
                  onChange={(e) =>
                    updateEventBasics({ attendee_count: parseInt(e.target.value) || 100 })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Total Resource Budget (₹ INR) *
                </label>
                <input
                  type="number"
                  min="5000"
                  step="5000"
                  value={activeEvent.budget_cents / 100}
                  onChange={(e) =>
                    updateEventBasics({
                      budget_cents: parseToCents(parseFloat(e.target.value) || 0),
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 text-xs font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Production Notes & Constraints
                </label>
                <input
                  type="text"
                  value={activeEvent.notes || ''}
                  onChange={(e) => updateEventBasics({ notes: e.target.value })}
                  placeholder="Keynote hall requires pristine vocal speech clarity, curved LED backdrop..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button
                variant="emerald"
                onClick={() => setCurrentStep(2)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Equipment Requirements ({requirements.length} items)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* STEP 2: REQUIREMENTS BUILDER */}
      {/* ====================================================================== */}
      {currentStep === 2 && (
        <div className="space-y-8 animate-fade-in">
          {/* Add requirement form card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              <span>Add Resource Requirement Line Item</span>
            </h3>

            <form onSubmit={handleAddRequirementSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Requirement Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Stage Line Array Loudspeakers"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Required Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newQty}
                    onChange={(e) => setNewQty(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Max Unit Budget (₹/day)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={newBudget}
                    onChange={(e) => setNewBudget(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-4">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Technical Specifications & Keywords (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 110-degree dispersion, compact dual 8-inch, Dante compatible"
                    value={newSpecs}
                    onChange={(e) => setNewSpecs(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    type="submit"
                    variant="emerald"
                    className="w-full text-xs"
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Line Item
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Current requirements list table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Current Equipment Requirements ({requirements.length} Items)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  The matching engine will evaluate database inventory for these specifications.
                </p>
              </div>
            </div>

            {requirements.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No requirements added yet. Add a line item above or use a preset from Step 1.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Item & Specifications</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-center">Required Qty</th>
                      <th className="py-3 px-4 text-right">Max Unit Budget</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requirements.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block text-sm">
                            {req.requirement_name}
                          </span>
                          {req.specifications && (
                            <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                              {req.specifications}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {req.category?.name || 'Equipment'}
                        </td>
                        <td className="py-3.5 px-4 text-center font-extrabold text-slate-800 text-sm">
                          {req.required_quantity}
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-700 font-medium">
                          {req.max_unit_budget_cents
                            ? formatCurrency(req.max_unit_budget_cents) + '/day'
                            : 'Flexible'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => removeRequirement(req.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                            title="Remove Requirement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="p-6 border-t border-slate-100 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Scope
              </Button>
              <Button
                variant="emerald"
                disabled={requirements.length === 0}
                onClick={() => setCurrentStep(3)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Run Smart Matching Engine ({requirements.length} Requirements)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* STEP 3: MATCHING RESULTS & MULTI-PROVIDER COORDINATION */}
      {/* ====================================================================== */}
      {currentStep === 3 && (
        <div className="space-y-8 animate-fade-in">
          {/* Match Score & Fulfillment KPI Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider block">
                Fulfillment Score
              </span>
              <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
                {planEvaluation.fulfillmentPercent}%
              </span>
              <span className="text-slate-500 mt-0.5 block">
                {planEvaluation.totalAllocatedUnits} of {planEvaluation.totalRequiredUnits} units allocated
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider block">
                Suppliers Coordinated
              </span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                {Object.keys(planEvaluation.providerSplits).length}
              </span>
              <span className="text-slate-500 mt-0.5 block">Verified local rental houses</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider block">
                Estimated Spend
              </span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                {formatCurrency(planEvaluation.totalEstimatedCostCents)}
              </span>
              <span className="text-slate-500 mt-0.5 block">
                For {rentalDays} rental day{rentalDays > 1 ? 's' : ''}
              </span>
            </div>

            <div
              className={`p-5 rounded-2xl border shadow-xs ${
                planEvaluation.isOverBudget
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}
            >
              <span className="font-semibold uppercase tracking-wider block text-slate-500">
                Budget Differential
              </span>
              <span className="text-2xl font-extrabold mt-1 block">
                {formatCurrency(Math.abs(planEvaluation.budgetDeltaCents))}
              </span>
              <span className="mt-0.5 block font-medium">
                {planEvaluation.isOverBudget ? '⚠️ Budget overrun' : '✓ Under budget ceiling'}
              </span>
            </div>
          </div>

          {/* Honest Shortage Detection */}
          <ShortageAlertBanner results={planEvaluation.requirementResults} />

          {/* Combined Multi-Provider Resource Table */}
          <MultiProviderMatrix evaluation={planEvaluation} />

          {/* Budget Breakdown & Financial Chart */}
          <BudgetBreakdownChart evaluation={planEvaluation} />

          {/* Navigation Controls */}
          <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-200">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(2)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Adjust Requirements
            </Button>
            <Button
              variant="emerald"
              onClick={() => setCurrentStep(4)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Proceed to Review & Split Dispatch
            </Button>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* STEP 4: SUBMIT MULTI-PROVIDER BOOKING REQUESTS */}
      {/* ====================================================================== */}
      {currentStep === 4 && (
        <div className="space-y-8 animate-fade-in">
          {bookingSubmitted ? (
            <div className="bg-white rounded-3xl border border-emerald-200 p-8 sm:p-12 text-center space-y-6 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="max-w-lg mx-auto space-y-2">
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Booking Requests Dispatched Successfully!
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ReVento split your coordination plan and generated segregated booking requests for each of the{' '}
                  <strong>{Object.keys(planEvaluation.providerSplits).length} equipment providers</strong>. 
                  Providers will review and confirm availability.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <a href="/organizer-dashboard">
                  <Button variant="emerald">
                    View in Organizer Dashboard
                  </Button>
                </a>
                <a href="/provider-dashboard">
                  <Button variant="outline">
                    Check Provider View (To Accept / Decline)
                  </Button>
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Step 4: Dispatch Coordinated Booking Requests
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Upon submission, ReVento automatically splits your plan by provider, locks date parameters, and sends individual requests for each provider's items.
                </p>
              </div>

              {/* Providers that will receive requests */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Splits to be Dispatched:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.values(planEvaluation.providerSplits).map((split) => (
                    <div
                      key={split.providerId}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {split.providerCompany || split.providerName}
                        </span>
                        <Badge variant="purple" size="sm">
                          {split.items.length} items
                        </Badge>
                      </div>
                      <p className="text-slate-500 text-[11px]">{split.providerCity}</p>
                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between font-bold">
                        <span>Request Subtotal:</span>
                        <span className="text-slate-900">{formatCurrency(split.totalAmountCents)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes to providers */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery & Rigging Notes for Equipment Providers
                </label>
                <textarea
                  rows={3}
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="e.g. Load-in starts at 7:00 AM on start date. Sound engineer will be on site for calibration."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <strong>Booking Safety Notice:</strong> Submitting creates <em>pending</em> booking requests. 
                Providers must review and accept. The database executes an atomic inventory re-check when providers click Accept to guarantee zero double-booking conflicts.
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(3)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back to Smart Matching
                </Button>
                <Button
                  variant="emerald"
                  size="lg"
                  onClick={handleFinalSubmit}
                  isLoading={isSaving}
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Submit Booking Requests to All Providers ({formatCurrency(planEvaluation.totalEstimatedCostCents)})
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
