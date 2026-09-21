import React from "react";
import {
  Pencil,
  Trash2,
  Eye,
  Percent,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  INTEREST_FREQUENCY_LABELS,
  PRINCIPAL_BASIS_LABELS,
  CALCULATION_METHOD_LABELS,
  STATUS_STYLES,
  formatInterestValue,
} from "../utils/interestPlanHelpers.js";

/**
 * InterestPlanTable
 * Displays the list of anytime interest loan plans.
 */
export default function InterestPlanTable({
  plans = [],
  loading,
  canView = true,
  canEdit = true,
  canDelete = true,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  const planList = Array.isArray(plans) ? plans : [];
  const hasAnyAction = canView || canEdit || canDelete;

  if (loading && planList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-base-content/40 gap-3">
        <span className="loading loading-spinner loading-md text-primary" />
        <p className="text-sm font-medium">Loading interest plans…</p>
      </div>
    );
  }

  if (!loading && planList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-base-200 text-base-content/40 shadow-inner">
          <Percent size={24} />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-base-content/80">
            No interest plans found
          </p>
          <p className="text-xs text-base-content/40 max-w-sm">
            Create an interest loan plan to configure interest rates, frequency, and repayment terms.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-base-content/50 border-b border-base-200 bg-base-200/40">
            <th className="font-semibold py-3 pl-4">Plan</th>
            <th className="font-semibold py-3">Interest Rate</th>
            <th className="font-semibold py-3">Frequency</th>
            <th className="font-semibold py-3">Principal Basis</th>
            <th className="font-semibold py-3">Method</th>
            <th className="font-semibold py-3 w-28">Status</th>
            {hasAnyAction && (
              <th className="text-right font-semibold py-3 pr-4 w-32">Actions</th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-base-200 text-sm">
          {planList.map((plan) => (
            <tr
              key={plan.id}
              className="hover:bg-base-200/40 transition-colors group"
            >
              {/* Plan Info */}
              <td className="py-3.5 pl-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary shrink-0">
                    <Percent size={16} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-base-content group-hover:text-primary transition-colors">
                      {plan.plan_name}
                    </div>
                    <div className="text-[11px] text-base-content/40 font-mono mt-0.5">
                      {plan.plan_code}
                    </div>
                  </div>
                </div>
              </td>

              {/* Interest Value & Type */}
              <td className="py-3.5">
                <div className="font-semibold text-base-content/90">
                  {formatInterestValue(plan)}
                </div>
                <div className="text-[10px] text-base-content/40 capitalize">
                  {plan.interest_type || "percentage"}
                </div>
              </td>

              {/* Frequency */}
              <td className="py-3.5 text-xs text-base-content/70">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-base-200 text-xs font-medium">
                  <Clock size={12} className="text-base-content/40" />
                  {INTEREST_FREQUENCY_LABELS[plan.interest_frequency] ||
                    plan.interest_frequency}
                </span>
              </td>

              {/* Principal Basis */}
              <td className="py-3.5 text-xs text-base-content/70">
                {PRINCIPAL_BASIS_LABELS[plan.principal_basis] ||
                  plan.principal_basis}
              </td>

              {/* Method */}
              <td className="py-3.5 text-xs text-base-content/70">
                {CALCULATION_METHOD_LABELS[plan.calculation_method] ||
                  plan.calculation_method ||
                  "Simple"}
              </td>

              {/* Status */}
              <td className="py-3.5">
                {canEdit && onToggleStatus ? (
                  <button
                    type="button"
                    onClick={() => onToggleStatus(plan)}
                    title="Click to toggle status"
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <span
                      className={`badge badge-sm font-medium ${
                        STATUS_STYLES[plan.status] || "badge-ghost"
                      }`}
                    >
                      {plan.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </button>
                ) : (
                  <span
                    className={`badge badge-sm font-medium ${
                      STATUS_STYLES[plan.status] || "badge-ghost"
                    }`}
                  >
                    {plan.status === "active" ? "Active" : "Inactive"}
                  </span>
                )}
              </td>

              {/* Actions */}
              {hasAnyAction && (
                <td className="py-3.5 pr-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {canView && onView && (
                      <button
                        className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-primary"
                        onClick={() => onView(plan)}
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                    )}
                    {canEdit && onEdit && (
                      <button
                        className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-info"
                        onClick={() => onEdit(plan)}
                        title="Edit Plan"
                      >
                        <Pencil size={15} />
                      </button>
                    )}
                    {canDelete && onDelete && (
                      <button
                        className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-error"
                        onClick={() => onDelete(plan)}
                        title="Delete Plan"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
