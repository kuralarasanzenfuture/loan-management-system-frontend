import React from "react";
import {
  Pencil,
  Trash2,
  Eye,
  Percent,
  Landmark,
  ShieldAlert,
} from "lucide-react";
import {
  INTEREST_FREQUENCY_LABELS,
  STATUS_STYLES,
  formatInterestValue,
  formatCommissionValue,
} from "../utils/interestPlanHelpers.js";
import usePermissions from "../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../constants/permissions.js";

/**
 * InterestLoanPlanTable
 * Props:
 * - plans (array)
 * - loading (bool)
 * - canView (bool)
 * - canEdit (bool)
 * - canDelete (bool)
 * - onView (fn) / onEdit (fn) / onDelete (fn) / onToggleStatus (fn)
 */
export default function InterestLoanPlanTable({
  plans = [],
  loading,
  canView: canViewProp,
  canEdit: canEditProp,
  canDelete: canDeleteProp,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  const { can } = usePermissions();

  const canView =
    canViewProp !== undefined
      ? canViewProp
      : can([
          PERMISSIONS.INTEREST_LOAN_PLAN_VIEW,
          PERMISSIONS.LOAN_PLAN_VIEW,
        ]);
  const canEdit =
    canEditProp !== undefined
      ? canEditProp
      : can([
          PERMISSIONS.INTEREST_LOAN_PLAN_EDIT,
          PERMISSIONS.LOAN_PLAN_EDIT,
        ]);
  const canDelete =
    canDeleteProp !== undefined
      ? canDeleteProp
      : can([
          PERMISSIONS.INTEREST_LOAN_PLAN_DELETE,
          PERMISSIONS.LOAN_PLAN_DELETE,
        ]);

  const hasAnyAction = canView || canEdit || canDelete;
  const planList = Array.isArray(plans) ? plans : [];

  if (loading && planList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md text-primary" />
        <p className="text-sm">Loading interest plans…</p>
      </div>
    );
  }

  if (!loading && planList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-base-300 text-base-content/40">
          <Percent size={20} />
        </span>
        <p className="text-sm font-medium text-base-content/70">
          No interest-only plans found
        </p>
        <p className="text-xs text-base-content/40">
          Create your first interest-only loan plan to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-base-content/50 border-b border-base-300">
            <th className="font-medium">Plan</th>
            <th className="font-medium">Interest</th>
            <th className="font-medium">Tenure</th>
            <th className="font-medium">Commission</th>
            <th className="font-medium w-24">Penalty</th>
            <th className="font-medium w-24">Status</th>
            {hasAnyAction && (
              <th className="text-right font-medium w-32">Actions</th>
            )}
          </tr>
        </thead>

        <tbody>
          {planList.map((plan) => (
            <tr
              key={plan.id}
              className="border-b border-base-200 last:border-0 hover:bg-base-200/50 transition-colors"
            >
              <td>
                <div className="flex items-center gap-3 py-1">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary shrink-0">
                    <Percent size={16} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      {plan.plan_name}
                    </div>
                    <div className="text-[11px] text-base-content/40 font-mono">
                      {plan.plan_code}
                    </div>
                  </div>
                </div>
              </td>

              <td className="text-xs">
                <div className="font-semibold text-base-content/80">
                  {formatInterestValue(plan)}
                </div>
                <div className="text-[10px] text-base-content/40">
                  {INTEREST_FREQUENCY_LABELS[plan.interest_frequency] ||
                    plan.interest_frequency}
                </div>
              </td>

              <td className="text-xs text-base-content/60">
                {plan.tenure} {plan.tenure_type}
              </td>

              <td className="text-xs text-base-content/60">
                {formatCommissionValue(plan)}
              </td>

              <td>
                {plan.penalty_enabled ? (
                  <span className="badge badge-warning badge-outline badge-sm gap-1 font-medium">
                    <ShieldAlert size={10} /> Enabled
                  </span>
                ) : (
                  <span className="text-xs text-base-content/30">Off</span>
                )}
              </td>

              <td>
                {canEdit ? (
                  <button
                    onClick={() => onToggleStatus(plan)}
                    className={`badge gap-1.5 font-medium badge-sm cursor-pointer hover:opacity-80 transition-opacity ${
                      STATUS_STYLES[plan.status] || "badge-ghost"
                    }`}
                    title="Click to toggle status"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {plan.status
                      ? plan.status.charAt(0).toUpperCase() +
                        plan.status.slice(1)
                      : "Unknown"}
                  </button>
                ) : (
                  <span
                    className={`badge gap-1.5 font-medium badge-sm cursor-default ${
                      STATUS_STYLES[plan.status] || "badge-ghost"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {plan.status
                      ? plan.status.charAt(0).toUpperCase() +
                        plan.status.slice(1)
                      : "Unknown"}
                  </span>
                )}
              </td>

              {hasAnyAction && (
                <td>
                  <div className="flex justify-end gap-1.5">
                    {canView && (
                      <button
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={() => onView(plan)}
                        title="View plan"
                      >
                        <Eye size={15} />
                      </button>
                    )}
                    {canEdit && (
                      <button
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={() => onEdit(plan)}
                        title="Edit plan"
                      >
                        <Pencil size={15} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                        onClick={() => onDelete(plan)}
                        title="Delete plan"
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
