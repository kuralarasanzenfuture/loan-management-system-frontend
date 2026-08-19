import React from "react";
import { Pencil, Trash2, Receipt } from "lucide-react";
import {
  PAYMENT_STATUS_STYLES,
  PAYMENT_MODE_LABELS,
  formatCurrency,
  formatDate,
} from "../utils/chitHelpers.js";

export default function ChitPaymentTable({
  payments,
  loading,
  onEdit,
  onDelete,
  onRecordPayment,
}) {
  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-sm" />
        <span className="text-xs">Loading payment schedule…</span>
      </div>
    );
  }

  if (!loading && payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-base-300 text-base-content/40">
          <Receipt size={18} />
        </span>
        <p className="text-xs text-base-content/40">
          No payment schedule recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm w-full">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-base-content/40">
            <th className="font-medium">#</th>
            <th className="font-medium">Due Date</th>
            <th className="font-medium">Due Amount</th>
            <th className="font-medium">Benefit</th>
            <th className="font-medium">Paid</th>
            <th className="font-medium">Pending</th>
            <th className="font-medium">Mode</th>
            <th className="font-medium w-24">Status</th>
            <th className="text-right font-medium w-24">Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => {
            const isPaid = p.status === "paid";
            return (
              <tr key={p.id} className="border-t border-base-200">
                <td className="text-xs text-base-content/40">
                  {p.installment_no}
                </td>
                <td className="text-xs">
                  <div>{formatDate(p.due_date)}</div>
                  {p.payment_date && (
                    <div className="text-[10px] text-base-content/30">
                      Paid {formatDate(p.payment_date)}
                    </div>
                  )}
                </td>
                <td className="text-xs font-semibold">
                  {formatCurrency(p.due_amount)}
                </td>
                <td className="text-xs">
                  {Number(p.bit_benefit_amount) > 0 ? (
                    <span className="text-primary font-semibold">
                      {formatCurrency(p.bit_benefit_amount)}
                    </span>
                  ) : (
                    <span className="text-base-content/30">—</span>
                  )}
                </td>
                <td className="text-xs">
                  {p.paid_amount > 0 ? (
                    <span className="text-success font-semibold">
                      {formatCurrency(p.paid_amount)}
                    </span>
                  ) : (
                    <span className="text-base-content/30">—</span>
                  )}
                </td>
                <td className="text-xs">
                  {p.pending_amount > 0 ? (
                    <span className="text-error font-semibold">
                      {formatCurrency(p.pending_amount)}
                    </span>
                  ) : (
                    <span className="text-base-content/30">—</span>
                  )}
                </td>
                <td className="text-xs text-base-content/60">
                  {PAYMENT_MODE_LABELS[p.payment_mode] || "—"}
                </td>
                <td>
                  <span
                    className={`badge badge-xs font-medium ${PAYMENT_STATUS_STYLES[p.status] || "badge-ghost"}`}
                  >
                    {p.status}
                  </span>
                </td>
                <td>
                  <div className="flex justify-end gap-1">
                    <button
                      className="btn btn-ghost btn-xs rounded-lg"
                      onClick={() => onRecordPayment(p)}
                      disabled={isPaid}
                    >
                      {isPaid ? "Paid" : "Pay"}
                    </button>
                    <button
                      className="btn btn-ghost btn-xs btn-square"
                      onClick={() => onEdit(p)}
                      title="Edit"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10"
                      onClick={() => onDelete(p)}
                      title="Delete"
                    >
                      <Trash2 size={12} />
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
