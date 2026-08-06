import React from "react";
import { AlertTriangle, Loader2, X, UserRound } from "lucide-react";

/**
 * CustomerDeleteModal
 *
 * Props:
 * - open (bool)
 * - customer (object|null) : { id, first_name, last_name, customer_no, mobile, photo }
 * - loading (bool)
 * - error (string|object|null)
 * - onConfirm (fn)
 * - onClose (fn)
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
          <h3 className="font-bold text-base">Delete this customer?</h3>
        </div>

        {/* Customer identity card so there's no ambiguity about who's being deleted */}
        <div className="flex items-center gap-3 mt-4 p-3 rounded-xl border border-base-300 bg-base-200/40">
          <div className="avatar shrink-0">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary">
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
          </div>
          <div className="min-w-0 text-left">
            <p className="font-semibold text-sm truncate">
              {fullName || "Unnamed customer"}
            </p>
            <p className="text-[11px] text-base-content/40 truncate">
              {customer.customer_no}
              {customer.mobile ? ` · ${customer.mobile}` : ""}
            </p>
          </div>
        </div>

        <p className="text-sm text-base-content/60 text-center mt-4">
          This will permanently remove the customer record and all linked KYC
          documents. This action cannot be undone.
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
            Delete Customer
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
