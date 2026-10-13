import React, { useState } from 'react';
import { BookingRequest, BookingStatus } from '../../types/database';
import { formatCurrency, formatDateDisplay, calculateRentalDays } from '../../lib/currency';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Calendar, User, Building, Clock, Check, X, Ban, AlertCircle } from 'lucide-react';
import { updateBookingRequestStatus } from '../../lib/supabase';
import { useNotification } from '../../context/NotificationContext';

interface BookingRequestCardProps {
  request: BookingRequest;
  viewerRole: 'organizer' | 'provider';
  currentUserId: string;
  onStatusUpdated: () => void;
}

export function BookingRequestCard({
  request,
  viewerRole,
  currentUserId,
  onStatusUpdated,
}: BookingRequestCardProps) {
  const { showToast } = useNotification();
  const [isProcessing, setIsProcessing] = useState(false);
  const [responseNotes, setResponseNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);

  const rentalDays = calculateRentalDays(request.start_date, request.end_date);

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="success" dot>Confirmed / Accepted</Badge>;
      case 'pending':
        return <Badge variant="warning" dot>Pending Provider Review</Badge>;
      case 'declined':
        return <Badge variant="error" dot>Declined by Provider</Badge>;
      case 'cancelled':
        return <Badge variant="neutral" dot>Cancelled by Organizer</Badge>;
      case 'completed':
        return <Badge variant="purple" dot>Completed Event</Badge>;
    }
  };

  const handleAction = async (newStatus: BookingStatus) => {
    setIsProcessing(true);
    try {
      const result = await updateBookingRequestStatus(
        request.id,
        currentUserId,
        newStatus,
        responseNotes.trim() || undefined
      );

      if (!result.success) {
        showToast('Action Failed', result.error || 'Could not update request status.', 'error');
      } else {
        showToast(
          'Booking Updated',
          `Request ${request.request_number} marked as ${newStatus}.`,
          'success'
        );
        onStatusUpdated();
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Operation failed', 'error');
    } finally {
      setIsProcessing(false);
      setShowNotesInput(false);
    }
  };

  const isProvider = viewerRole === 'provider' || request.provider_id === currentUserId;
  const isOrganizer = viewerRole === 'organizer' || request.organizer_id === currentUserId;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs text-slate-500 uppercase">
              {request.request_number}
            </span>
            {getStatusBadge(request.status)}
          </div>
          <h4 className="font-bold text-slate-900 text-sm mt-1">
            {request.event?.name || 'Event Booking Request'}
          </h4>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500">Estimated Total: </span>
          <span className="text-base font-extrabold text-slate-900">
            {formatCurrency(request.total_amount_cents)}
          </span>
        </div>
      </div>

      {/* Parties & Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
        <div className="space-y-1">
          <p className="text-slate-500 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Provider:</span>{' '}
            <strong className="text-slate-800">
              {request.provider?.company_name || request.provider?.full_name || 'Partner'}
            </strong>
          </p>
          <p className="text-slate-500 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Organizer:</span>{' '}
            <strong className="text-slate-800">
              {request.organizer?.full_name} ({request.organizer?.company_name || 'Client'})
            </strong>
          </p>
        </div>

        <div className="space-y-1 sm:text-right">
          <p className="text-slate-600 flex items-center sm:justify-end gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {formatDateDisplay(request.start_date)} - {formatDateDisplay(request.end_date)}
            </span>
          </p>
          <p className="text-[11px] text-slate-500">
            Rental Duration: <strong>{rentalDays} day{rentalDays > 1 ? 's' : ''}</strong>
          </p>
        </div>
      </div>

      {/* Equipment items in this request */}
      {request.items && request.items.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Allocated Items ({request.items.length})
          </p>
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
            {request.items.map((item) => (
              <div key={item.id} className="p-2.5 flex items-center justify-between bg-white">
                <div>
                  <span className="font-semibold text-slate-800">
                    {item.resource?.title || 'Resource'}
                  </span>
                  <span className="text-slate-500 text-[11px] ml-2">
                    ({item.quantity} units @ {formatCurrency(item.daily_price_cents)}/day)
                  </span>
                </div>
                <div className="font-bold text-slate-900">
                  {formatCurrency(item.subtotal_cents)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {request.organizer_notes && (
        <div className="text-xs bg-sky-50/70 p-2.5 rounded-lg border border-sky-100 text-sky-950">
          <strong>Organizer Note:</strong> {request.organizer_notes}
        </div>
      )}
      {request.provider_notes && (
        <div className="text-xs bg-slate-100 p-2.5 rounded-lg border border-slate-200 text-slate-800">
          <strong>Provider Response:</strong> {request.provider_notes}
        </div>
      )}

      {/* Action buttons */}
      {request.status === 'pending' && (
        <div className="pt-2 border-t border-slate-100">
          {showNotesInput ? (
            <div className="space-y-2 mb-3">
              <input
                type="text"
                placeholder="Optional notes or response comments..."
                value={responseNotes}
                onChange={(e) => setResponseNotes(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300"
              />
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-2">
            {!showNotesInput && (
              <button
                type="button"
                onClick={() => setShowNotesInput(true)}
                className="text-xs text-slate-500 hover:text-slate-700 underline mr-auto"
              >
                + Add response note
              </button>
            )}

            {/* Provider actions */}
            {isProvider && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction('declined')}
                  isLoading={isProcessing}
                  leftIcon={<X className="w-3.5 h-3.5 text-rose-500" />}
                  className="text-xs"
                >
                  Decline Request
                </Button>
                <Button
                  variant="emerald"
                  size="sm"
                  onClick={() => handleAction('accepted')}
                  isLoading={isProcessing}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Accept & Confirm Booking
                </Button>
              </>
            )}

            {/* Organizer cancel action */}
            {isOrganizer && !isProvider && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('cancelled')}
                isLoading={isProcessing}
                leftIcon={<Ban className="w-3.5 h-3.5 text-rose-500" />}
                className="text-xs text-rose-700 hover:bg-rose-50 border-rose-200"
              >
                Cancel Pending Request
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
