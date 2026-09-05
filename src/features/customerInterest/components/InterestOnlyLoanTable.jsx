import React from "react";
import { Eye, Trash2, Percent, User, Receipt } from "lucide-react";
import {
  STATUS_STYLES,
  formatCurrency,
  formatDate,
} from "../utils/interestOnlyLoanHelpers.js";
import usePermissions from "../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../constants/permissions.js";

/**
 * InterestOnlyLoanTable
 * Props:
 * - loans (array)
 * - loading (bool)
 * - canView (bool)
 * - canEdit (bool)
 * - canPay (bool)
 * - canDelete (bool)
 * - onView (fn) / onDelete (fn) / onStatusChange (fn) / onRecordPayment (fn)
 */
export default function InterestOnlyLoanTable({
  loans = [],
  loading,
  canView: canViewProp,
  canEdit: canEditProp,
  canPay: canPayProp,
  canDelete: canDeleteProp,
  onView,
  onDelete,
  onStatusChange,
  onRecordPayment,
}) {
  const { can } = usePermissions();

  const canView =
    canViewProp !== undefined
      ? canViewProp
      : can([
          PERMISSIONS.INTEREST_ONLY_LOAN_VIEW,
          PERMISSIONS.LOAN_VIEW,
        ]);
  const canEdit =
    canEditProp !== undefined
      ? canEditProp
      : can([
          PERMISSIONS.INTEREST_ONLY_LOAN_EDIT,
          PERMISSIONS.LOAN_EDIT,
        ]);
  const canPay =
    canPayProp !== undefined
      ? canPayProp
      : can([
          PERMISSIONS.INTEREST_ONLY_PAYMENT_CREATE,
          PERMISSIONS.LOAN_COLLECTION_CREATE,
        ]);
  const canDelete =
    canDeleteProp !== undefined
      ? canDeleteProp
      : can([
          PERMISSIONS.INTEREST_ONLY_LOAN_DELETE,
          PERMISSIONS.LOAN_DELETE,
        ]);

  const hasAnyAction = canView || canEdit || canPay || canDelete;
  const loanList = Array.isArray(loans) ? loans : [];

  if (loading && loanList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md text-primary" />
        <p className="text-sm">Loading interest-only loans…</p>
      </div>
    );
  }

  if (!loading && loanList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-base-300 text-base-content/40">
          <Percent size={20} />
        </span>
        <p className="text-sm font-medium text-base-content/70">
          No interest-only loans found
        </p>
        <p className="text-xs text-base-content/40">
          Issue your first interest-only loan to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-base-content/50 border-b border-base-300">
            <th className="font-medium">Loan</th>
            <th className="font-medium">Customer</th>
            <th className="font-medium text-right">Principal</th>
            <th className="font-medium text-right">Total Payable</th>
            <th className="font-medium text-right">Outstanding</th>
            <th className="font-medium">Period</th>
            <th className="font-medium w-28">Status</th>
            {hasAnyAction && (
              <th className="text-right font-medium w-28">Actions</th>
            )}
          </tr>
        </thead>

        <tbody>
          {loanList.map((loan) => {
            const outstanding =
              Number(loan.outstanding_interest || 0) +
              Number(loan.outstanding_principal || 0);

            const isClosed = ["completed", "closed", "cancelled"].includes(
              loan.status,
            );

            return (
              <tr
                key={loan.id}
                className="border-b border-base-200 last:border-0 hover:bg-base-200/50 transition-colors"
              >
                <td>
                  <div className="flex items-center gap-3 py-1">
                    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary shrink-0">
                      <Percent size={16} />
                    </span>
                    <div className="font-semibold text-sm font-mono">
                      {loan.loan_no}
                    </div>
                  </div>
                </td>

                <td className="text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-base-content/80">
                    <User size={11} className="text-base-content/30" />
                    {loan.customer_name || `Customer #${loan.customer_id}`}
                  </span>
                </td>

                <td className="text-right text-xs font-bold text-base-content">
                  {formatCurrency(loan.principal_amount)}
                </td>

                <td className="text-right text-xs font-semibold text-base-content/70">
                  {formatCurrency(loan.total_payable)}
                </td>

                <td className="text-right text-xs font-semibold">
                  {outstanding > 0 ? (
                    <span className="text-error">
                      {formatCurrency(outstanding)}
                    </span>
                  ) : (
                    formatCurrency(outstanding)
                  )}
                </td>

                <td className="text-[11px] text-base-content/50">
                  <div>{formatDate(loan.start_date)}</div>
                  <div className="text-base-content/30">
                    → {formatDate(loan.end_date)}
                  </div>
                </td>

                <td>
                  {canEdit && onStatusChange ? (
                    <button
                      onClick={() => onStatusChange(loan)}
                      className={`badge gap-1.5 font-medium badge-sm cursor-pointer hover:opacity-80 transition-opacity ${
                        STATUS_STYLES[loan.status] || "badge-ghost"
                      }`}
                      title="Click to change status"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {loan.status?.charAt(0).toUpperCase() +
                        loan.status?.slice(1)}
                    </button>
                  ) : (
                    <span
                      className={`badge gap-1.5 font-medium badge-sm cursor-default ${
                        STATUS_STYLES[loan.status] || "badge-ghost"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {loan.status?.charAt(0).toUpperCase() +
                        loan.status?.slice(1)}
                    </span>
                  )}
                </td>

                {hasAnyAction && (
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      {canPay && onRecordPayment && !isClosed && outstanding > 0 && (
                        <button
                          className="btn btn-ghost btn-sm btn-square text-success hover:bg-success/10"
                          onClick={() => onRecordPayment(loan)}
                          title="Record payment"
                        >
                          <Receipt size={15} />
                        </button>
                      )}

                      {canView && onView && (
                        <button
                          className="btn btn-ghost btn-sm btn-square"
                          onClick={() => onView(loan)}
                          title="View details"
                        >
                          <Eye size={15} />
                        </button>
                      )}

                      {canDelete && onDelete && (
                        <button
                          className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                          onClick={() => onDelete(loan)}
                          title="Delete loan"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
