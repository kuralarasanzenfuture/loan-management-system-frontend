import React, { useState, useEffect } from "react";
import { X, Loader2, Boxes } from "lucide-react";

const emptyForm = {
  category_name: "",
  description: "",
  status: "active",
};

/**
 * AssetCategoryFormModal
 * Props:
 * - open (bool)
 * - initialData (object|null) : null/undefined = create, {...category} = edit
 * - loading (bool)
 * - error (string|object|null)
 * - onClose (fn)
 * - onSubmit (fn)
 */
export default function AssetCategoryFormModal({
  open,
  initialData,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const isEdit = Boolean(initialData?.id);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      setForm({
        category_name: initialData.category_name || "",
        description: initialData.description || "",
        status: initialData.status || "active",
      });
    } else {
      setForm(emptyForm);
    }
    setFieldErrors({});
  }, [open, initialData, isEdit]);

  if (!open) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errors = {};
    if (!form.category_name.trim())
      errors.category_name = "Category name is required";
    if (form.description && form.description.length > 255)
      errors.description = "Description must be under 255 characters";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      category_name: form.category_name.trim(),
      description: form.description.trim() || null,
      status: form.status,
    });
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Boxes size={18} className="text-primary" />
            {isEdit ? "Edit Asset Category" : "New Asset Category"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="alert alert-error text-sm py-2 mb-4">
            <span>
              {typeof error === "string" ? error : "Something went wrong."}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">
                Category Name *
              </span>
            </label>
            <input
              type="text"
              value={form.category_name}
              onChange={handleChange("category_name")}
              className={`input input-bordered input-sm rounded-lg ${fieldErrors.category_name ? "input-error" : ""}`}
              placeholder="e.g. Gold, Vehicle, Electronics"
              autoFocus
            />
            {fieldErrors.category_name && (
              <span className="text-[11px] text-error mt-1">
                {fieldErrors.category_name}
              </span>
            )}
          </div>

          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">
                Description
              </span>
            </label>
            <textarea
              value={form.description}
              onChange={handleChange("description")}
              rows={3}
              maxLength={255}
              className={`textarea textarea-bordered textarea-sm rounded-lg w-full ${fieldErrors.description ? "textarea-error" : ""}`}
              placeholder="Short description of this asset category"
            />
            <div className="flex justify-between items-center mt-1">
              {fieldErrors.description ? (
                <span className="text-[11px] text-error">
                  {fieldErrors.description}
                </span>
              ) : (
                <span />
              )}
              <span className="text-[10px] text-base-content/30">
                {form.description.length}/255
              </span>
            </div>
          </div>

          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">Status</span>
            </label>
            <select
              value={form.status}
              onChange={handleChange("status")}
              className="select select-bordered select-sm rounded-lg w-full capitalize"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="modal-action mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-sm rounded-lg gap-1.5"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
