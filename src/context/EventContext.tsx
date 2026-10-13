// ============================================================================
// ReVento - Event Planning & Smart Matching Context
// ============================================================================

import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import {
  BookingRequest,
  Category,
  EventPlan,
  EventRequirement,
  Resource,
  ResourceBlackout,
} from '../types/database';
import { PlanEvaluation, SelectedAllocation } from '../types/matching';
import { matchEventResources } from '../lib/matchingEngine';
import {
  getCategories,
  getResources,
  getBookingRequests,
  saveEventPlan,
  getEventById,
  submitMultiProviderBookingRequests,
} from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

export interface EventTemplate {
  name: string;
  eventType: string;
  description: string;
  suggestedAttendeeCount: number;
  suggestedBudgetCents: number;
  requirements: Array<{
    categorySlug: string;
    requirementName: string;
    specifications: string;
    requiredQuantity: number;
    maxUnitBudgetCents?: number;
  }>;
}

export const EVENT_TEMPLATES: Record<string, EventTemplate> = {
  gala: {
    name: 'Corporate Annual Gala & Awards',
    eventType: 'Gala Dinner',
    description: 'High-end 500-guest ballroom with ambient uplighting, line array sound, and curved stage.',
    suggestedAttendeeCount: 500,
    suggestedBudgetCents: 65000000, // ₹6.5 Lakhs
    requirements: [
      {
        categorySlug: 'sound-audio',
        requirementName: 'Ballroom Line Array Sound System',
        specifications: 'Compact line array modules for 500 seated guests with subwoofers',
        requiredQuantity: 8,
        maxUnitBudgetCents: 500000,
      },
      {
        categorySlug: 'sound-audio',
        requirementName: 'Wireless Podium & Handheld Microphones',
        specifications: 'Multi-channel wireless mic kit with handheld capsules',
        requiredQuantity: 4,
        maxUnitBudgetCents: 600000,
      },
      {
        categorySlug: 'lighting-visual',
        requirementName: 'Architectural RGBA LED Uplights',
        specifications: 'Wireless battery uplights for ballroom perimeter and stage backdrop',
        requiredQuantity: 16,
        maxUnitBudgetCents: 150000,
      },
      {
        categorySlug: 'staging-trussing',
        requirementName: 'Modular Stage Decks (2x1m)',
        specifications: 'Modular stage platform for presentation and awards ceremony',
        requiredQuantity: 12,
        maxUnitBudgetCents: 150000,
      },
      {
        categorySlug: 'seating-furniture',
        requirementName: 'Premium Banquet Chairs',
        specifications: 'Charcoal cushioned banquet chairs',
        requiredQuantity: 150,
        maxUnitBudgetCents: 25000,
      },
    ],
  },
  techSummit: {
    name: 'South Asia AI & Cloud Summit 2026',
    eventType: 'Conference',
    description: '850+ developer conference featuring keynote LED walls, heavy line array, and stage platforms.',
    suggestedAttendeeCount: 850,
    suggestedBudgetCents: 120000000, // ₹12.0 Lakhs
    requirements: [
      {
        categorySlug: 'sound-audio',
        requirementName: 'Main Stage Line Array Loudspeakers',
        specifications: 'Compact line array modules for 850 capacity hall, minimum 110-degree dispersion',
        requiredQuantity: 16,
        maxUnitBudgetCents: 500000,
      },
      {
        categorySlug: 'sound-audio',
        requirementName: 'Executive Wireless Handheld Microphones',
        specifications: 'Digital wireless UHF quad receiver systems with Beta58 heads',
        requiredQuantity: 4,
        maxUnitBudgetCents: 700000,
      },
      {
        categorySlug: 'led-displays',
        requirementName: 'Keynote Backdrop P2.6 LED Video Wall Tiles',
        specifications: 'P2.6 indoor curved LED video tiles 500x500mm with rigging hardware',
        requiredQuantity: 36,
        maxUnitBudgetCents: 200000,
      },
      {
        categorySlug: 'staging-trussing',
        requirementName: 'Modular Stage Platform Decks (2x1m)',
        specifications: 'Heavy duty stage decks with non-slip finish and 60cm telescopic legs',
        requiredQuantity: 20,
        maxUnitBudgetCents: 200000,
      },
      {
        categorySlug: 'seating-furniture',
        requirementName: 'Executive Conference Banquet Chairs',
        specifications: 'Cushioned banquet seating in charcoal or dark fabric',
        requiredQuantity: 250,
        maxUnitBudgetCents: 30000,
      },
    ],
  },
  outdoorFestival: {
    name: 'Sunset Beats Music & Food Carnival',
    eventType: 'Music Festival',
    description: 'Outdoor open-ground event requiring acoustic silent generator, moving head beams, and heavy staging.',
    suggestedAttendeeCount: 1500,
    suggestedBudgetCents: 180000000, // ₹18.0 Lakhs
    requirements: [
      {
        categorySlug: 'sound-audio',
        requirementName: 'Outdoor Concert Line Array Wings',
        specifications: 'High-output dual 8" or 10" line array speaker modules with fly frames',
        requiredQuantity: 16,
        maxUnitBudgetCents: 550000,
      },
      {
        categorySlug: 'lighting-visual',
        requirementName: 'Stage Beam & Spot Hybrid Moving Heads',
        specifications: 'High output 280W beam moving heads with zoom and gobos',
        requiredQuantity: 12,
        maxUnitBudgetCents: 300000,
      },
      {
        categorySlug: 'power-generators',
        requirementName: 'Acoustic Silent Diesel Generator 125 kVA',
        specifications: 'Sound attenuated 125 kVA generator with 3-phase distro board',
        requiredQuantity: 2,
        maxUnitBudgetCents: 2000000,
      },
      {
        categorySlug: 'staging-trussing',
        requirementName: 'Modular Stage Decks (2x1m)',
        specifications: 'Outdoor rated stage platforms with adjustable legs',
        requiredQuantity: 24,
        maxUnitBudgetCents: 160000,
      },
    ],
  },
};

interface EventContextType {
  activeEvent: EventPlan;
  requirements: EventRequirement[];
  categories: Category[];
  allResources: Resource[];
  bookings: BookingRequest[];
  isLoading: boolean;
  isSaving: boolean;
  planEvaluation: PlanEvaluation;
  customSelections: SelectedAllocation[];
  updateEventBasics: (updates: Partial<EventPlan>) => void;
  addRequirement: (req: {
    categoryId: string;
    requirementName: string;
    specifications: string;
    requiredQuantity: number;
    maxUnitBudgetCents?: number;
  }) => void;
  updateRequirement: (id: string, updates: Partial<EventRequirement>) => void;
  removeRequirement: (id: string) => void;
  applyTemplate: (templateKey: string) => void;
  saveActivePlan: () => Promise<boolean>;
  loadSavedEvent: (eventId: string) => Promise<boolean>;
  submitAllBookingRequests: (notes?: string) => Promise<{ success: boolean; requestsCount?: number }>;
  resetToNewEvent: () => void;
  refreshData: () => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const { showToast } = useNotification();

  const [categories, setCategories] = useState<Category[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Active Event state
  const [activeEvent, setActiveEvent] = useState<EventPlan>({
    id: 'evt-draft-' + Date.now(),
    organizer_id: profile?.id || 'usr-organizer-demo',
    name: 'South Asia AI & Cloud Summit 2026',
    event_type: 'Conference',
    location_city: 'Bengaluru',
    venue_name: 'BIEC Exhibition Hall 3',
    start_date: '2026-11-20',
    end_date: '2026-11-22',
    attendee_count: 850,
    budget_cents: 120000000, // ₹12 Lakhs
    status: 'planning',
    notes: 'Keynote hall requires crystal clear acoustics, curved LED backdrop, and 300 executive banquet chairs.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [requirements, setRequirements] = useState<EventRequirement[]>([]);
  const [customSelections, setCustomSelections] = useState<SelectedAllocation[]>([]);

  // Fetch initial master data
  const refreshData = async () => {
    try {
      const [cats, resList, bList] = await Promise.all([
        getCategories(),
        getResources(),
        getBookingRequests(),
      ]);
      setCategories(cats);
      setAllResources(resList);
      setBookings(bList);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Update organizer id if user profile changes
  useEffect(() => {
    if (profile?.id && activeEvent.organizer_id !== profile.id) {
      setActiveEvent((prev) => ({ ...prev, organizer_id: profile.id }));
    }
  }, [profile?.id]);

  // Seed default requirements once categories load
  useEffect(() => {
    if (categories.length > 0 && requirements.length === 0) {
      applyTemplate('techSummit');
    }
  }, [categories]);

  // Compute live deterministic matching evaluation
  const planEvaluation = useMemo(() => {
    return matchEventResources(
      activeEvent,
      requirements,
      allResources,
      [], // blackouts
      bookings,
      customSelections.length > 0 ? customSelections : undefined
    );
  }, [activeEvent, requirements, allResources, bookings, customSelections]);

  const updateEventBasics = (updates: Partial<EventPlan>) => {
    setActiveEvent((prev) => ({
      ...prev,
      ...updates,
      updated_at: new Date().toISOString(),
    }));
  };

  const addRequirement = (req: {
    categoryId: string;
    requirementName: string;
    specifications: string;
    requiredQuantity: number;
    maxUnitBudgetCents?: number;
  }) => {
    const cat = categories.find((c) => c.id === req.categoryId);
    const newReq: EventRequirement = {
      id: 'req-' + Math.random().toString(36).substring(2, 9),
      event_id: activeEvent.id,
      category_id: req.categoryId,
      requirement_name: req.requirementName,
      specifications: req.specifications || null,
      required_quantity: Math.max(1, req.requiredQuantity),
      max_unit_budget_cents: req.maxUnitBudgetCents || null,
      created_at: new Date().toISOString(),
      category: cat,
    };
    setRequirements((prev) => [...prev, newReq]);
    showToast('Requirement added', `Added "${req.requirementName}" to resource plan.`, 'info');
  };

  const updateRequirement = (id: string, updates: Partial<EventRequirement>) => {
    setRequirements((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updatedCat = updates.category_id
          ? categories.find((c) => c.id === updates.category_id)
          : r.category;
        return {
          ...r,
          ...updates,
          category: updatedCat,
        };
      })
    );
  };

  const removeRequirement = (id: string) => {
    setRequirements((prev) => prev.filter((r) => r.id !== id));
    setCustomSelections((prev) => prev.filter((s) => s.requirementId !== id));
    showToast('Requirement removed', 'Removed item requirement from event plan.', 'info');
  };

  const applyTemplate = (templateKey: string) => {
    const tpl = EVENT_TEMPLATES[templateKey];
    if (!tpl || categories.length === 0) return;

    setActiveEvent((prev) => ({
      ...prev,
      name: tpl.name,
      event_type: tpl.eventType,
      attendee_count: tpl.suggestedAttendeeCount,
      budget_cents: tpl.suggestedBudgetCents,
      notes: tpl.description,
    }));

    const newReqs: EventRequirement[] = tpl.requirements.map((r) => {
      const cat = categories.find((c) => c.slug === r.categorySlug) || categories[0];
      return {
        id: 'req-' + Math.random().toString(36).substring(2, 9),
        event_id: activeEvent.id,
        category_id: cat?.id || 'cat-sound',
        requirement_name: r.requirementName,
        specifications: r.specifications,
        required_quantity: r.requiredQuantity,
        max_unit_budget_cents: r.maxUnitBudgetCents || null,
        created_at: new Date().toISOString(),
        category: cat,
      };
    });

    setRequirements(newReqs);
    setCustomSelections([]);
    showToast('Template applied', `Loaded "${tpl.name}" with ${newReqs.length} equipment requirements.`, 'success');
  };

  const saveActivePlan = async (): Promise<boolean> => {
    if (!profile) {
      showToast('Login required', 'Please sign in to save your event plan.', 'error');
      return false;
    }

    setIsSaving(true);
    try {
      const saved = await saveEventPlan(
        {
          organizer_id: profile.id,
          name: activeEvent.name,
          event_type: activeEvent.event_type,
          location_city: activeEvent.location_city,
          venue_name: activeEvent.venue_name,
          start_date: activeEvent.start_date,
          end_date: activeEvent.end_date,
          attendee_count: activeEvent.attendee_count,
          budget_cents: activeEvent.budget_cents,
          status: activeEvent.status,
          notes: activeEvent.notes,
        },
        requirements.map((r) => ({
          category_id: r.category_id,
          requirement_name: r.requirement_name,
          specifications: r.specifications,
          required_quantity: r.required_quantity,
          max_unit_budget_cents: r.max_unit_budget_cents,
        })),
        activeEvent.id.startsWith('evt-draft-') ? undefined : activeEvent.id
      );

      setActiveEvent(saved);
      if (saved.requirements) {
        setRequirements(saved.requirements);
      }
      showToast('Plan saved', 'Event plan and resource requirements saved successfully.', 'success');
      return true;
    } catch (err: any) {
      showToast('Save failed', err.message || 'Could not save event plan.', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const loadSavedEvent = async (eventId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const evt = await getEventById(eventId);
      if (!evt) {
        showToast('Not found', 'Could not find the requested event plan.', 'error');
        return false;
      }
      setActiveEvent(evt);
      if (evt.requirements) {
        setRequirements(evt.requirements);
      }
      setCustomSelections([]);
      showToast('Event loaded', `Loaded plan "${evt.name}".`, 'info');
      return true;
    } catch (err: any) {
      showToast('Load error', err.message || 'Failed to load event.', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const submitAllBookingRequests = async (
    notes?: string
  ): Promise<{ success: boolean; requestsCount?: number }> => {
    if (!profile) {
      showToast('Login required', 'Please log in to submit booking requests.', 'error');
      return { success: false };
    }

    if (planEvaluation.allAllocations.length === 0) {
      showToast('No allocations', 'Add requirements and select resources before submitting requests.', 'error');
      return { success: false };
    }

    setIsSaving(true);
    try {
      // 1. Ensure event is saved in database first
      const isSaved = await saveActivePlan();
      if (!isSaved) throw new Error('Failed to persist event plan prior to booking');

      // 2. Submit multi-provider requests
      const createdRequests = await submitMultiProviderBookingRequests(
        activeEvent,
        planEvaluation.allAllocations,
        profile.id,
        notes
      );

      // 3. Refresh bookings and update event status
      await refreshData();
      setActiveEvent((prev) => ({ ...prev, status: 'requests_sent' }));

      showToast(
        'Requests dispatched!',
        `Successfully sent ${createdRequests.length} booking request(s) to matched equipment providers.`,
        'success'
      );
      return { success: true, requestsCount: createdRequests.length };
    } catch (err: any) {
      showToast('Booking failed', err.message || 'Error creating booking requests.', 'error');
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  };

  const resetToNewEvent = () => {
    setActiveEvent({
      id: 'evt-draft-' + Date.now(),
      organizer_id: profile?.id || 'usr-organizer-demo',
      name: 'New Corporate Event',
      event_type: 'Conference',
      location_city: profile?.city || 'Bengaluru',
      venue_name: '',
      start_date: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 86400000 * 16).toISOString().split('T')[0],
      attendee_count: 300,
      budget_cents: 35000000, // ₹3.5 Lakhs
      status: 'planning',
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setRequirements([]);
    setCustomSelections([]);
  };

  return (
    <EventContext.Provider
      value={{
        activeEvent,
        requirements,
        categories,
        allResources,
        bookings,
        isLoading,
        isSaving,
        planEvaluation,
        customSelections,
        updateEventBasics,
        addRequirement,
        updateRequirement,
        removeRequirement,
        applyTemplate,
        saveActivePlan,
        loadSavedEvent,
        submitAllBookingRequests,
        resetToNewEvent,
        refreshData,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error('useEvent must be used within EventProvider');
  return ctx;
}
