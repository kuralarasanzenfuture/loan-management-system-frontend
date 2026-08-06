import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";

const STATUS_OPTIONS = ["active", "inactive", "blocked"];

/**
 * UserFormModal
 *
 * Props:
 * - open (bool)
 * - initialData (object|null) : null/undefined = create mode, {...user} = edit mode
 * - roles (array)              : [{ id, name }] for the role select
 * - loading (bool)
 * - error (string|object|null)
 * - onClose (fn)
 * - onSubmit (fn) : called with form data
 */
export default function UserFormModal({
  open,
  initialData,
  roles = [],
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const isEdit = Boolean(initialData?.id);

  const emptyForm = {
    username: "",
    email: "",
    mobile: "",
    password: "",
    role_id: "", // "" = nothing selected yet, forces the placeholder to show
    status: "active",
  };

  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      setForm({
        username: initialData.username || "",
        email: initialData.email || "",
        mobile: initialData.mobile || "",
        password: "",
        role_id: initialData.role_id != null ? String(initialData.role_id) : "",
        status: initialData.status || "active",
      });
    } else {
      setForm(emptyForm);
    }
    setFieldErrors({});
    setShowPassword(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData, isEdit]);

  if (!open) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errors = {};
    if (!form.username.trim()) errors.username = "Username is required";
    if (!isEdit && !form.password) errors.password = "Password is required";
    if (form.password && form.password.length < 6)
      errors.password = "Password must be at least 6 characters";
    if (!form.role_id) errors.role_id = "Please select a role";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      errors.email = "Enter a valid email";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      username: form.username.trim(),
      email: form.email.trim() || null,
      mobile: form.mobile.trim() || null,
      role_id: Number(form.role_id),
      status: form.status,
    };

    // Only include password if creating, or editing with a new one set
    if (!isEdit || form.password) {
      payload.password = form.password;
    }

    onSubmit(payload);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">
            {isEdit ? "Edit User" : "New User"}
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
          {/* Username */}
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">
                Username *
              </span>
            </label>
            <input
              type="text"
              value={form.username}
              onChange={handleChange("username")}
              className={`input input-bordered input-sm rounded-lg ${
                fieldErrors.username ? "input-error" : ""
              }`}
              placeholder="e.g. kural"
              autoComplete="off"
            />
            {fieldErrors.username && (
              <span className="text-[11px] text-error mt-1">
                {fieldErrors.username}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">Email</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              className={`input input-bordered input-sm rounded-lg ${
                fieldErrors.email ? "input-error" : ""
              }`}
              placeholder="e.g. kural@gmail.com"
              autoComplete="off"
            />
            {fieldErrors.email && (
              <span className="text-[11px] text-error mt-1">
                {fieldErrors.email}
              </span>
            )}
          </div>

          {/* Mobile */}
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">Mobile</span>
            </label>
            <input
              type="tel"
              value={form.mobile}
              onChange={handleChange("mobile")}
              className="input input-bordered input-sm rounded-lg"
              placeholder="e.g. 6380564945"
            />
          </div>

          {/* Password */}
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">
                {isEdit
                  ? "New Password (leave blank to keep current)"
                  : "Password *"}
              </span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange("password")}
                className={`input input-bordered input-sm rounded-lg w-full pr-9 ${
                  fieldErrors.password ? "input-error" : ""
                }`}
                placeholder={isEdit ? "••••••••" : "Minimum 6 characters"}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {fieldErrors.password && (
              <span className="text-[11px] text-error mt-1">
                {fieldErrors.password}
              </span>
            )}
          </div>

          {/* Role + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">Role *</span>
              </label>
              <select
                value={form.role_id}
                onChange={handleChange("role_id")}
                className={`select select-bordered select-sm rounded-lg ${
                  fieldErrors.role_id ? "select-error" : ""
                }`}
              >
                <option value="" disabled>
                  {roles.length === 0 ? "No roles available" : "Select role"}
                </option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              {fieldErrors.role_id && (
                <span className="text-[11px] text-error mt-1">
                  {fieldErrors.role_id}
                </span>
              )}
            </div>

            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">Status</span>
              </label>
              <select
                value={form.status}
                onChange={handleChange("status")}
                className="select select-bordered select-sm rounded-lg capitalize"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
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
              {isEdit ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}