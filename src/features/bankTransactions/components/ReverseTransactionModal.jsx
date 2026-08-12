import React from "react";
import { Undo2, Loader2, X, Receipt } from "lucide-react";
import { formatCurrency, formatDateTime } from "../utils/transactionHelpers.js";

export default function ReverseTransactionModal({
  open,
  transaction,
  loading,
  error,
  onConfirm,
  onClose,
}) {
  if (!open || !transaction) return null;

  const isCredit = transaction.transaction_type === "credit";

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
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-warning/10 text-warning">
            <Undo2 size={22} />
          </span>
          <h3 className="font-bold text-base">Reverse this transaction?</h3>
        </div>

        <div className="flex items-center gap-3 mt-4 p-3 rounded-xl border border-base-300 bg-base-200/40">
          <span className="flex items-center justify-center w-11 h-11 rounded-full bg-primary/10 text-primary shrink-0">
            <Receipt size={18} />
          </span>
          <div className="min-w-0 text-left">
            <p className="font-semibold text-sm truncate font-mono">
              {transaction.transaction_no}
            </p>
            <p className="text-[11px] text-base-content/40 truncate">
              {formatDateTime(transaction.transaction_date)}
            </p>
          </div>
          <span
            className={`ml-auto text-sm font-bold shrink-0 ${isCredit ? "text-success" : "text-error"}`}
          >
            {isCredit ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </span>
        </div>

        <p className="text-sm text-base-content/60 text-center mt-4">
          A reversing entry will be created and this transaction will be marked
          as reversed. The bank balance will be adjusted accordingly. This
          action cannot be undone.
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
            className="btn btn-warning btn-sm rounded-lg gap-1.5"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Reverse Transaction
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
