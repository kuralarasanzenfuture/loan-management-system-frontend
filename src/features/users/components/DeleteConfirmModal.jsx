import React from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

/**
 * DeleteConfirmModal
 *
 * Props:
 * - open (bool)
 * - itemName (string)   : name shown in the confirmation copy
 * - itemLabel (string)  : e.g. "role", "user" — defaults to "item"
 * - loading (bool)
 * - onConfirm (fn)
 * - onClose (fn)
 */
export default function DeleteConfirmModal({
  open,
  itemName,
  itemLabel = "item",
  loading,
  onConfirm,
  onClose,
}) {
  if (!open) return null;

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
          <h3 className="font-bold text-base">Delete {itemLabel}?</h3>
          <p className="text-sm text-base-content/60">
            Are you sure you want to delete
            <span className="font-semibold text-base-content">
              {itemName || "this " + itemLabel}
            </span>
            ? This action cannot be undone.
          </p>
        </div>

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
            Delete
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
