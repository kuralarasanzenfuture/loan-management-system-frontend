import React from "react";
import { AlertTriangle, Lock, X, AlertCircle } from "lucide-react";

/**
 * DeleteConfirmModal
 * Generic confirm-delete dialog, with support for locked system roles and error display.
 *
 * Props:
 * - open (bool)
 * - itemName (string)   : name shown in the confirmation copy, e.g. the role name
 * - isSystem (bool)     : if true, shows locked state and prevents deletion
 * - loading (bool)      : disables buttons + shows a spinner label while deleting
 * - error (string | null): error message from failed delete action
 * - onConfirm (fn)
 * - onClose (fn)
 */
export default function DeleteConfirmModal({
  open,
  itemName,
  isSystem = false,
  loading = false,
  error = null,
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm bg-base-200 border border-base-300">
        <button
          className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3"
          onClick={onClose}
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
          <h3 className="font-semibold text-base">
            {isSystem ? "System Role Protected" : "Delete this role?"}
          </h3>
          <p className="text-sm text-base-content/60">
            {isSystem ? (
              <>
                <span className="font-medium text-base-content">
                  "{itemName}"
                </span>{" "}
                is a core system role and cannot be deleted.
              </>
            ) : (
              <>
                You're about to permanently delete{" "}
                <span className="font-medium text-base-content">
                  "{itemName}"
                </span>
                . This can't be undone, and any users assigned to it will lose
                these permissions.
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
                : error?.message || "Failed to delete role."}
            </span>
          </div>
        )}

        <div className="modal-action justify-center gap-2 mt-6">
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            {isSystem ? "Close" : "Cancel"}
          </button>
          {!isSystem && (
            <button
              className="btn btn-error text-white hover:text-white"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Deleting…" : "Delete role"}
            </button>
          )}
        </div>
      </div>
      <div className="modal-backdrop" onClick={loading ? undefined : onClose} />
    </div>
  );
}
 