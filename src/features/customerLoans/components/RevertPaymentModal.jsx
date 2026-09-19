import React from "react";
import { AlertTriangle, Loader2, RotateCcw, X } from "lucide-react";
import { formatCurrency } from "../utils/loanCalculations.js";

export default function RevertPaymentModal({
  open,
  payment,
  loading,
  error,
  onClose,
  onConfirm,
}) {
  if (!open || !payment) return null;

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-md rounded-2xl border border-base-300 shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-base-200 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-error/10 text-error flex items-center justify-center">
              <RotateCcw size={17} />
            </span>
            <div>
              <h3 className="font-bold text-base text-base-content leading-tight">
                Revert Payment
              </h3>
              <p className="text-[11px] text-base-content/50">
                Payment #{payment.payment_no || payment.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-base-content"
          >
            <X size={16} />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-medium">
            {typeof error === "string" ? error : "Failed to revert payment."}
          </div>
        )}

        {/* Warning Banner */}
        <div className="rounded-xl bg-warning/10 border border-warning/25 p-3.5 mb-4 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-warning-content">
            <AlertTriangle size={16} className="text-warning shrink-0" />
            <span>Are you sure you want to revert this payment?</span>
          </div>
          <p className="text-base-content/70 leading-relaxed text-[11px]">
            Reverting will safely cancel this transaction, restore the installment balance of{" "}
            <strong>{formatCurrency(payment.payment_amount)}</strong>, readjust the installment status back to pending/partial, and set the loan back to active if it was completed.
          </p>
        </div>

        {/* Payment Summary */}
        <div className="rounded-xl border border-base-200 bg-base-100 p-3.5 text-xs space-y-2 mb-4">
          <div className="flex justify-between items-center text-base-content/70">
            <span>Payment No</span>
            <span className="font-bold text-base-content tracking-wide">
              #{payment.payment_no || payment.id}
            </span>
          </div>
          <div className="flex justify-between items-center text-base-content/70">
            <span>Installment</span>
            <span className="font-semibold text-base-content">
              Installment #{payment.installment_no}
            </span>
          </div>
          <div className="flex justify-between items-center text-base-content/70">
            <span>Payment Amount</span>
            <span className="font-bold text-error tracking-tight">
              {formatCurrency(payment.payment_amount)}
            </span>
          </div>
          <div className="flex justify-between items-center text-base-content/70">
            <span>Payment Mode</span>
            <span className="badge badge-sm font-semibold capitalize">
              {payment.payment_mode || "cash"}
            </span>
          </div>
          {payment.transaction_reference && (
            <div className="flex justify-between items-center text-base-content/70">
              <span>Reference</span>
              <span className="font-medium text-base-content tracking-wide">
                {payment.transaction_reference}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-base-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn btn-ghost btn-sm rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="btn btn-error btn-sm rounded-xl gap-1.5 font-bold shadow-sm"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RotateCcw size={14} />
            )}
            <span>Confirm Reversal</span>
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/50 backdrop-blur-xs" onClick={onClose} />
    </div>
  );
}
