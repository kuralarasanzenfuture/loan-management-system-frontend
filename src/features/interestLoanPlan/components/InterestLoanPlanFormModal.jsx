import React, { useState, useEffect } from "react";
import { X, Loader2, Percent } from "lucide-react";

const INTEREST_TYPE_OPTIONS = ["fixed", "percentage"];
const INTEREST_FREQUENCY_OPTIONS = [
  "monthly",
  "quarterly",
  "half_yearly",
  "yearly",
];
const TENURE_TYPE_OPTIONS = ["months", "years"];
const COMMISSION_TYPE_OPTIONS = ["none", "fixed", "percentage"];
const STATUS_OPTIONS = ["active", "inactive"];

const emptyForm = {
  plan_name: "",
  plan_code: "",
  interest_type: "percentage",
  interest_value: "",
  interest_frequency: "monthly",
  tenure: "",
  tenure_type: "months",
  penalty_enabled: false,
  commission_type: "none",
  commission_value: "",
  description: "",
  status: "active",
};

/**
 * InterestLoanPlanFormModal
 * Props:
 * - open (bool)
 * - initialData (object|null) : null = create, {...plan} = edit
 * - loading (bool)
 * - error (string|object|null)
 * - onClose (fn)
 * - onSubmit (fn)
 */
export default function InterestLoanPlanFormModal({
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
        plan_name: initialData.plan_name || "",
        plan_code: initialData.plan_code || "",
        interest_type: initialData.interest_type || "percentage",
        interest_value: initialData.interest_value ?? "",
        interest_frequency: initialData.interest_frequency || "monthly",
        tenure: initialData.tenure ?? "",
        tenure_type: initialData.tenure_type || "months",
        penalty_enabled: Boolean(initialData.penalty_enabled),
        commission_type: initialData.commission_type || "none",
        commission_value: initialData.commission_value ?? "",
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

  const handleCheckbox = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.checked }));
  };

  const validate = () => {
    const errors = {};
    if (!form.plan_name.trim()) errors.plan_name = "Plan name is required";
    if (isEdit && !form.plan_code.trim()) {
      errors.plan_code = "Plan code is required";
    }
    if (form.interest_value === "" || Number(form.interest_value) < 0)
      errors.interest_value = "Enter a valid interest value";
    if (
      form.interest_type === "percentage" &&
      Number(form.interest_value) > 100
    )
      errors.interest_value = "Percentage cannot exceed 100";
    if (!form.tenure || Number(form.tenure) <= 0)
      errors.tenure = "Enter a valid tenure";
    if (form.commission_type !== "none") {
      if (form.commission_value === "" || Number(form.commission_value) < 0)
        errors.commission_value = "Enter a valid commission value";
      if (
        form.commission_type === "percentage" &&
        Number(form.commission_value) > 100
      )
        errors.commission_value = "Percentage cannot exceed 100";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      plan_name: form.plan_name.trim(),
      interest_type: form.interest_type,
      interest_value: Number(form.interest_value),
      interest_frequency: form.interest_frequency,
      tenure: Number(form.tenure),
      tenure_type: form.tenure_type,
      principal_repayment: "end_of_term",
      penalty_enabled: form.penalty_enabled,
      commission_type: form.commission_type,
      commission_value:
        form.commission_type === "none" ? 0 : Number(form.commission_value),
      description: form.description.trim() || null,
      status: form.status,
    };

    if (form.plan_code && form.plan_code.trim()) {
      payload.plan_code = form.plan_code.trim().toUpperCase();
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
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Percent size={18} className="text-primary" />
              {isEdit ? "Edit Interest-Only Plan" : "New Interest-Only Plan"}
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

        {error && (
          <div className="alert alert-error text-sm py-2 mb-4">
            <span>
              {typeof error === "string"
                ? error
                : error?.message || "Something went wrong."}
            </span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 max-h-[65vh] overflow-y-auto pr-1"
        >
          {/* Plan Info */}
          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
              Plan Info
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
                  placeholder="Monthly Interest Gold Plan"
                />
                <FieldError field="plan_name" />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Plan Code {isEdit ? "*" : "(Auto-generated if blank)"}
                  </span>
                </label>
                <input
                  type="text"
                  value={form.plan_code}
                  onChange={handleChange("plan_code")}
                  className={`${inputClass("plan_code")} uppercase`}
                  placeholder="Auto-generated (e.g. IOLP-MTH-12M-001)"
                />
                <FieldError field="plan_code" />
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
                  placeholder="Interest-only loan with principal due at end of term"
                />
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
            </div>
          </section>

          {/* Interest */}
          <section className="space-y-3 pt-3 border-t border-base-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
              Interest
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Interest Type
                  </span>
                </label>
                <select
                  value={form.interest_type}
                  onChange={handleChange("interest_type")}
                  className="select select-bordered select-sm rounded-lg w-full capitalize"
                >
                  {INTEREST_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t} className="capitalize">
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Interest Value *{" "}
                    {form.interest_type === "percentage" ? "(%)" : "(₹)"}
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.interest_value}
                  onChange={handleChange("interest_value")}
                  className={inputClass("interest_value")}
                  placeholder="2.5"
                />
                <FieldError field="interest_value" />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Interest Frequency
                  </span>
                </label>
                <select
                  value={form.interest_frequency}
                  onChange={handleChange("interest_frequency")}
                  className="select select-bordered select-sm rounded-lg w-full"
                >
                  {INTEREST_FREQUENCY_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f
                        .replace(/_/g, " ")
                        .replace(/^\w/, (c) => c.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Principal Repayment
                  </span>
                </label>
                <input
                  type="text"
                  value="End of Term"
                  disabled
                  className="input input-bordered input-sm rounded-lg w-full bg-base-200/50 text-base-content/50"
                />
                <p className="text-[10px] text-base-content/40 mt-1">
                  Only repayment mode currently supported.
                </p>
              </div>
            </div>
          </section>

          {/* Tenure */}
          <section className="space-y-3 pt-3 border-t border-base-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
              Tenure
            </h4>
            <div className="grid grid-cols-2 gap-3">
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
                  className={inputClass("tenure")}
                  placeholder="12"
                />
                <FieldError field="tenure" />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Tenure Type
                  </span>
                </label>
                <select
                  value={form.tenure_type}
                  onChange={handleChange("tenure_type")}
                  className="select select-bordered select-sm rounded-lg w-full capitalize"
                >
                  {TENURE_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t} className="capitalize">
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Commission & Penalty */}
          <section className="space-y-3 pt-3 border-t border-base-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
              Commission & Penalty
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Commission Type
                  </span>
                </label>
                <select
                  value={form.commission_type}
                  onChange={handleChange("commission_type")}
                  className="select select-bordered select-sm rounded-lg w-full capitalize"
                >
                  {COMMISSION_TYPE_OPTIONS.map((c) => (
                    <option key={c} value={c} className="capitalize">
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Commission Value{" "}
                    {form.commission_type === "percentage"
                      ? "(%)"
                      : form.commission_type === "fixed"
                        ? "(₹)"
                        : ""}
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.commission_value}
                  onChange={handleChange("commission_value")}
                  disabled={form.commission_type === "none"}
                  className={`${inputClass("commission_value")} disabled:opacity-50 disabled:bg-base-200/50`}
                  placeholder={form.commission_type === "none" ? "N/A" : "0.00"}
                />
                <FieldError field="commission_value" />
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold pt-1">
              <input
                type="checkbox"
                checked={form.penalty_enabled}
                onChange={handleCheckbox("penalty_enabled")}
                className="checkbox checkbox-sm checkbox-warning rounded"
              />
              Enable late-payment penalty for this plan
            </label>
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
