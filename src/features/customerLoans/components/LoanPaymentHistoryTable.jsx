import React from "react";
import {
  Printer,
  RotateCcw,
  Receipt,
  FileText,
  Calendar,
  CreditCard,
  User,
  Hash,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "../utils/loanCalculations.js";
import usePermissions from "../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../constants/permissions.js";
import { sendWhatsAppPaymentReceipt, WhatsAppIcon } from "../utils/whatsappShare.js";

const MODE_BADGES = {
  cash: "badge-success badge-outline",
  upi: "badge-primary badge-outline",
  bank: "badge-info badge-outline",
  cheque: "badge-warning badge-outline",
  other: "badge-ghost",
};

export default function LoanPaymentHistoryTable({
  payments = [],
  loading = false,
  loan = null,
  customer = null,
  company = null,
  onPrintReceipt,
  onViewReceipt,
  onWhatsApp,
  onRevertPayment,
}) {
  const { can } = usePermissions();
  const canRevert =
    can(PERMISSIONS.LOAN_COLLECTION_DELETE) ||
    can(PERMISSIONS.LOAN_EDIT) ||
    can(PERMISSIONS.LOAN_APPLICATION_EDIT);

  if (loading && payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md text-primary" />
        <p className="text-sm">Loading payment transactions…</p>
      </div>
    );
  }

  if (!loading && payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-base-200 text-base-content/30">
          <Receipt size={24} />
        </span>
        <div>
          <p className="text-sm font-semibold text-base-content/70">
            No payments recorded yet
          </p>
          <p className="text-xs text-base-content/40 mt-0.5">
            Payments recorded against installments or lump-sum collections will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full text-xs">
        <thead>
          <tr className="text-[11px] uppercase tracking-wider text-base-content/50 border-b border-base-200 bg-base-200/40">
            <th className="w-12 font-semibold py-3">#</th>
            <th className="font-semibold py-3">Receipt / Txn</th>
            <th className="font-semibold py-3">Date & Time</th>
            <th className="font-semibold py-3">Installment</th>
            <th className="font-semibold py-3">Amount Paid</th>
            <th className="font-semibold py-3">Mode</th>
            <th className="font-semibold py-3">Reference / Cheque</th>
            <th className="font-semibold py-3">Received By</th>
            <th className="font-semibold py-3 text-right w-28">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-base-200/70">
          {payments.map((payment, idx) => {
            const mode = (payment.payment_mode || "cash").toLowerCase();
            const badgeClass = MODE_BADGES[mode] || "badge-ghost";
            const formattedDate = payment.payment_date
              ? new Date(payment.payment_date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "—";
            const formattedTime = payment.payment_date
              ? new Date(payment.payment_date).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            return (
              <tr
                key={payment.id || idx}
                className="hover:bg-base-200/30 transition-colors"
              >
                {/* Index */}
                <td className="font-medium text-base-content/50 text-[11px] py-3">
                  {idx + 1}
                </td>

                {/* Receipt Number */}
                <td className="py-3">
                  <div className="font-bold text-primary flex items-center gap-1 tracking-tight">
                    <Receipt size={13} className="shrink-0 opacity-70" />
                    <span>#{payment.payment_no || payment.id}</span>
                  </div>
                  <div className="text-[10px] text-base-content/40">
                    ID: {payment.id}
                  </div>
                </td>

                {/* Date & Time */}
                <td className="py-3">
                  <div className="font-medium text-base-content flex items-center gap-1">
                    <Calendar size={12} className="opacity-50" />
                    {formattedDate}
                  </div>
                  {formattedTime && (
                    <div className="text-[10px] text-base-content/40 ml-4">
                      {formattedTime}
                    </div>
                  )}
                </td>

                {/* Installment */}
                <td className="py-3">
                  <span className="badge badge-sm badge-ghost font-semibold text-xs gap-1">
                    <Hash size={11} />
                    Inst #{payment.installment_no}
                  </span>
                  {payment.installment_due_date && (
                    <div className="text-[10px] text-base-content/40 mt-0.5">
                      Due: {new Date(payment.installment_due_date).toLocaleDateString("en-GB")}
                    </div>
                  )}
                </td>

                {/* Amount Paid */}
                <td className="py-3">
                  <div className="font-bold text-sm text-success tracking-tight">
                    {formatCurrency(payment.payment_amount)}
                  </div>
                  {payment.installment_balance_amount !== undefined && (
                    <div className="text-[10px] text-base-content/40">
                      Bal: {formatCurrency(payment.installment_balance_amount)}
                    </div>
                  )}
                </td>

                {/* Payment Mode */}
                <td className="py-3">
                  <span className={`badge badge-sm font-semibold capitalize ${badgeClass}`}>
                    {mode}
                  </span>
                </td>

                {/* Reference / Cheque */}
                <td className="py-3">
                  {payment.transaction_reference ? (
                    <div className="font-medium text-xs text-base-content truncate max-w-[140px]" title={payment.transaction_reference}>
                      {payment.transaction_reference}
                    </div>
                  ) : payment.cheque_number ? (
                    <div className="font-medium text-xs text-warning truncate max-w-[140px]" title={`Cheque: ${payment.cheque_number}`}>
                      CHQ: {payment.cheque_number}
                    </div>
                  ) : (
                    <span className="text-base-content/30">—</span>
                  )}
                  {payment.remarks && (
                    <div className="text-[10px] text-base-content/50 italic truncate max-w-[140px]" title={payment.remarks}>
                      {payment.remarks}
                    </div>
                  )}
                </td>

                {/* Received By */}
                <td className="py-3">
                  <div className="flex items-center gap-1 text-base-content/70">
                    <User size={12} className="opacity-50" />
                    <span className="truncate max-w-[100px]">
                      {payment.received_by_user || payment.received_by || "System"}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* View/Print Receipt */}
                    <button
                      type="button"
                      onClick={() => onPrintReceipt?.(payment)}
                      className="btn btn-ghost btn-xs btn-square text-primary hover:bg-primary/10"
                      title="Print Official Receipt"
                    >
                      <Printer size={14} />
                    </button>

                    {/* View Receipt Voucher */}
                    <button
                      type="button"
                      onClick={() => onViewReceipt?.(payment)}
                      className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-base-content"
                      title="View Voucher"
                    >
                      <FileText size={14} />
                    </button>

                    {/* Share on WhatsApp */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onWhatsApp) {
                          onWhatsApp(payment);
                        } else {
                          sendWhatsAppPaymentReceipt({
                            loan,
                            installment: {
                              installment_no: payment.installment_no,
                              due_date: payment.installment_due_date,
                              balance_amount: payment.installment_balance_amount,
                            },
                            customer,
                            company,
                            payment,
                          });
                        }
                      }}
                      className="btn btn-ghost btn-xs btn-square text-emerald-600 hover:bg-emerald-500/10"
                      title="Share Receipt on WhatsApp"
                    >
                      <WhatsAppIcon size={14} />
                    </button>

                    {/* Revert / Cancel Payment */}
                    {canRevert && (
                      <button
                        type="button"
                        onClick={() => onRevertPayment?.(payment)}
                        className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10"
                        title="Revert / Void Payment"
                      >
                        <RotateCcw size={14} />
                      </button>
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
