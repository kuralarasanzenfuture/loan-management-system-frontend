import React from "react";
import { AlertTriangle, Loader2, X, RotateCcw } from "lucide-react";
import {
  formatCurrency,
  formatDateTime,
} from "../utils/interestLoanPaymentHelpers.js";

export default function InterestLoanPaymentReverseModal({
  open,
  payment,
  loading,
  onClose,
  onConfirm,
}) {
  if (!open || !payment) return null;

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-md p-0 overflow-hidden shadow-2xl rounded-2xl border border-base-300 bg-base-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 bg-base-200/50">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-error/10 text-error">
              <RotateCcw size={18} />
            </span>
            <div>
              <h3 className="font-semibold text-base text-base-content">
                Reverse Loan Payment
              </h3>
              <p className="text-xs text-base-content/50">
                Void transaction and rollback balances
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-circle btn-sm text-base-content/50 hover:text-base-content"
            onClick={onClose}
            disabled={loading}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Payment Summary Box */}
          <div className="p-4 rounded-xl bg-base-200/50 border border-base-300 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-base-content/60">Receipt Reference:</span>
              <span className="font-mono font-bold text-base-content">
                #{payment.id ? String(payment.id).padStart(6, "0") : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base-content/60">Loan No:</span>
              <span className="font-mono font-bold text-primary">
                {payment.loan_no || "—"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base-content/60">Customer:</span>
              <span className="font-medium text-base-content">
                {payment.customer_name ||
                  `${payment.first_name || ""} ${payment.last_name || ""}`.trim()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base-content/60">Date:</span>
              <span className="text-base-content/80">
                {formatDateTime(payment.payment_date)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-base-300 pt-2 font-semibold">
              <span className="text-base-content">Reversal Amount:</span>
              <span className="text-sm font-bold text-error">
                {formatCurrency(payment.payment_amount)}
              </span>
            </div>
          </div>

          {/* Warning Banner with High Contrast */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
            <AlertTriangle
              size={16}
              className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
            />
            <div className="space-y-1">
              <p className="font-bold">Financial Rollback Notice</p>
              <p className="opacity-90 leading-relaxed">
                Reversing this payment will:
              </p>
              <ul className="list-disc list-inside space-y-0.5 opacity-90">
                <li>
                  Restore{" "}
                  <strong>{formatCurrency(payment.interest_amount || 0)}</strong> to
                  affected billing period balances (reverting status to due).
                </li>
                <li>
                  Increase loan outstanding principal by{" "}
                  <strong>{formatCurrency(payment.principal_amount || 0)}</strong>.
                </li>
                <li>Permanently void this payment record and allocations.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-base-200 bg-base-200/50">
          <button
            type="button"
            className="btn btn-ghost btn-sm rounded-xl text-xs"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-error btn-sm gap-1.5 rounded-xl text-white text-xs shadow-sm"
            onClick={() => onConfirm(payment.id)}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Reversing...</span>
              </>
            ) : (
              <>
                <RotateCcw size={13} />
                <span>Confirm Reversal</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
