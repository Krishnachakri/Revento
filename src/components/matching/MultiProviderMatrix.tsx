import React from 'react';
import { PlanEvaluation } from '../../types/matching';
import { formatCurrency } from '../../lib/currency';
import { Layers, Building, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface MultiProviderMatrixProps {
  evaluation: PlanEvaluation;
}

export function MultiProviderMatrix({ evaluation }: MultiProviderMatrixProps) {
  const { requirementResults, rentalDays, totalEstimatedCostCents } = evaluation;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>Combined Multi-Provider Resource Plan</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Full itemized mapping across multiple verified suppliers for {rentalDays} rental day{rentalDays > 1 ? 's' : ''}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-500 font-medium">Estimated Combined Total</p>
          <p className="text-xl font-extrabold text-slate-900">
            {formatCurrency(totalEstimatedCostCents)}
          </p>
        </div>
      </div>

      {/* Plan Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Event Requirement</th>
              <th className="py-3 px-4 text-center">Qty Needed</th>
              <th className="py-3 px-4">Selected Provider & Equipment</th>
              <th className="py-3 px-4 text-center">Qty Allocated</th>
              <th className="py-3 px-4 text-right">Daily Rate</th>
              <th className="py-3 px-4 text-center">Days</th>
              <th className="py-3 px-4 text-right">Line Subtotal</th>
              <th className="py-3 px-4 text-center">Fulfillment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requirementResults.map((result) => {
              const req = result.requirement;
              const hasAllocations = result.allocations.length > 0;

              if (!hasAllocations) {
                return (
                  <tr key={req.id} className="bg-rose-50/30">
                    <td className="py-4 px-4 font-semibold text-slate-900">
                      <div>{req.requirement_name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {req.specifications || req.category?.name}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-slate-700">
                      {req.required_quantity}
                    </td>
                    <td colSpan={5} className="py-4 px-4 text-rose-600 italic">
                      No matching equipment available for the selected dates
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge variant="error" size="sm">
                        0% Fulfilled
                      </Badge>
                    </td>
                  </tr>
                );
              }

              return result.allocations.map((alloc, allocIdx) => (
                <tr
                  key={`${req.id}-${alloc.resourceId}-${allocIdx}`}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {/* First row of requirement prints requirement info; subsequent rows stay clean */}
                  {allocIdx === 0 ? (
                    <>
                      <td
                        rowSpan={result.allocations.length}
                        className="py-4 px-4 font-semibold text-slate-900 align-top border-r border-slate-100"
                      >
                        <div className="font-bold text-sm text-slate-950">{req.requirement_name}</div>
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5 line-clamp-2">
                          {req.specifications || req.category?.name}
                        </div>
                        {result.shortageQuantity > 0 && (
                          <div className="mt-2 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Shortage: -{result.shortageQuantity} units
                          </div>
                        )}
                      </td>
                      <td
                        rowSpan={result.allocations.length}
                        className="py-4 px-4 text-center font-extrabold text-slate-800 align-top border-r border-slate-100 text-sm"
                      >
                        {req.required_quantity}
                      </td>
                    </>
                  ) : null}

                  {/* Provider & Equipment info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {alloc.resourceImage && (
                        <img
                          src={alloc.resourceImage}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-slate-900 line-clamp-1">
                          {alloc.resourceTitle}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{alloc.providerCompany || alloc.providerName}</span>
                          <span className="text-slate-400">({alloc.providerCity})</span>
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Allocated quantity */}
                  <td className="py-3 px-4 text-center font-bold text-slate-900 text-sm">
                    {alloc.allocatedQuantity}
                  </td>

                  {/* Daily Price */}
                  <td className="py-3 px-4 text-right font-medium text-slate-600">
                    {formatCurrency(alloc.dailyPriceCents)}
                  </td>

                  {/* Rental days */}
                  <td className="py-3 px-4 text-center text-slate-600">{alloc.rentalDays}d</td>

                  {/* Line Subtotal */}
                  <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                    {formatCurrency(alloc.subtotalCents)}
                  </td>

                  {/* Fulfillment status pill on first row */}
                  {allocIdx === 0 ? (
                    <td
                      rowSpan={result.allocations.length}
                      className="py-3 px-4 text-center align-middle border-l border-slate-100"
                    >
                      {result.status === 'fully_matched_single' && (
                        <Badge variant="success" size="sm" dot>
                          100% Single
                        </Badge>
                      )}
                      {result.status === 'fully_matched_combined' && (
                        <Badge variant="purple" size="sm" dot>
                          100% Combined ({result.allocations.length} suppliers)
                        </Badge>
                      )}
                      {result.status === 'partially_matched' && (
                        <Badge variant="warning" size="sm" dot>
                          {Math.round((result.allocatedQuantity / req.required_quantity) * 100)}% Partial
                        </Badge>
                      )}
                    </td>
                  ) : null}
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
