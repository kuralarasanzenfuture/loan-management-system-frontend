import React, { useEffect, useState } from "react";
import { X, ShieldCheck } from "lucide-react";

/**
 * RoleFormModal
 * Handles both "create role" and "edit role" — pass `initialData` to edit,
 * or leave it null/undefined to create.
 *
 * Matches the API payload shape: { name, description, status }
 *
 * Props:
 * - open (bool)
 * - initialData (object | null) : an existing role to edit, or null for create
 * - loading (bool)
 * - error (string | null)        : server-side error from the create/edit thunk
 * - onClose (fn)
 * - onSubmit (fn)                : called with { name, description, status }
 */

const EMPTY_FORM = {
  name: "",
  description: "",
  status: "active",
};

export default function RoleFormModal({
  open,
  initialData = null,
  loading = false,
  error = null,
  onClose,
  onSubmit,
}) {
  const isEdit = Boolean(initialData);
  const [form, setForm] = useState(EMPTY_FORM);
  const [validationError, setValidationError] = useState("");

  // Populate the form when opening for edit, reset when opening for create.
  useEffect(() => {
    if (open) {
      setForm(
        initialData
          ? {
              name: initialData.name || "",
              description: initialData.description || "",
              status: initialData.status || "active",
            }
          : EMPTY_FORM,
      );
      setValidationError("");
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setValidationError("Role name is required.");
      return;
    }
    setValidationError("");
    onSubmit(form);
  };

  const displayError = validationError || error;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md bg-base-100 border border-base-300">
        <button
          className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3"
          onClick={onClose}
          aria-label="Close"
          disabled={loading}
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-1">
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary shrink-0">
            <ShieldCheck size={17} />
          </span>
          <h3 className="font-semibold text-lg leading-tight">
            {isEdit ? "Edit role" : "Create a new role"}
          </h3>
        </div>
        <p className="text-sm text-base-content/50 mb-5">
          {isEdit
            ? "Update this role's name, description, or status."
            : "Give the role a name and description to get started."}
        </p>

        {displayError && (
          <div className="alert alert-error text-sm py-2 mb-4">
            <span>{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="form-control">
            <label className="label py-1" htmlFor="role-name">
              <span className="label-text text-xs font-medium">Role name</span>
            </label>
            <input
              id="role-name"
              type="text"
              className="input input-bordered input-sm w-full"
              placeholder="e.g. Senior Loan Officer"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-control">
            <label className="label py-1" htmlFor="role-description">
              <span className="label-text text-xs font-medium">
                Description
              </span>
            </label>
            <textarea
              id="role-description"
              className="textarea textarea-bordered textarea-sm w-full resize-none"
              rows={3}
              placeholder="What does this role do?"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              disabled={loading}
            />
          </div>

          <div className="form-control">
            <label className="label py-1" htmlFor="role-status">
              <span className="label-text text-xs font-medium">Status</span>
            </label>
            <select
              id="role-status"
              className="select select-bordered select-sm w-full"
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value }))
              }
              disabled={loading}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="modal-action mt-5">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={loading}
            >
              {loading
                ? isEdit
                  ? "Saving…"
                  : "Creating…"
                : isEdit
                  ? "Save changes"
                  : "Create role"}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={loading ? undefined : onClose} />
    </div>
  );
}
