import React, { useState } from 'react';
import { Resource } from '../../types/database';
import { formatCurrency } from '../../lib/currency';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Edit2, Trash2, Power, Eye, AlertCircle } from 'lucide-react';
import { updateResource, deleteResource } from '../../lib/supabase';
import { useNotification } from '../../context/NotificationContext';

interface ProviderInventoryTableProps {
  resources: Resource[];
  providerId: string;
  onEditResource: (resource: Resource) => void;
  onRefresh: () => void;
}

export function ProviderInventoryTable({
  resources,
  providerId,
  onEditResource,
  onRefresh,
}: ProviderInventoryTableProps) {
  const { showToast } = useNotification();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleToggleAvailability = async (resource: Resource) => {
    setProcessingId(resource.id);
    try {
      await updateResource(resource.id, { is_available: !resource.is_available });
      showToast(
        'Inventory Updated',
        `"${resource.title}" is now ${!resource.is_available ? 'available' : 'marked unavailable'}.`,
        'success'
      );
      onRefresh();
    } catch (err: any) {
      showToast('Update Failed', err.message || 'Could not update availability.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (resource: Resource) => {
    if (!confirm(`Are you sure you want to delete "${resource.title}" from your inventory?`)) {
      return;
    }

    setProcessingId(resource.id);
    try {
      await deleteResource(resource.id, providerId);
      showToast('Deleted', `"${resource.title}" was removed from your inventory.`, 'info');
      onRefresh();
    } catch (err: any) {
      showToast('Cannot Delete', err.message || 'Failed to delete equipment.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  if (resources.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
        <p className="text-slate-500 text-sm">No equipment resources listed yet.</p>
        <p className="text-xs text-slate-400">
          List your idle audio, lighting, video, or staging inventory to receive booking requests from corporate event organizers.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Equipment & Model</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-center">Stock Units</th>
              <th className="py-3 px-4 text-right">Daily Rental Rate</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {resources.map((res) => (
              <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        res.image_urls?.[0] ||
                        'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'
                      }
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">{res.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        {res.model_or_specs || res.location_city}
                      </span>
                      {res.is_seed && (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          Demo Listing
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4 text-slate-600 font-medium">
                  {res.category?.name || 'Equipment'}
                </td>

                <td className="py-3 px-4 text-center font-bold text-slate-800 text-sm">
                  {res.total_quantity}
                </td>

                <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                  {formatCurrency(res.price_per_day_cents)}
                </td>

                <td className="py-3 px-4 text-center">
                  {res.is_available ? (
                    <Badge variant="success" size="sm" dot>
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm" dot>
                      Paused
                    </Badge>
                  )}
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleToggleAvailability(res)}
                      disabled={processingId === res.id}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                      title={res.is_available ? 'Mark Unavailable' : 'Mark Available'}
                    >
                      <Power
                        className={`w-3.5 h-3.5 ${
                          res.is_available ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => onEditResource(res)}
                      disabled={processingId === res.id}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                      title="Edit Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(res)}
                      disabled={processingId === res.id}
                      className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
