import React from "react";
import { AlertTriangle, Lock, Loader2, X, AlertCircle } from "lucide-react";

/**
 * DeleteConfirmModal
 *
 * Props:
 * - open (bool)
 * - itemName (string)   : name shown in the confirmation copy
 * - itemLabel (string)  : e.g. "role", "user" — defaults to "item"
 * - isSystem (bool)     : if true, shows locked state and prevents deletion
 * - loading (bool)
 * - error (string | null): error message from failed delete action
 * - onConfirm (fn)
 * - onClose (fn)
 */
export default function DeleteConfirmModal({
  open,
  itemName,
  itemLabel = "item",
  isSystem = false,
  loading,
  error = null,
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm rounded-2xl bg-base-200 border border-base-300">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost btn-sm btn-square absolute right-3 top-3"
          aria-label="Close"
          disabled={loading}
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center gap-3 pt-2">
          <span
            className={`flex items-center justify-center w-12 h-12 rounded-full ${
              isSystem ? "bg-warning/10 text-warning" : "bg-error/10 text-error"
            }`}
          >
            {isSystem ? <Lock size={22} /> : <AlertTriangle size={22} />}
          </span>
          <h3 className="font-bold text-base">
            {isSystem ? "System User Protected" : `Delete ${itemLabel}?`}
          </h3>
          <p className="text-sm text-base-content/60">
            {isSystem ? (
              <>
                <span className="font-semibold text-base-content">
                  "{itemName || itemLabel}"
                </span>{" "}
                is a system role user and cannot be deleted.
              </>
            ) : (
              <>
                Are you sure you want to delete{" "}
                <span className="font-semibold text-base-content">
                  {itemName || "this " + itemLabel}
                </span>
                ? This action cannot be undone.
              </>
            )}
          </p>
        </div>

        {error && (
          <div className="alert alert-error text-sm py-2.5 px-3 rounded-xl flex items-start gap-2.5 mt-4 text-left shadow-sm">
            <AlertCircle size={16} className="shrink-0 text-white mt-0.5" />
            <span className="leading-snug text-white font-medium text-xs break-words">
              {typeof error === "string"
                ? error
                : error?.message || "Failed to delete user."}
            </span>
          </div>
        )}

        <div className="modal-action justify-center mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn btn-ghost btn-sm rounded-lg"
          >
            {isSystem ? "Close" : "Cancel"}
          </button>
          {!isSystem && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="btn btn-error btn-sm rounded-lg gap-1.5 text-white"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Delete
            </button>
          )}
        </div>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={loading ? undefined : onClose} />
    </div>
  );
}
