import React from "react";
import { AlertTriangle, Loader2, Ban, X, Trash2, AlertCircle } from "lucide-react";
import { formatCurrency } from "../utils/interestLoanHelpers.js";

/**
 * InterestLoanDeleteModal
 * Premium confirmation dialog for deleting an anytime interest loan.
 * Enforces financial integrity rules: loans with payments cannot be deleted.
 */
export default function InterestLoanDeleteModal({
  open,
  loan,
  loading,
  error,
  onClose,
  onConfirm,
}) {
  if (!open || !loan) return null;

  // Check if payments exist
  const hasPayments =
    Number(loan.total_principal_paid || 0) > 0 ||
    Number(loan.total_interest_paid || 0) > 0;

  const customerName =
    loan.customer_name ||
    `${loan.first_name || ""} ${loan.last_name || ""}`.trim() ||
    "Unknown Customer";

  return (
    <div className="modal modal-open z-50">
      <div className="modal-box max-w-md p-0 overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-base-200 flex items-center justify-between bg-base-200/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center shrink-0">
              {hasPayments ? <Ban size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div>
              <h3 className="font-bold text-base text-base-content">
                {hasPayments ? "Cannot Delete Loan" : "Delete Interest Loan"}
              </h3>
              <p className="text-xs text-base-content/50">
                {hasPayments ? "Financial integrity restriction" : "Confirm loan removal"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn btn-ghost btn-xs btn-square text-base-content/60 hover:text-base-content"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="alert alert-error text-xs py-2.5 rounded-xl flex items-start gap-2 shadow-sm">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Loan Details Card */}
          <div className="p-4 rounded-xl bg-base-200/60 border border-base-200 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-base-content/60 font-medium">Loan Number:</span>
              <span className="font-mono font-bold text-sm text-primary">
                {loan.loan_no}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base-content/60 font-medium">Customer:</span>
              <span className="font-semibold text-base-content">{customerName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base-content/60 font-medium">Principal Amount:</span>
              <span className="font-bold text-base-content">
                {formatCurrency(loan.principal_amount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base-content/60 font-medium">Status:</span>
              <span className="badge badge-sm badge-ghost uppercase text-[10px] font-bold">
                {loan.status}
              </span>
            </div>
          </div>

          {/* Warning or Restriction Alert */}
          {hasPayments ? (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-error/10 border border-error/25 text-error text-xs leading-relaxed">
              <Ban size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Deletion Blocked by Financial History</p>
                <p className="mt-1 opacity-90 leading-relaxed">
                  Payments have already been collected for this loan (Principal Paid: {formatCurrency(loan.total_principal_paid)}, Interest Paid: {formatCurrency(loan.total_interest_paid)}). To maintain accounting records and audit integrity, loans with payments cannot be deleted.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
              <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                Are you sure you want to permanently delete loan <strong className="font-mono font-bold text-base-content">{loan.loan_no}</strong>? This will remove the loan record and its generated period schedule. This action cannot be undone.
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-base-200/30 border-t border-base-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            className="btn btn-ghost btn-sm rounded-xl text-base-content/70 hover:bg-base-200 font-medium"
            onClick={onClose}
            disabled={loading}
          >
            {hasPayments ? "Close" : "Cancel"}
          </button>
          {!hasPayments && (
            <button
              type="button"
              className="btn btn-error btn-sm rounded-xl gap-2 shadow-sm text-white font-semibold"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  Delete Loan
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
