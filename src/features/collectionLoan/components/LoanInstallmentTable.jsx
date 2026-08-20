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

/**
 * LoanInstallmentTable
 * Props:
 * - installments (array)
 * - loading (bool)
 * - onPay (fn)         : opens PayInstallmentModal for a row
 * - onApplyPenalty (fn) : opens ApplyPenaltyModal for a row
 */
export default function LoanInstallmentTable({
  installments,
  loading,
  onPay,
  onApplyPenalty,
}) {
  if (loading && installments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading installments…</p>
      </div>
    );
  }

  if (!loading && installments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-base-300 text-base-content/40">
          <Receipt size={20} />
        </span>
        <p className="text-sm font-medium text-base-content/70">
          No installments found
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-base-content/50 border-b border-base-300">
            <th className="w-14 font-medium">#</th>
            <th className="font-medium">Due Date</th>
            <th className="font-medium text-right">Principal</th>
            <th className="font-medium text-right">Penalty</th>
            <th className="font-medium text-right">Total Due</th>
            <th className="font-medium text-right">Paid</th>
            <th className="font-medium text-right">Balance</th>
            <th className="font-medium w-28">Status</th>
            <th className="text-right font-medium w-40">Actions</th>
          </tr>
        </thead>

        <tbody>
          {installments.map((inst) => {
            const overdue = isOverdue(inst);
            const isPaid = inst.status === "paid";

            return (
              <tr
                key={inst.id}
                className={`border-b border-base-200 last:border-0 hover:bg-base-200/50 transition-colors ${
                  overdue && !isPaid ? "bg-error/5" : ""
                }`}
              >
                <td className="text-base-content/40">{inst.installment_no}</td>

                <td className="text-xs">
                  <div className="font-semibold text-base-content/80">
                    {formatDate(inst.due_date)}
                  </div>
                  {overdue && !isPaid && (
                    <div className="flex items-center gap-1 text-[10px] text-error font-medium mt-0.5">
                      <AlertTriangle size={10} /> Overdue
                    </div>
                  )}
                  {inst.paid_date && (
                    <div className="text-[10px] text-base-content/40">
                      Paid {formatDate(inst.paid_date)}
                    </div>
                  )}
                </td>

                <td className="text-right text-xs font-semibold">
                  {formatCurrency(inst.principal_amount)}
                </td>

                <td className="text-right text-xs">
                  {Number(inst.penalty_amount) > 0 ? (
                    <span className="font-semibold text-error">
                      {formatCurrency(inst.penalty_amount)}
                    </span>
                  ) : (
                    <span className="text-base-content/30">—</span>
                  )}
                </td>

                <td className="text-right text-xs font-bold text-base-content">
                  {formatCurrency(inst.total_due)}
                </td>

                <td className="text-right text-xs">
                  {Number(inst.paid_amount) > 0 ? (
                    <span className="font-semibold text-success">
                      {formatCurrency(inst.paid_amount)}
                    </span>
                  ) : (
                    <span className="text-base-content/30">—</span>
                  )}
                </td>

                <td className="text-right text-xs font-semibold">
                  {formatCurrency(inst.balance_amount)}
                </td>

                <td>
                  <span
                    className={`badge gap-1.5 font-medium badge-sm ${STATUS_STYLES[inst.status] || "badge-ghost"}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {inst.status?.charAt(0).toUpperCase() +
                      inst.status?.slice(1)}
                  </span>
                </td>

                <td>
                  <div className="flex justify-end gap-1.5">
                    {!isPaid && overdue && (
                      <button
                        className="btn btn-ghost btn-xs rounded-lg gap-1 text-warning hover:bg-warning/10"
                        onClick={() => onApplyPenalty(inst)}
                        title="Apply / recalculate penalty"
                      >
                        <AlertTriangle size={12} />
                        Penalty
                      </button>
                    )}
                    {!isPaid ? (
                      <button
                        className="btn btn-primary btn-xs rounded-lg gap-1"
                        onClick={() => onPay(inst)}
                      >
                        <IndianRupee size={12} />
                        Pay
                      </button>
                    ) : (
                      <span className="btn btn-ghost btn-xs rounded-lg gap-1 text-success pointer-events-none">
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
