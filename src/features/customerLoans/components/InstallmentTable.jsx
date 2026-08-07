import React from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  CircleDollarSign,
  Receipt,
} from "lucide-react";
import { formatCurrency } from "../utils/loanCalculations.js";

const STATUS_CONFIG = {
  paid: {
    label: "Paid",
    className: "badge-success badge-outline",
    icon: CheckCircle2,
  },
  pending: { label: "Pending", className: "badge-ghost", icon: Clock },
  overdue: {
    label: "Overdue",
    className: "badge-error badge-outline",
    icon: AlertTriangle,
  },
  partial: {
    label: "Partial",
    className: "badge-warning badge-outline",
    icon: CircleDollarSign,
  },
};

/**
 * InstallmentTable
 *
 * Expected row shape (adjust to match your actual installment.service.js
 * response — this is inferred, not confirmed against a schema):
 * { id, loan_id, installment_no, due_date, principal_amount, total_due,
 *   paid_amount, paid_date, status, penalty_amount, balance_amount }
 *
 * Props:
 * - installments (array)
 * - loading (bool)
 * - onRecordPayment (fn) : called with the installment row
 */
export default function InstallmentTable({
  installments,
  loading,
  onRecordPayment,
}) {
  const safeInstallments = Array.isArray(installments) ? installments : [];

  if (loading && safeInstallments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading installments…</p>
      </div>
    );
  }

  if (!loading && safeInstallments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-base-300 text-base-content/40">
          <Receipt size={20} />
        </span>
        <p className="text-sm font-medium text-base-content/70">
          No installments found
        </p>
        <p className="text-xs text-base-content/40">
          Installments will appear here once the schedule is generated.
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
            <th className="font-medium">Amount</th>
            <th className="font-medium">Paid</th>
            <th className="font-medium">Penalty</th>
            <th className="font-medium w-28">Status</th>
            <th className="text-right font-medium w-32">Actions</th>
          </tr>
        </thead>

        <tbody>
          {safeInstallments.map((inst) => {
            const config = STATUS_CONFIG[inst.status] || STATUS_CONFIG.pending;
            const StatusIcon = config.icon;
            const isPaid = inst.status === "paid";

            return (
              <tr
                key={inst.id}
                className="border-b border-base-200 last:border-0 hover:bg-base-200/50 transition-colors"
              >
                <td className="text-base-content/40">
                  {inst.installment_no ?? "—"}
                </td>

                <td className="text-xs">
                  <div className="font-semibold text-base-content/80">
                    {inst.due_date
                      ? new Date(inst.due_date).toLocaleDateString()
                      : "—"}
                  </div>
                  {inst.paid_date && (
                    <div className="text-[10px] text-base-content/40">
                      Paid {new Date(inst.paid_date).toLocaleDateString()}
                    </div>
                  )}
                </td>

                <td className="text-xs font-semibold text-base-content">
                  {formatCurrency(inst.total_due ?? inst.principal_amount ?? 0)}
                </td>

                <td className="text-xs">
                  {inst.paid_amount ? (
                    <span className="font-semibold text-success">
                      {formatCurrency(inst.paid_amount)}
                    </span>
                  ) : (
                    <span className="text-base-content/30">—</span>
                  )}
                </td>

                <td className="text-xs">
                  {inst.penalty_amount ? (
                    <span className="font-semibold text-error">
                      {formatCurrency(inst.penalty_amount)}
                    </span>
                  ) : (
                    <span className="text-base-content/30">—</span>
                  )}
                </td>

                <td>
                  <span
                    className={`badge gap-1.5 font-medium badge-sm ${config.className}`}
                  >
                    <StatusIcon size={11} />
                    {config.label}
                  </span>
                </td>

                <td>
                  <div className="flex justify-end">
                    <button
                      onClick={() => onRecordPayment(inst)}
                      disabled={isPaid}
                      className="btn btn-primary btn-xs rounded-lg disabled:btn-ghost disabled:text-base-content/30"
                    >
                      {isPaid ? "Paid" : "Record Payment"}
                    </button>
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
