import React from "react";
import { AlertTriangle, Loader2, X, HandCoins } from "lucide-react";
import { formatCurrency } from "../utils/handLoanHelpers.js";

export default function HandLoanDeleteModal({
  open,
  loan,
  loading,
  error,
  onConfirm,
  onClose,
}) {
  if (!open || !loan) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm rounded-2xl">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost btn-sm btn-square absolute right-3 top-3"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center gap-3 pt-2">
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-error/10 text-error">
            <AlertTriangle size={22} />
          </span>
          <h3 className="font-bold text-base">Delete this hand loan?</h3>
        </div>

        <div className="flex items-center gap-3 mt-4 p-3 rounded-xl border border-base-300 bg-base-200/40">
          <span className="flex items-center justify-center w-11 h-11 rounded-full bg-primary/10 text-primary shrink-0">
            <HandCoins size={18} />
          </span>
          <div className="min-w-0 text-left">
            <p className="font-semibold text-sm truncate">{loan.person_name}</p>
            <p className="text-[11px] text-base-content/40 truncate">
              {loan.hand_loan_no} · {formatCurrency(loan.amount)}
            </p>
          </div>
        </div>

        {Number(loan.outstanding_amount) > 0 && (
          <div className="alert alert-warning text-xs py-2 mt-3">
            <span>
              This loan still has {formatCurrency(loan.outstanding_amount)}{" "}
              outstanding.
            </span>
          </div>
        )}

        <p className="text-sm text-base-content/60 text-center mt-4">
          This will permanently remove the hand loan and all linked
          transactions. This action cannot be undone.
        </p>

        {error && (
          <div className="alert alert-error text-xs py-2 mt-3">
            <span>
              {typeof error === "string" ? error : "Something went wrong."}
            </span>
          </div>
        )}

        <div className="modal-action justify-center mt-6">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="btn btn-error btn-sm rounded-lg gap-1.5"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Delete Loan
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
