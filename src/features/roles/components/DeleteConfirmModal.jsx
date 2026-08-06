import React from "react";
import { AlertTriangle, X } from "lucide-react";

/**
 * DeleteConfirmModal
 * Generic confirm-delete dialog, reusable across any resource (roles,
 * borrowers, loans, etc.) — not tied to the role model specifically.
 *
 * Props:
 * - open (bool)
 * - itemName (string)   : name shown in the confirmation copy, e.g. the role name
 * - loading (bool)       : disables buttons + shows a spinner label while deleting
 * - onConfirm (fn)
 * - onClose (fn)
 */
export default function DeleteConfirmModal({
  open,
  itemName,
  loading = false,
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
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-error/10 text-error">
            <AlertTriangle size={22} />
          </span>
          <h3 className="font-semibold text-base">Delete this role?</h3>
          <p className="text-sm text-base-content/60">
            You're about to permanently delete{" "}
            <span className="font-medium text-base-content">"{itemName}"</span>.
            This can't be undone, and any users assigned to it will lose these
            permissions.
          </p>
        </div>

        <div className="modal-action justify-center gap-2 mt-6">
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-error text-white hover:text-white"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting…" : "Delete role"}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={loading ? undefined : onClose} />
    </div>
  );
}
 