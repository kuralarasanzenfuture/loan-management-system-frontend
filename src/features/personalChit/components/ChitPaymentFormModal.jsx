import React, { useState, useEffect } from "react";
import { X, Loader2, Receipt } from "lucide-react";
import { formatCurrency } from "../utils/chitHelpers.js";

const PAYMENT_MODES = ["cash", "bank", "upi", "cheque", "other"];
const STATUS_OPTIONS = ["pending", "partial", "paid", "overdue"];

/**
 * ChitPaymentFormModal
 * Handles create (installment_no is next auto-suggested) and edit
 * (record an actual payment against an existing due installment).
 *
 * Props:
 * - open (bool)
 * - initialData (object|null) : null = create new installment,
 *     {...payment} = edit/record payment against it
 * - suggestedInstallmentNo (number) : for create mode
 * - loading (bool)
 * - error (string|object|null)
 * - onClose (fn)
 * - onSubmit (fn)
 */
export default function ChitPaymentFormModal({
  open,
  initialData,
  suggestedInstallmentNo,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const isEdit = Boolean(initialData?.id);
  const [form, setForm] = useState({
    installment_no: suggestedInstallmentNo || 1,
    due_date: "",
    payment_date: "",
    due_amount: "",
    paid_amount: "",
    payment_mode: "cash",
    transaction_reference: "",
    status: "pending",
    remarks: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      setForm({
        installment_no: initialData.installment_no,
        due_date: initialData.due_date ? initialData.due_date.slice(0, 10) : "",
        payment_date: initialData.payment_date
          ? initialData.payment_date.slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        due_amount: initialData.due_amount ?? "",
        paid_amount: initialData.paid_amount || initialData.due_amount || "",
        payment_mode: initialData.payment_mode || "cash",
        transaction_reference: initialData.transaction_reference || "",
        status: initialData.status === "pending" ? "paid" : initialData.status,
        remarks: initialData.remarks || "",
      });
    } else {
      setForm({
        installment_no: suggestedInstallmentNo || 1,
        due_date: "",
        payment_date: "",
        due_amount: "",
        paid_amount: "",
        payment_mode: "cash",
        transaction_reference: "",
        status: "pending",
        remarks: "",
      });
    }
    setFieldErrors({});
  }, [open, initialData, isEdit, suggestedInstallmentNo]);

  if (!open) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errors = {};
    if (!form.due_date) errors.due_date = "Select a due date";
    if (!form.due_amount || Number(form.due_amount) <= 0)
      errors.due_amount = "Enter a valid due amount";
    if (form.paid_amount !== "" && Number(form.paid_amount) < 0)
      errors.paid_amount = "Paid amount cannot be negative";
    if (
      form.paid_amount !== "" &&
      Number(form.paid_amount) > Number(form.due_amount)
    )
      errors.paid_amount = "Paid amount cannot exceed due amount";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const paidAmt = form.paid_amount === "" ? 0 : Number(form.paid_amount);
    const dueAmt = Number(form.due_amount);

    onSubmit({
      installment_no: Number(form.installment_no),
      due_date: form.due_date,
      payment_date: form.payment_date || null,
      due_amount: dueAmt,
      paid_amount: paidAmt,
      pending_amount: Math.max(dueAmt - paidAmt, 0),
      payment_mode: form.payment_mode,
      transaction_reference: form.transaction_reference.trim() || null,
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

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Receipt size={18} className="text-primary" />
            {isEdit
              ? `Record Payment #${form.installment_no}`
              : "New Installment"}
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
          {!isEdit && (
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">
                  Installment No. *
                </span>
              </label>
              <input
                type="number"
                min="1"
                value={form.installment_no}
                onChange={handleChange("installment_no")}
                className={inputClass("installment_no")}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">
                  Due Date *
                </span>
              </label>
              <input
                type="date"
                value={form.due_date}
                onChange={handleChange("due_date")}
                className={inputClass("due_date")}
              />
              <FieldError field="due_date" />
            </div>
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">
                  Due Amount (₹) *
                </span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.due_amount}
                onChange={handleChange("due_amount")}
                className={inputClass("due_amount")}
              />
              <FieldError field="due_amount" />
            </div>
          </div>

          {isEdit && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Paid Amount (₹)
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.paid_amount}
                    onChange={handleChange("paid_amount")}
                    className={inputClass("paid_amount")}
                  />
                  <FieldError field="paid_amount" />
                </div>
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Payment Date
                    </span>
                  </label>
                  <input
                    type="date"
                    value={form.payment_date}
                    onChange={handleChange("payment_date")}
                    className={inputClass("payment_date")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-xs font-semibold">
                      Payment Mode
                    </span>
                  </label>
                  <select
                    value={form.payment_mode}
                    onChange={handleChange("payment_mode")}
                    className="select select-bordered select-sm rounded-lg w-full capitalize"
                  >
                    {PAYMENT_MODES.map((p) => (
                      <option key={p} value={p} className="capitalize">
                        {p.charAt(0).toUpperCase() + p.slice(1)}
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
              </div>

              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">
                    Transaction Reference
                  </span>
                </label>
                <input
                  type="text"
                  value={form.transaction_reference}
                  onChange={handleChange("transaction_reference")}
                  className={inputClass("transaction_reference")}
                />
              </div>
            </>
          )}

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
              {isEdit ? "Save Payment" : "Add Installment"}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
