import React from "react";
import {
  Pencil,
  Trash2,
  Eye,
  Landmark,
  Percent,
  IndianRupee,
} from "lucide-react";
import usePermissions from "../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../constants/permissions.js";

const STATUS_STYLES = {
  active: "badge-success badge-outline",
  inactive: "badge-error badge-outline",
};

const FREQUENCY_LABELS = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

/**
 * LoanPlanTable
 *
 * Props:
 * - plans     (array)
 * - loading   (bool)
 * - canView   (bool)
 * - canEdit   (bool)
 * - canDelete (bool)
 * - onView    (fn)
 * - onEdit    (fn)
 * - onDelete  (fn)
 */
export default function LoanPlanTable({
  plans,
  loading,
  canView: canViewProp,
  canEdit: canEditProp,
  canDelete: canDeleteProp,
  onView,
  onEdit,
  onDelete,
}) {
  const { can } = usePermissions();

  const canView = canViewProp !== undefined ? canViewProp : can(PERMISSIONS.LOAN_PLAN_VIEW);
  const canEdit = canEditProp !== undefined ? canEditProp : can(PERMISSIONS.LOAN_PLAN_EDIT);
  const canDelete = canDeleteProp !== undefined ? canDeleteProp : can(PERMISSIONS.LOAN_PLAN_DELETE);

  const hasAnyAction = canView || canEdit || canDelete;

  if (loading && plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md text-primary" />
        <p className="text-sm">Loading loan plans…</p>
      </div>
    );
  }

  if (!loading && plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-base-200 text-base-content/30">
          <Landmark size={22} />
        </span>
        <div>
          <p className="text-sm font-semibold text-base-content/70">
            No loan plans found
          </p>
          <p className="text-xs text-base-content/40 mt-0.5">
            Create your first loan plan to get started.
          </p>
        </div>
      </div>
    );
  }

  const formatCommission = (plan) =>
    plan.commission_type === "percentage"
      ? `${Number(plan.commission_value).toFixed(2)}%`
      : `₹${Number(plan.commission_value).toLocaleString("en-IN")}`;

  const formatPenalty = (plan) => {
    if (plan.penalty_value == null) return null;
    return plan.penalty_type === "percentage"
      ? `${Number(plan.penalty_value).toFixed(2)}%`
      : `₹${Number(plan.penalty_value).toLocaleString("en-IN")}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-base-content/50 border-b border-base-200 bg-base-200/30">
            <th className="w-12 font-semibold py-3">#</th>
            <th className="font-semibold py-3">Plan</th>
            <th className="font-semibold py-3">Collection</th>
            <th className="font-semibold py-3">Commission</th>
            <th className="font-semibold py-3">Penalty</th>
            <th className="font-semibold py-3 w-24">Status</th>
            {hasAnyAction && <th className="font-semibold py-3 text-right w-28">Actions</th>}
          </tr>
        </thead>

        <tbody>
          {plans.map((plan, index) => (
            <tr
              key={plan.id}
              className={`border-b border-base-200 last:border-0 hover:bg-base-200/40 transition-colors group ${
                canView ? "cursor-pointer" : ""
              }`}
              onClick={() => {
                if (canView && onView) onView(plan);
              }}
            >
              <td className="text-base-content/40 text-xs py-3">{index + 1}</td>

              <td className="py-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary shrink-0">
                    <Landmark size={16} />
                  </div>
                  <div>
                    <div
                      className={`font-semibold text-sm text-base-content transition-colors ${
                        canView ? "group-hover:text-primary" : ""
                      }`}
                    >
                      {plan.plan_name}
                    </div>
                    <div className="text-[11px] text-base-content/40 font-mono">
                      {plan.plan_code}
                    </div>
                  </div>
                </div>
              </td>

              <td className="py-3">
                <div className="text-xs text-base-content/70 font-medium">
                  {FREQUENCY_LABELS[plan.collection_frequency] ||
                    plan.collection_frequency}
                </div>
                <div className="text-[11px] text-base-content/40">
                  {plan.tenure} {plan.tenure_type}
                </div>
              </td>

              <td className="py-3">
                <span className="flex items-center gap-1 text-xs font-semibold text-base-content/70">
                  {plan.commission_type === "percentage" ? (
                    <Percent size={12} className="text-base-content/30" />
                  ) : (
                    <IndianRupee size={12} className="text-base-content/30" />
                  )}
                  {formatCommission(plan)}
                </span>
              </td>

              <td className="py-3">
                {formatPenalty(plan) ? (
                  <div>
                    <span className="text-xs font-semibold text-base-content/70">
                      {formatPenalty(plan)}
                    </span>
                    {plan.grace_days > 0 && (
                      <div className="text-[11px] text-base-content/40">
                        {plan.grace_days}d grace
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-base-content/30">Not set</span>
                )}
              </td>

              <td className="py-3">
                <span
                  className={`badge gap-1 font-medium badge-sm ${STATUS_STYLES[plan.status] || "badge-ghost"}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {plan.status
                    ? plan.status.charAt(0).toUpperCase() + plan.status.slice(1)
                    : "Unknown"}
                </span>
              </td>

              {hasAnyAction && (
                <td className="py-3">
                  <div
                    className="flex justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {canView && (
                      <button
                        id={`view-loan-plan-${plan.id}`}
                        className="btn btn-ghost btn-xs btn-square rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-base-content/70 hover:text-primary"
                        onClick={() => onView && onView(plan)}
                        aria-label={`View ${plan.plan_name}`}
                        title="View details"
                      >
                        <Eye size={14} />
                      </button>
                    )}

                    {canEdit && (
                      <button
                        id={`edit-loan-plan-${plan.id}`}
                        className="btn btn-ghost btn-xs btn-square rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-base-content/70 hover:text-primary"
                        onClick={() => onEdit && onEdit(plan)}
                        aria-label={`Edit ${plan.plan_name}`}
                        title="Edit plan"
                      >
                        <Pencil size={14} />
                      </button>
                    )}

                    {canDelete && (
                      <button
                        id={`delete-loan-plan-${plan.id}`}
                        className="btn btn-ghost btn-xs btn-square rounded-lg text-error hover:bg-error/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onDelete && onDelete(plan)}
                        aria-label={`Delete ${plan.plan_name}`}
                        title="Delete plan"
                      >
                        <Trash2 size={14} />
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
