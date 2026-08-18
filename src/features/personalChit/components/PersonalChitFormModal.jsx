import React, { useState, useEffect } from "react";
import { X, Loader2, Wallet2 } from "lucide-react";
import { numberToWordsIndian } from "../utils/numberToWordsIndian";

const SCHEDULE_TYPES = ["auto", "manual"];
const FREQUENCIES = ["weekly", "monthly", "quarterly", "custom"];
const STATUS_OPTIONS = ["active", "completed", "cancelled"];

const emptyForm = {
  chit_name: "",
  chit_provider: "",
  provider_mobile: "",
  provider_alternate_mobile: "",
  provider_address: "",
  chit_amount: "",
  payment_schedule_type: "manual",
  payment_frequency: "monthly",
  payment_interval: 1,
  start_date: new Date().toISOString().slice(0, 10),
  expected_end_date: "",
  total_members: "",
  status: "active",
  remarks: "",
};

/**
 * PersonalChitFormModal
 * Same shape handles create and edit via addPersonalChit(formData) /
 * editPersonalChit({ id, formData }).
 */
export default function PersonalChitFormModal({
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
        chit_name: initialData.chit_name || "",
        chit_provider: initialData.chit_provider || "",
        provider_mobile: initialData.provider_mobile || "",
        provider_alternate_mobile: initialData.provider_alternate_mobile || "",
        provider_address: initialData.provider_address || "",
        chit_amount: initialData.chit_amount ?? "",
        payment_schedule_type: initialData.payment_schedule_type || "manual",
        payment_frequency: initialData.payment_frequency || "monthly",
        payment_interval: initialData.payment_interval ?? 1,
        start_date: initialData.start_date
          ? initialData.start_date.slice(0, 10)
          : "",
        expected_end_date: initialData.expected_end_date
          ? initialData.expected_end_date.slice(0, 10)
          : "",
        total_members: initialData.total_members ?? "",
        status: initialData.status || "active",
        remarks: initialData.remarks || "",
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
    if (!form.chit_name.trim()) errors.chit_name = "Chit name is required";
    if (!form.chit_provider.trim())
      errors.chit_provider = "Provider name is required";
    if (!form.chit_amount || Number(form.chit_amount) <= 0)
      errors.chit_amount = "Enter a valid chit amount";
    if (!form.start_date) errors.start_date = "Select a start date";
    if (!form.payment_interval || Number(form.payment_interval) <= 0)
      errors.payment_interval = "Enter a valid interval";
    if (
      form.expected_end_date &&
      form.start_date &&
      new Date(form.expected_end_date) < new Date(form.start_date)
    )
      errors.expected_end_date = "End date cannot be before start date";

    if (!form.total_members || Number(form.total_members) <= 0)
      errors.total_members = "Enter a valid total members";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      chit_name: form.chit_name.trim(),
      chit_provider: form.chit_provider.trim(),
      provider_mobile: form.provider_mobile.trim() || null,
      provider_alternate_mobile: form.provider_alternate_mobile.trim() || null,
      provider_address: form.provider_address.trim() || null,
      chit_amount: Number(form.chit_amount),
      payment_schedule_type: form.payment_schedule_type,
      payment_frequency: form.payment_frequency,
      payment_interval: Number(form.payment_interval),
      start_date: form.start_date,
      expected_end_date: form.expected_end_date || null,
      total_members: form.total_members,
      status: form.status,
      remarks: form.remarks.trim() || null,
    });
  };

  const inputClass = (field) =>
    `input input-bordered input-sm rounded-lg w-full ${fieldErrors[field] ? "input-error" : ""}`;
  const FieldError = ({ field }) =>
    fieldErrors[field] ? (
      <span className="text-[11px] text-error mt-1">{fieldErrors[field]}</span>
    ) : null;

  const handleNumberInput =
    (fieldName, maxLength = 10) =>
    (e) => {
      const value = e.target.value.replace(/\D/g, ""); // Strip non-numeric characters
      if (value.length <= maxLength) {
        handleChange(fieldName)({ target: { value } });
      }
    };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-xl rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Wallet2 size={18} className="text-primary" />
              {isEdit ? "Edit Chit" : "New Chit"}
            </h3>
            {isEdit && (
              <p className="text-xs text-base-content/40 mt-0.5">
                {initialData.chit_no}
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
              {typeof error === "string" ? error : "Something went wrong."}
            </span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 max-h-[65vh] overflow-y-auto pr-1"
        >
          {/* Chit Info */}
          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
              Chit Info
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control col-span-2">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Chit Name *
                  </span>
                </label>
                <input
                  type="text"
                  value={form.chit_name}
                  onChange={handleChange("chit_name")}
                  className={inputClass("chit_name")}
                  placeholder="e.g. Annual Gold Chit 2026"
                />
                <FieldError field="chit_name" />
              </div>
              {/* <div className="form-control col-span-2">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Chit Amount (₹) *
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.chit_amount}
                  onChange={handleChange("chit_amount")}
                  className={inputClass("chit_amount")}
                />
                <FieldError field="chit_amount" />
              </div> */}
              <div className="form-control col-span-2">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Chit Amount (₹) *
                  </span>
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.chit_amount}
                  onChange={handleChange("chit_amount")}
                  className={inputClass("chit_amount")}
                  placeholder="e.g. 100000"
                />

                {/* Display amount in words when typed */}
                {form.chit_amount && Number(form.chit_amount) > 0 && (
                  <span className="text-[11px] font-medium text-primary mt-1 italic">
                    {numberToWordsIndian(form.chit_amount)}
                  </span>
                )}

                <FieldError field="chit_amount" />
              </div>
            </div>
            <div className="form-control col-span-2">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">
                  total members *
                </span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.total_members}
                onChange={handleChange("total_members")}
                className={inputClass("total_members")}
                placeholder="e.g. 100"
              />
              <FieldError field="total_members" />
            </div>
          </section>

          {/* Provider */}
          <section className="space-y-3 pt-2 border-t border-base-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
              Provider
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control col-span-2">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Provider Name *
                  </span>
                </label>
                <input
                  type="text"
                  value={form.chit_provider}
                  onChange={handleChange("chit_provider")}
                  className={inputClass("chit_provider")}
                />
                <FieldError field="chit_provider" />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Mobile
                  </span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={form.provider_mobile || ""}
                  // onChange={handleChange("provider_mobile")}
                  onChange={handleNumberInput("provider_mobile", 10)}
                  placeholder="e.g. 1234567890"
                  className={inputClass("provider_mobile")}
                />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Alternate Mobile
                  </span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={form.provider_alternate_mobile}
                  // onChange={handleChange("provider_alternate_mobile")}
                  onChange={handleNumberInput("provider_alternate_mobile", 10)}
                  placeholder="e.g. 1234567890"
                  className={inputClass("provider_alternate_mobile")}
                />
              </div>
              <div className="form-control col-span-2">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Address
                  </span>
                </label>
                <textarea
                  value={form.provider_address}
                  onChange={handleChange("provider_address")}
                  rows={2}
                  className="textarea textarea-bordered textarea-sm rounded-lg w-full"
                />
              </div>
            </div>
          </section>

          {/* Schedule */}
          <section className="space-y-3 pt-2 border-t border-base-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/40">
              Payment Schedule
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Schedule Type
                  </span>
                </label>
                <select
                  value={form.payment_schedule_type}
                  onChange={handleChange("payment_schedule_type")}
                  className="select select-bordered select-sm rounded-lg w-full capitalize"
                >
                  {SCHEDULE_TYPES.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Frequency
                  </span>
                </label>
                <select
                  value={form.payment_frequency}
                  onChange={handleChange("payment_frequency")}
                  className="select select-bordered select-sm rounded-lg w-full capitalize"
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f} value={f} className="capitalize">
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Interval *
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.payment_interval}
                  onChange={handleChange("payment_interval")}
                  className={inputClass("payment_interval")}
                />
                <FieldError field="payment_interval" />
                <p className="text-[10px] text-base-content/40 mt-1">
                  e.g. every 1 month, every 2 weeks
                </p>
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
                    Start Date *
                  </span>
                </label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={handleChange("start_date")}
                  className={inputClass("start_date")}
                />
                <FieldError field="start_date" />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Expected End Date
                  </span>
                </label>
                <input
                  type="date"
                  value={form.expected_end_date}
                  onChange={handleChange("expected_end_date")}
                  className={inputClass("expected_end_date")}
                />
                <FieldError field="expected_end_date" />
              </div>
            </div>
          </section>

          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">Remarks</span>
            </label>
            <textarea
              value={form.remarks}
              onChange={handleChange("remarks")}
              rows={2}
              className="textarea textarea-bordered textarea-sm rounded-lg w-full"
            />
          </div>

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
              {isEdit ? "Save Changes" : "Create Chit"}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
