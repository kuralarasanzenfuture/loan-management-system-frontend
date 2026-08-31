import React from "react";
import {
  IndianRupee,
  AlertTriangle,
  Receipt,
  CheckCircle2,
} from "lucide-react";
import {
  STATUS_STYLES,
  formatCurrency,
  formatDate,
  isOverdue,
} from "../utils/collectionHelpers.js";
import usePermissions from "../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../constants/permissions.js";

/**
 * LoanInstallmentTable
 * Props:
 * - installments    (array)
 * - loading         (bool)
 * - canCollect      (bool)
 * - canApplyPenalty (bool)
 * - onPay           (fn)
 * - onApplyPenalty  (fn)
 */
export default function LoanInstallmentTable({
  installments,
  loading,
  canCollect: canCollectProp,
  canApplyPenalty: canApplyPenaltyProp,
  onPay,
  onApplyPenalty,
}) {
  const { can } = usePermissions();

  const canCollect =
    canCollectProp !== undefined
      ? canCollectProp
      : can(PERMISSIONS.LOAN_COLLECTION_CREATE) ||
        can(PERMISSIONS.COLLECTION_CREATE) ||
        can(PERMISSIONS.LOAN_COLLECTION_VIEW);

  const canApplyPenalty =
    canApplyPenaltyProp !== undefined
      ? canApplyPenaltyProp
      : can(PERMISSIONS.LOAN_COLLECTION_EDIT) ||
        can(PERMISSIONS.LOAN_EDIT) ||
        can(PERMISSIONS.LOAN_APPROVAL_ACTION) ||
        canCollect;

  if (loading && installments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md text-primary" />
        <p className="text-sm">Loading installments…</p>
      </div>
    );
  }

  if (!loading && installments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-base-200 text-base-content/30">
          <Receipt size={22} />
        </span>
        <p className="text-sm font-semibold text-base-content/70">
          No installments found
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-base-content/50 border-b border-base-200 bg-base-200/30">
            <th className="w-12 font-semibold py-3">#</th>
            <th className="font-semibold py-3">Due Date</th>
            <th className="font-semibold py-3 text-right">Principal</th>
            <th className="font-semibold py-3 text-right">Penalty</th>
            <th className="font-semibold py-3 text-right">Total Due</th>
            <th className="font-semibold py-3 text-right">Paid</th>
            <th className="font-semibold py-3 text-right">Balance</th>
            <th className="font-semibold py-3 w-28">Status</th>
            <th className="text-right font-semibold py-3 w-36">Actions</th>
          </tr>
        </thead>

        <tbody>
          {installments.map((inst, index) => {
            const isPaid = inst.status === "paid" || Number(inst.balance_amount || 0) <= 0;
            const overdue = isOverdue(inst.due_date, inst.status);

            return (
              <tr
                key={inst.id || index}
                className="border-b border-base-200 last:border-0 hover:bg-base-200/40 transition-colors"
              >
                <td className="text-base-content/40 text-xs py-3">{index + 1}</td>

                <td className="py-3">
                  <div className="font-semibold text-sm text-base-content">
                    {formatDate(inst.due_date)}
                  </div>
                  {overdue && !isPaid && (
                    <div className="flex items-center gap-1 text-[10px] text-error font-medium mt-0.5">
                      <AlertTriangle size={10} /> Overdue
                    </div>
                  )}
                </td>

                <td className="text-right text-xs py-3 text-base-content/70 font-medium">
                  {formatCurrency(inst.principal_amount)}
                </td>

                <td className="text-right text-xs py-3">
                  {inst.penalty_amount && Number(inst.penalty_amount) > 0 ? (
                    <span className="text-error font-semibold">
                      +{formatCurrency(inst.penalty_amount)}
                    </span>
                  ) : (
                    <span className="text-base-content/30">—</span>
                  )}
                </td>

                <td className="text-right text-xs py-3 font-bold text-base-content">
                  {formatCurrency(inst.total_due || inst.principal_amount)}
                </td>

                <td className="text-right text-xs py-3">
                  {inst.paid_amount && Number(inst.paid_amount) > 0 ? (
                    <span className="text-success font-semibold">
                      {formatCurrency(inst.paid_amount)}
                    </span>
                  ) : (
                    <span className="text-base-content/30">—</span>
                  )}
                </td>

                <td className="text-right text-xs py-3 font-semibold text-base-content">
                  {formatCurrency(inst.balance_amount)}
                </td>

                <td className="py-3">
                  <span
                    className={`badge gap-1 font-medium badge-sm ${
                      STATUS_STYLES[inst.status] || "badge-ghost"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {inst.status
                      ? inst.status.charAt(0).toUpperCase() + inst.status.slice(1)
                      : "Unknown"}
                  </span>
                </td>

                <td className="py-3">
                  <div className="flex justify-end gap-1.5">
                    {!isPaid && overdue && canApplyPenalty && (
                      <button
                        className="btn btn-ghost btn-xs rounded-lg gap-1 text-warning hover:bg-warning/10"
                        onClick={() => onApplyPenalty && onApplyPenalty(inst)}
                        title="Apply / recalculate penalty"
                      >
                        <AlertTriangle size={12} />
                        Penalty
                      </button>
                    )}

                    {!isPaid ? (
                      canCollect ? (
                        <button
                          className="btn btn-primary btn-xs rounded-lg gap-1 shadow-xs"
                          onClick={() => onPay && onPay(inst)}
                        >
                          <IndianRupee size={12} />
                          Pay
                        </button>
                      ) : (
                        <span className="text-xs text-base-content/40 italic py-1">Due</span>
                      )
                    ) : (
                      <span className="badge bg-success/20 text-success border border-success/30 badge-sm gap-1 py-2 font-medium">
                        <CheckCircle2 size={12} />
                        Paid
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
