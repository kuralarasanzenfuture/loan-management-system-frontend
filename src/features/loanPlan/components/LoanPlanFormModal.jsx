import React, { useState, useEffect } from "react";
import { X, Loader2, Landmark, ShieldAlert } from "lucide-react";

const FREQUENCY_OPTIONS = ["daily", "weekly", "monthly"];
const TENURE_TYPE_OPTIONS = ["days", "weeks", "months"];
const VALUE_TYPE_OPTIONS = ["fixed", "percentage"];
const STATUS_OPTIONS = ["active", "inactive"];

const emptyForm = {
  plan_name: "",
  plan_code: "",
  collection_frequency: "daily",
  tenure: "",
  tenure_type: "days",
  commission_type: "fixed",
  commission_value: "",
  description: "",
  status: "active",
  penalty: {
    grace_days: "",
    penalty_type: "fixed",
    penalty_value: "",
    max_penalty: "",
    status: "active",
  },
};

/**
 * LoanPlanFormModal
 * Props:
 * - open (bool)
 * - initialData (object|null) : null/undefined = create,
 *     {...flattened plan+penalty fields from GET} = edit
 * - loading (bool)
 * - error (string|object|null)
 * - onClose (fn)
 * - onSubmit (fn) : called with { ...planFields, penalty: {...} }
 */
export default function LoanPlanFormModal({
  open,
  initialData,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const isEdit = Boolean(initialData?.id);
  // Plan is "in use" if it has loans attached — core fields are locked
  const isUsed = isEdit && Number(initialData?.loan_count) > 0;
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      setForm({
        plan_name: initialData.plan_name || "",
        plan_code: initialData.plan_code || "",
        collection_frequency: initialData.collection_frequency || "daily",
        tenure: initialData.tenure ?? "",
        tenure_type: initialData.tenure_type || "days",
        commission_type: initialData.commission_type || "fixed",
        commission_value: initialData.commission_value ?? "",
        description: initialData.description || "",
        status: initialData.status || "active",
        penalty: {
          grace_days: initialData.grace_days ?? "",
          penalty_type: initialData.penalty_type || "fixed",
          penalty_value: initialData.penalty_value ?? "",
          max_penalty: initialData.max_penalty ?? "",
          status: initialData.penalty_status || "active",
        },
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

  const handlePenaltyChange = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      penalty: { ...prev.penalty, [field]: e.target.value },
    }));
    setFieldErrors((prev) => ({ ...prev, [`penalty.${field}`]: null }));
  };

  const validate = () => {
    const errors = {};
    if (!form.plan_name.trim()) errors.plan_name = "Plan name is required";
    // if (!form.plan_code.trim()) errors.plan_code = "Plan code is required";

    // Skip core-field validation if the plan is in use (fields are locked)
    if (!isUsed) {
      if (
        !form.tenure ||
        isNaN(form.tenure) ||
        Number(form.tenure) <= 0 ||
        !Number.isInteger(Number(form.tenure))
      )
        errors.tenure = "Enter a valid positive integer for tenure";

      if (
        form.commission_value === "" ||
        isNaN(form.commission_value) ||
        Number(form.commission_value) < 0
      )
        errors.commission_value = "Enter a valid commission value";
      else if (
        form.commission_type === "percentage" &&
        Number(form.commission_value) > 100
      )
        errors.commission_value = "Percentage cannot exceed 100";

      if (
        form.penalty.penalty_value === "" ||
        isNaN(form.penalty.penalty_value) ||
        Number(form.penalty.penalty_value) < 0
      )
        errors["penalty.penalty_value"] = "Enter a valid penalty value";
      else if (
        form.penalty.penalty_type === "percentage" &&
        Number(form.penalty.penalty_value) > 100
      )
        errors["penalty.penalty_value"] = "Percentage cannot exceed 100";

      if (
        form.penalty.grace_days !== "" &&
        (isNaN(form.penalty.grace_days) ||
          Number(form.penalty.grace_days) < 0 ||
          !Number.isInteger(Number(form.penalty.grace_days)))
      )
        errors["penalty.grace_days"] =
          "Grace days must be a non-negative integer";

      if (
        form.penalty.max_penalty !== "" &&
        form.penalty.max_penalty !== null &&
        (isNaN(form.penalty.max_penalty) || Number(form.penalty.max_penalty) < 0)
      )
        errors["penalty.max_penalty"] = "Max penalty cannot be negative";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      plan_name: form.plan_name.trim(),
      // plan_code: form.plan_code.trim().toUpperCase(),
      description: form.description.trim() || null,
      status: String(form.status).toLowerCase(),
    };

    // Only include core fields if plan is not in use (backend would reject them anyway)
    if (!isUsed) {
      payload.collection_frequency = String(form.collection_frequency).toLowerCase();
      payload.tenure = Number(form.tenure);
      payload.tenure_type = String(form.tenure_type).toLowerCase();
      payload.commission_type = String(form.commission_type).toLowerCase();
      payload.commission_value = Number(form.commission_value);
      payload.penalty = {
        grace_days:
          form.penalty.grace_days === "" ? 0 : Number(form.penalty.grace_days),
        penalty_type: String(form.penalty.penalty_type).toLowerCase(),
        penalty_value: Number(form.penalty.penalty_value),
        max_penalty:
          form.penalty.max_penalty === "" || form.penalty.max_penalty === null
            ? null
            : Number(form.penalty.max_penalty),
        status: String(form.penalty.status).toLowerCase(),
      };
    }

    onSubmit(payload);
  };

  const inputClass = (field) =>
    `input input-bordered input-sm rounded-lg w-full ${fieldErrors[field] ? "input-error" : ""}`;

  const FieldError = ({ field }) =>
    fieldErrors[field] ? (
      <span className="text-[11px] text-error mt-1">{fieldErrors[field]}</span>
    ) : null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">
              {isEdit ? "Edit Loan Plan" : "New Loan Plan"}
            </h3>
            {isEdit && (
              <p className="text-xs text-base-content/40 mt-0.5">
                {initialData.plan_code}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {isUsed && (
          <div className="alert alert-warning text-xs py-2 mb-3">
            <span>
              ⚠️ This plan has <strong>{initialData.loan_count}</strong> active loan(s). Core fields are locked and cannot be changed.
              You can only update the <strong>Plan Name</strong>, <strong>Plan Code</strong>, <strong>Description</strong>, and <strong>Status</strong>.
            </span>
          </div>
        )}

        {error && (
          <div className="alert alert-error text-sm py-2 mb-4">
            <span>
              {typeof error === "string" ? error : "Something went wrong."}
            </span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 max-h-[65vh] overflow-y-auto pr-1"
        >
          {/* Plan Details */}
          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40 flex items-center gap-1.5">
              <Landmark size={13} /> Plan Details
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Plan Name *
                  </span>
                </label>
                <input
                  type="text"
                  value={form.plan_name}
                  onChange={handleChange("plan_name")}
                  className={inputClass("plan_name")}
                  placeholder="Daily Gold Plan"
                />
                <FieldError field="plan_name" />
              </div>
              {/* <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Plan Code *
                  </span>
                </label>
                <input
                  type="text"
                  value={form.plan_code}
                  onChange={handleChange("plan_code")}
                  className={`${inputClass("plan_code")} uppercase`}
                  placeholder="DGP0012"
                />
                <FieldError field="plan_code" />
              </div> */}

              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Collection Frequency *
                  </span>
                </label>
                <select
                  value={form.collection_frequency}
                  onChange={handleChange("collection_frequency")}
                  disabled={isUsed}
                  className={`select select-bordered select-sm rounded-lg w-full capitalize ${isUsed ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {FREQUENCY_OPTIONS.map((f) => (
                    <option key={f} value={f} className="capitalize">
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Status
                  </span>
                </label>
                <select
                  value={form.status}
                  onChange={handleChange("status")}
                  className="select select-bordered select-sm rounded-lg w-full capitalize"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Tenure *
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.tenure}
                  onChange={handleChange("tenure")}
                  disabled={isUsed}
                  className={`${inputClass("tenure")} ${isUsed ? "opacity-50 cursor-not-allowed" : ""}`}
                  placeholder="100"
                />
                <FieldError field="tenure" />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Tenure Type *
                  </span>
                </label>
                <select
                  value={form.tenure_type}
                  onChange={handleChange("tenure_type")}
                  disabled={isUsed}
                  className={`select select-bordered select-sm rounded-lg w-full capitalize ${isUsed ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {TENURE_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t} className="capitalize">
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Commission Type
                  </span>
                </label>
                <select
                  value={form.commission_type}
                  onChange={handleChange("commission_type")}
                  disabled={isUsed}
                  className={`select select-bordered select-sm rounded-lg w-full capitalize ${isUsed ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {VALUE_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t} className="capitalize">
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Commission Value *{" "}
                    {form.commission_type === "percentage" ? "(%)" : "(₹)"}
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.commission_value}
                  onChange={handleChange("commission_value")}
                  disabled={isUsed}
                  className={`${inputClass("commission_value")} ${isUsed ? "opacity-50 cursor-not-allowed" : ""}`}
                  placeholder="2.5"
                />
                <FieldError field="commission_value" />
              </div>

              <div className="form-control col-span-2">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Description
                  </span>
                </label>
                <textarea
                  value={form.description}
                  onChange={handleChange("description")}
                  rows={2}
                  className="textarea textarea-bordered textarea-sm rounded-lg w-full"
                  placeholder="Daily gold loan for small vendors"
                />
              </div>
            </div>
          </section>

          {/* Penalty Details */}
          <section className="space-y-3 pt-3 border-t border-base-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40 flex items-center gap-1.5">
              <ShieldAlert size={13} /> Late Payment Penalty
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Grace Days
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.penalty.grace_days}
                  onChange={handlePenaltyChange("grace_days")}
                  disabled={isUsed}
                  className={`${inputClass("penalty.grace_days")} ${isUsed ? "opacity-50 cursor-not-allowed" : ""}`}
                  placeholder="3"
                />
                <FieldError field="penalty.grace_days" />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Penalty Status
                  </span>
                </label>
                <select
                  value={form.penalty.status}
                  onChange={handlePenaltyChange("status")}
                  disabled={isUsed}
                  className={`select select-bordered select-sm rounded-lg w-full capitalize ${isUsed ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Penalty Type *
                  </span>
                </label>
                <select
                  value={form.penalty.penalty_type}
                  onChange={handlePenaltyChange("penalty_type")}
                  disabled={isUsed}
                  className={`select select-bordered select-sm rounded-lg w-full capitalize ${isUsed ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {VALUE_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t} className="capitalize">
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Penalty Value *{" "}
                    {form.penalty.penalty_type === "percentage" ? "(%)" : "(₹)"}
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.penalty.penalty_value}
                  onChange={handlePenaltyChange("penalty_value")}
                  disabled={isUsed}
                  className={`${inputClass("penalty.penalty_value")} ${isUsed ? "opacity-50 cursor-not-allowed" : ""}`}
                  placeholder="1.5"
                />
                <FieldError field="penalty.penalty_value" />
              </div>

              <div className="form-control col-span-2">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Max Penalty Cap (₹)
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.penalty.max_penalty}
                  onChange={handlePenaltyChange("max_penalty")}
                  disabled={isUsed}
                  className={`${inputClass("penalty.max_penalty")} ${isUsed ? "opacity-50 cursor-not-allowed" : ""}`}
                  placeholder="500"
                />
                <p className="text-[10px] text-base-content/40 mt-1">
                  Leave blank for no cap on penalty amount.
                </p>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="modal-action mt-6 sticky bottom-0 bg-base-100 pt-3 -mb-1">
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
              {isEdit ? "Save Changes" : "Create Plan"}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
