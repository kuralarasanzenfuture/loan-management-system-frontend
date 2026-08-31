import React from "react";
import { AlertTriangle, Loader2, X, UserRound, Trash2 } from "lucide-react";

/**
 * CustomerDeleteModal
 *
 * Props:
 * - open      (bool)          — controls visibility
 * - customer  (object|null)   — { id, first_name, last_name, customer_no, mobile, photo }
 * - loading   (bool)          — shows spinner while deleting
 * - error     (string|object|null)
 * - onConfirm (fn)            — called when "Delete" is confirmed
 * - onClose   (fn)            — called when modal is closed/cancelled
 */
export default function CustomerDeleteModal({
  open,
  customer,
  loading,
  error,
  onConfirm,
  onClose,
}) {
  if (!open || !customer) return null;

  const fullName = [customer.first_name, customer.last_name]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box max-w-sm rounded-2xl shadow-xl border border-base-200 bg-base-100 p-6">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="btn btn-ghost btn-sm btn-square absolute right-3 top-3 text-base-content/40 hover:text-base-content"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Icon + Title */}
        <div className="flex flex-col items-center text-center gap-3 pt-1">
          <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-error/10 text-error">
            <AlertTriangle size={26} />
          </span>
          <div>
            <h3 className="font-bold text-base text-base-content">
              Delete Customer?
            </h3>
            <p className="text-xs text-base-content/50 mt-1 leading-relaxed">
              This will permanently remove the customer record and all linked KYC
              documents. This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Customer preview card */}
        <div className="flex items-center gap-3 mt-5 p-3 rounded-xl border border-base-200 bg-base-200/40">
          <div className="w-11 h-11 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary shrink-0 text-sm font-bold">
            {customer.photo ? (
              <img
                src={customer.photo}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserRound size={18} />
            )}
          </div>
          <div className="min-w-0 text-left">
            <p className="font-semibold text-sm truncate text-base-content">
              {fullName || "Unnamed customer"}
            </p>
            <p className="text-[11px] text-base-content/40 truncate">
              {customer.customer_no}
              {customer.mobile ? ` · ${customer.mobile}` : ""}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error text-xs py-2 mt-4 rounded-xl">
            <span>
              {typeof error === "string" ? error : "Failed to delete. Please try again."}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn btn-ghost btn-sm rounded-xl px-5"
          >
            Cancel
          </button>
          <button
            type="button"
            id="confirm-delete-btn"
            onClick={onConfirm}
            disabled={loading}
            className="btn btn-error btn-sm rounded-xl gap-1.5 px-5"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className="modal-backdrop bg-black/40 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />
    </div>
  );
}
