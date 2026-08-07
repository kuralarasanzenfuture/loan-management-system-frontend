import React from "react";
import {
  Pencil,
  Trash2,
  Eye,
  Landmark,
  Percent,
  IndianRupee,
} from "lucide-react";

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
 * Matches the flattened API response shape:
 * { id, plan_name, plan_code, collection_frequency, tenure, tenure_type,
 *   commission_type, commission_value, status,
 *   grace_days, penalty_type, penalty_value, max_penalty }
 *
 * Props:
 * - plans (array)
 * - loading (bool)
 * - onView (fn)
 * - onEdit (fn)
 * - onDelete (fn)
 */
export default function LoanPlanTable({
  plans,
  loading,
  onView,
  onEdit,
  onDelete,
}) {
  if (loading && plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading loan plans…</p>
      </div>
    );
  }

  if (!loading && plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-base-300 text-base-content/40">
          <Landmark size={20} />
        </span>
        <p className="text-sm font-medium text-base-content/70">
          No loan plans found
        </p>
        <p className="text-xs text-base-content/40">
          Create your first loan plan to get started.
        </p>
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
      <table className="table">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-base-content/50 border-b border-base-300">
            <th className="w-14 font-medium">#</th>
            <th className="font-medium">Plan</th>
            <th className="font-medium">Collection</th>
            <th className="font-medium">Commission</th>
            <th className="font-medium">Penalty</th>
            <th className="font-medium w-24">Status</th>
            <th className="text-right font-medium w-32">Actions</th>
          </tr>
        </thead>

        <tbody>
          {plans.map((plan, index) => (
            <tr
              key={plan.id}
              className="border-b border-base-200 last:border-0 hover:bg-base-200/50 transition-colors"
            >
              <td className="text-base-content/40">{index + 1}</td>

              <td>
                <div className="flex items-center gap-3 py-1">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary shrink-0">
                    <Landmark size={16} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      {plan.plan_name}
                    </div>
                    <div className="text-[11px] text-base-content/40">
                      {plan.plan_code}
                    </div>
                  </div>
                </div>
              </td>

              <td>
                <div className="text-xs text-base-content/70 font-medium">
                  {FREQUENCY_LABELS[plan.collection_frequency] ||
                    plan.collection_frequency}
                </div>
                <div className="text-[11px] text-base-content/40">
                  {plan.tenure} {plan.tenure_type}
                </div>
              </td>

              <td>
                <span className="flex items-center gap-1 text-xs font-semibold text-base-content/70">
                  {plan.commission_type === "percentage" ? (
                    <Percent size={12} className="text-base-content/30" />
                  ) : (
                    <IndianRupee size={12} className="text-base-content/30" />
                  )}
                  {formatCommission(plan)}
                </span>
              </td>

              <td>
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

              <td>
                <span
                  className={`badge gap-1.5 font-medium badge-sm ${STATUS_STYLES[plan.status] || "badge-ghost"}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {plan.status
                    ? plan.status.charAt(0).toUpperCase() + plan.status.slice(1)
                    : "Unknown"}
                </span>
              </td>

              <td>
                <div className="flex justify-end gap-1.5">
                  <button
                    className="btn btn-ghost btn-sm btn-square"
                    onClick={() => onView(plan)}
                    aria-label={`View ${plan.plan_name}`}
                    title="View plan"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-square"
                    onClick={() => onEdit(plan)}
                    aria-label={`Edit ${plan.plan_name}`}
                    title="Edit plan"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                    onClick={() => onDelete(plan)}
                    aria-label={`Delete ${plan.plan_name}`}
                    title="Delete plan"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
