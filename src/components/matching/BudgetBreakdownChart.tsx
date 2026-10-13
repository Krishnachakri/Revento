import React from 'react';
import { PlanEvaluation } from '../../types/matching';
import { formatCurrency } from '../../lib/currency';
import { DollarSign, PieChart, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface BudgetBreakdownChartProps {
  evaluation: PlanEvaluation;
}

export function BudgetBreakdownChart({ evaluation }: BudgetBreakdownChartProps) {
  const {
    totalEstimatedCostCents,
    budgetCents,
    budgetDeltaCents,
    isOverBudget,
    budgetUtilizationPercent,
    providerSplits,
  } = evaluation;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-600" />
            <span>Budget & Financial Comparison</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time calculation based on verified daily rates and rental duration
          </p>
        </div>

        <div>
          {isOverBudget ? (
            <Badge variant="error" size="md" dot>
              Budget Overrun: {formatCurrency(Math.abs(budgetDeltaCents))}
            </Badge>
          ) : (
            <Badge variant="success" size="md" dot>
              Buffer Remaining: {formatCurrency(budgetDeltaCents)}
            </Badge>
          )}
        </div>
      </div>

      {/* KPI 3-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Allocated Budget
          </p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">
            {formatCurrency(budgetCents)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Target cap for this event</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Estimated Equipment Cost
          </p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">
            {formatCurrency(totalEstimatedCostCents)}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {budgetUtilizationPercent}% of budget utilized
          </p>
        </div>

        <div
          className={`p-4 rounded-xl border ${
            isOverBudget
              ? 'bg-rose-50/70 border-rose-200 text-rose-950'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
            {isOverBudget ? 'Budget Overrun' : 'Remaining Savings'}
          </p>
          <p className="text-xl font-extrabold mt-1">
            {formatCurrency(Math.abs(budgetDeltaCents))}
          </p>
          <p className="text-[11px] mt-0.5 opacity-80 flex items-center gap-1">
            {isOverBudget ? (
              <>
                <AlertCircle className="w-3 h-3" />
                Exceeds planned ceiling
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3" />
                Within target allocation
              </>
            )}
          </p>
        </div>
      </div>

      {/* Utilization Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-medium">Budget Consumption</span>
          <span className="font-bold text-slate-900">{budgetUtilizationPercent}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverBudget
                ? 'bg-rose-500'
                : budgetUtilizationPercent > 85
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, budgetUtilizationPercent)}%` }}
          />
        </div>
      </div>

      {/* Provider Subtotals Matrix */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Estimated Spend by Equipment Partner
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.values(providerSplits).map((split) => (
            <div
              key={split.providerId}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 text-xs truncate">
                    {split.providerCompany || split.providerName}
                  </span>
                  <span className="text-[10px] text-slate-400">{split.providerCity}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {split.items.length} item line{split.items.length > 1 ? 's' : ''} allocated
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Subtotal:</span>
                <span className="text-xs font-bold text-slate-900">
                  {formatCurrency(split.totalAmountCents)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-100 text-slate-600 text-[11px] leading-relaxed">
        <strong>Notice:</strong> Figures represent calculated estimated costs based on stated provider rental rates. Final charges are confirmed upon provider request acceptance.
      </div>
    </div>
  );
}
