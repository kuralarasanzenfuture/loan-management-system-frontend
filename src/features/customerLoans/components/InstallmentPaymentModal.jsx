import React, { useState, useEffect } from "react";
import { X, Loader2, Receipt } from "lucide-react";
import { formatCurrency } from "../utils/loanCalculations.js";

const STATUS_OPTIONS = ["pending", "paid", "partial", "overdue"];

/**
 * InstallmentPaymentModal
 * Props:
 * - open (bool)
 * - installment (object|null)
 * - loading (bool)
 * - error (string|object|null)
 * - onClose (fn)
 * - onSubmit (fn) : called with { paid_amount, paid_date, status, penalty_amount }
 */
export default function InstallmentPaymentModal({
  open,
  installment,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState({
    paid_amount: "",
    paid_date: new Date().toISOString().slice(0, 10),
    status: "paid",
    penalty_amount: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (open && installment) {
      // total_due is the canonical DB column; fall back to principal_amount
      const due =
        Number(installment.total_due ?? installment.principal_amount ?? 0);
      const outstanding = due - Number(installment.paid_amount || 0);
      setForm({
        paid_amount: outstanding > 0 ? outstanding : "",
        paid_date: new Date().toISOString().slice(0, 10),
        status: "paid",
        penalty_amount: installment.penalty_amount || "",
      });
      setFieldErrors({});
    }
  }, [open, installment]);

  if (!open || !installment) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errors = {};
    if (!form.paid_amount || Number(form.paid_amount) <= 0)
      errors.paid_amount = "Enter a valid amount";
    if (!form.paid_date) errors.paid_date = "Select a payment date";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      paid_amount: Number(form.paid_amount),
      paid_date: form.paid_date,
      status: form.status,
      penalty_amount: form.penalty_amount ? Number(form.penalty_amount) : 0,
    });
  };

  const due =
    Number(installment.total_due ?? installment.principal_amount ?? 0);
  const outstanding = due - Number(installment.paid_amount || 0);

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Receipt size={16} className="text-primary" />
            Record Payment
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs bg-base-200/50 rounded-lg px-3 py-2 mb-4">
          <span className="text-base-content/50">
            Installment #{installment.installment_no} · Due{" "}
            {new Date(installment.due_date).toLocaleDateString()}
          </span>
          <span className="font-semibold text-base-content">
            {formatCurrency(outstanding)} due
          </span>
        </div>

        {error && (
          <div className="alert alert-error text-xs py-2 mb-3">
            <span>
              {typeof error === "string" ? error : "Something went wrong."}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">
                Amount Paid (₹) *
              </span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.paid_amount}
              onChange={handleChange("paid_amount")}
              className={`input input-bordered input-sm rounded-lg w-full ${fieldErrors.paid_amount ? "input-error" : ""}`}
            />
            {fieldErrors.paid_amount && (
              <span className="text-[11px] text-error mt-1">
                {fieldErrors.paid_amount}
              </span>
            )}
          </div>

          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">
                Payment Date *
              </span>
            </label>
            <input
              type="date"
              value={form.paid_date}
              onChange={handleChange("paid_date")}
              className={`input input-bordered input-sm rounded-lg w-full ${fieldErrors.paid_date ? "input-error" : ""}`}
            />
            {fieldErrors.paid_date && (
              <span className="text-[11px] text-error mt-1">
                {fieldErrors.paid_date}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">
                  Penalty (₹)
                </span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.penalty_amount}
                onChange={handleChange("penalty_amount")}
                className="input input-bordered input-sm rounded-lg w-full"
                placeholder="0"
              />
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
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-action mt-5">
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
              Save Payment
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
