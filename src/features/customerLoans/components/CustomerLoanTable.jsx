import React from "react";
import { Pencil, Trash2, Eye, HandCoins, Repeat } from "lucide-react";
import { formatCurrency } from "../utils/loanCalculations.js";
import usePermissions from "../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../constants/permissions.js";

const STATUS_STYLES = {
  active: "badge-info badge-outline",
  completed: "badge-success badge-outline",
  closed: "badge-ghost",
  default: "badge-error badge-outline",
};

/**
 * CustomerLoanTable
 * Props:
 * - loans           (array)
 * - loading         (bool)
 * - canView         (bool)
 * - canEdit         (bool)
 * - canDelete       (bool)
 * - canChangeStatus (bool)
 * - onView / onEdit / onDelete / onStatusChange (fn)
 */
export default function CustomerLoanTable({
  loans,
  loading,
  canView: canViewProp,
  canEdit: canEditProp,
  canDelete: canDeleteProp,
  canChangeStatus: canChangeStatusProp,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const { can } = usePermissions();

  const canView =
    canViewProp !== undefined
      ? canViewProp
      : can(PERMISSIONS.LOAN_APPLICATION_VIEW) || can(PERMISSIONS.LOAN_VIEW);
  const canEdit =
    canEditProp !== undefined
      ? canEditProp
      : can(PERMISSIONS.LOAN_APPLICATION_EDIT) || can(PERMISSIONS.LOAN_EDIT);
  const canDelete =
    canDeleteProp !== undefined
      ? canDeleteProp
      : can(PERMISSIONS.LOAN_APPLICATION_DELETE) || can(PERMISSIONS.LOAN_DELETE);
  const canChangeStatus =
    canChangeStatusProp !== undefined
      ? canChangeStatusProp
      : canEdit || can(PERMISSIONS.LOAN_APPROVAL_ACTION) || can(PERMISSIONS.LOAN_APPROVAL_VIEW);

  const hasAnyAction = canView || canEdit || canDelete;

  if (loading && loans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md text-primary" />
        <p className="text-sm">Loading loans…</p>
      </div>
    );
  }

  if (!loading && loans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-base-200 text-base-content/30">
          <HandCoins size={22} />
        </span>
        <div>
          <p className="text-sm font-semibold text-base-content/70">
            No loans found
          </p>
          <p className="text-xs text-base-content/40 mt-0.5">
            Issue your first loan to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-base-content/50 border-b border-base-200 bg-base-200/30">
            <th className="w-12 font-semibold py-3">#</th>
            <th className="font-semibold py-3">Loan</th>
            <th className="font-semibold py-3">Customer</th>
            <th className="font-semibold py-3">Plan</th>
            <th className="font-semibold py-3">Amount</th>
            <th className="font-semibold py-3">Installment</th>
            <th className="font-semibold py-3 hidden md:table-cell">Period</th>
            <th className="font-semibold py-3 w-28">Status</th>
            {hasAnyAction && <th className="font-semibold py-3 text-right w-28">Actions</th>}
          </tr>
        </thead>

        <tbody>
          {loans.map((loan, index) => (
            <tr
              key={loan.id}
              className={`border-b border-base-200 last:border-0 hover:bg-base-200/40 transition-colors group ${
                canView ? "cursor-pointer" : ""
              }`}
              onClick={() => {
                if (canView && onView) onView(loan);
              }}
            >
              <td className="text-base-content/40 text-xs py-3">{index + 1}</td>

              <td className="py-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary shrink-0">
                    <HandCoins size={16} />
                  </div>
                  <div
                    className={`font-semibold text-sm text-base-content transition-colors ${
                      canView ? "group-hover:text-primary" : ""
                    }`}
                  >
                    {loan.loan_no || `#${loan.id}`}
                  </div>
                </div>
              </td>

              <td className="py-3 text-xs">
                <div className="flex items-center gap-2.5">
                  {loan.photo ? (
                    <img
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                      src={loan.photo}
                      alt={loan.customer_name || "Customer Photo"}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center uppercase select-none shrink-0">
                      {loan.customer_name
                        ? loan.customer_name
                            .trim()
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((word) => word[0])
                            .join("")
                        : `#${loan.customer_id}`}
                    </div>
                  )}

                  <div>
                    <div className="font-semibold text-base-content/90">
                      {loan.customer_name || `Customer #${loan.customer_id}`}
                    </div>
                    <div className="text-[11px] text-base-content/40 font-mono flex items-center gap-1.5 mt-0.5">
                      {loan.customer_no && <span>{loan.customer_no}</span>}
                      {loan.customer_mobile && <span>· {loan.customer_mobile}</span>}
                    </div>
                  </div>
                </div>
              </td>

              <td className="py-3 text-xs">
                <span className="text-base-content/70">
                  {loan.plan_name || `Plan #${loan.loan_plan_id}`}
                </span>
              </td>

              <td className="py-3">
                <div className="text-xs font-semibold text-base-content">
                  {formatCurrency(loan.loan_amount)}
                </div>
                <div className="text-[10px] text-base-content/40">
                  Net: {formatCurrency(loan.net_disbursed_amount)}
                </div>
              </td>

              <td className="py-3 text-xs">
                <span className="flex items-center gap-1 font-semibold text-base-content/70">
                  <Repeat size={11} className="text-base-content/30" />
                  {formatCurrency(loan.installment_amount)}
                </span>
              </td>

              <td className="py-3 hidden md:table-cell text-[11px] text-base-content/50">
                {loan.start_date && (
                  <div>{new Date(loan.start_date).toLocaleDateString()}</div>
                )}
                {loan.end_date && (
                  <div className="text-base-content/30">
                    → {new Date(loan.end_date).toLocaleDateString()}
                  </div>
                )}
              </td>

              <td className="py-3">
                {canChangeStatus ? (
                  <button
                    type="button"
                    // onClick={(e) => {
                    //   e.stopPropagation();
                    //   if (onStatusChange) onStatusChange(loan);
                    // }}
                    className={`badge gap-1.5 font-medium badge-sm cursor-pointer hover:opacity-80 transition-opacity ${
                      STATUS_STYLES[loan.status] || "badge-ghost"
                    }`}
                    title="Click to update loan status"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {loan.status
                      ? loan.status.charAt(0).toUpperCase() + loan.status.slice(1)
                      : "Unknown"}
                  </button>
                ) : (
                  <span
                    className={`badge gap-1.5 font-medium badge-sm ${
                      STATUS_STYLES[loan.status] || "badge-ghost"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {loan.status
                      ? loan.status.charAt(0).toUpperCase() + loan.status.slice(1)
                      : "Unknown"}
                  </span>
                )}
              </td>

              {hasAnyAction && (
                <td className="py-3">
                  <div
                    className="flex justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {canView && (
                      <button
                        id={`view-loan-${loan.id}`}
                        className="btn btn-ghost btn-xs btn-square rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-base-content/70 hover:text-primary"
                        onClick={() => onView && onView(loan)}
                        title="View loan details"
                      >
                        <Eye size={14} />
                      </button>
                    )}

                    {canEdit && (
                      <button
                        id={`edit-loan-${loan.id}`}
                        className="btn btn-ghost btn-xs btn-square rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-base-content/70 hover:text-primary"
                        onClick={() => onEdit && onEdit(loan)}
                        title="Edit loan"
                      >
                        <Pencil size={14} />
                      </button>
                    )}

                    {canDelete && (
                      <button
                        id={`delete-loan-${loan.id}`}
                        className="btn btn-ghost btn-xs btn-square rounded-lg text-error hover:bg-error/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onDelete && onDelete(loan)}
                        title="Delete loan"
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
