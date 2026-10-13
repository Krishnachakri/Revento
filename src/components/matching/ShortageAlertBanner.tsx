import React from 'react';
import { RequirementMatchResult } from '../../types/matching';
import { AlertTriangle, Info, PlusCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../lib/currency';

interface ShortageAlertBannerProps {
  results: RequirementMatchResult[];
  onSelectAlternative?: (requirementId: string, resourceId: string) => void;
}

export function ShortageAlertBanner({
  results,
  onSelectAlternative,
}: ShortageAlertBannerProps) {
  const shortages = results.filter(
    (r) => r.status === 'partially_matched' || r.status === 'unfulfilled'
  );

  if (shortages.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-emerald-900">
            Zero Resource Shortages Detected
          </h4>
          <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
            All required equipment quantities are completely fulfilled across verified providers for your selected event dates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-amber-50/90 border border-amber-200 shadow-sm space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-100 text-amber-800 flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-amber-950">
              Honest Shortage Detection ({shortages.length} requirement{shortages.length > 1 ? 's' : ''} affected)
            </h4>
            <Badge variant="warning">Action Needed</Badge>
          </div>
          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
            ReVento verifies real-time provider inventory. The items below cannot be 100% satisfied with current available quantities for your dates:
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {shortages.map((item) => (
          <div
            key={item.requirement.id}
            className="p-3.5 rounded-xl bg-white/90 border border-amber-200/70 text-xs text-slate-700 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-900 text-sm">
                  {item.requirement.requirement_name}
                </span>
                <span className="text-slate-400 ml-2">
                  (Category: {item.requirement.category?.name || 'Equipment'})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">
                  Required: <strong>{item.requiredQuantity}</strong>
                </span>
                <span className="text-emerald-700">
                  Allocated: <strong>{item.allocatedQuantity}</strong>
                </span>
                <Badge variant="error" size="sm">
                  Missing {item.shortageQuantity} units
                </Badge>
              </div>
            </div>

            <p className="text-[11px] text-amber-900 mt-1.5 font-medium">
              ⚠️ {item.shortageNote}
            </p>

            {/* Recommended Alternatives */}
            {item.alternativeOptions && item.alternativeOptions.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-1.5">
                  <Info className="w-3.5 h-3.5 text-sky-500" />
                  Compatible Alternative Inventory in Market:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {item.alternativeOptions.map((alt) => (
                    <div
                      key={alt.resource.id}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <p className="font-semibold text-slate-800 truncate">{alt.resource.title}</p>
                        <p className="text-[10px] text-slate-500">
                          {formatCurrency(alt.dailyPriceCents)}/day • {alt.availableQuantity} available in {alt.resource.location_city}
                        </p>
                      </div>
                      <Badge variant="neutral" size="sm">
                        Score: {alt.scoreBreakdown.totalScore}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
