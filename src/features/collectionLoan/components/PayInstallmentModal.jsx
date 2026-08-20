import React, { useState, useEffect } from "react";
import { X, Loader2, IndianRupee } from "lucide-react";
import {
  PAYMENT_MODES,
  formatCurrency,
  formatDate,
} from "../utils/collectionHelpers.js";

/**
 * PayInstallmentModal
 * A dedicated payment-recording flow — NOT the edit form. Only ever
 * submits payment fields (paid_amount, paid_date, payment_mode, reference),
 * never touches due_date/principal_amount/penalty schedule fields.
 *
 * Props:
 * - open (bool)
 * - installment (object|null)
 * - loading (bool)
 * - error (string|object|null)
 * - onClose (fn)
 * - onSubmit (fn) : called with { id, formData }
 */
export default function PayInstallmentModal({
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
    payment_mode: "cash",
    transaction_reference: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const balance = installment ? Number(installment.balance_amount) : 0;

  useEffect(() => {
    if (open && installment) {
      setForm({
        paid_amount: balance > 0 ? balance : "",
        paid_date: new Date().toISOString().slice(0, 10),
        payment_mode: "cash",
        transaction_reference: "",
      });
      setFieldErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, installment]);

  if (!open || !installment) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  const setQuickAmount = (val) =>
    setForm((prev) => ({ ...prev, paid_amount: val }));

  const validate = () => {
    const errors = {};
    const amt = Number(form.paid_amount);
    if (!form.paid_amount || amt <= 0)
      errors.paid_amount = "Enter a valid amount";
    else if (amt > balance)
      errors.paid_amount = `Cannot exceed outstanding balance of ${formatCurrency(balance)}`;
    if (!form.paid_date) errors.paid_date = "Select a payment date";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      id: installment.id,
      formData: {
        payment_amount: Number(form.paid_amount),
        paid_amount: Number(form.paid_amount),
        paid_date: form.paid_date,
        payment_mode: form.payment_mode,
        transaction_reference: form.transaction_reference.trim() || null,
      },
    });
  };

  const resultingBalance = Math.max(balance - Number(form.paid_amount || 0), 0);
  const willBePartial = resultingBalance > 0.009;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm rounded-2xl">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <IndianRupee size={18} className="text-primary" />
            Pay Installment
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
        <p className="text-xs text-base-content/40 mb-4">
          Installment #{installment.installment_no} · Due{" "}
          {formatDate(installment.due_date)}
        </p>

        <div className="rounded-xl bg-base-200/50 px-4 py-3 mb-4 flex items-center justify-between">
          <span className="text-xs text-base-content/50 font-medium">
            Outstanding Balance
          </span>
          <span className="text-lg font-bold text-base-content">
            {formatCurrency(balance)}
          </span>
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
            <div className="flex gap-1.5 mt-1.5">
              <button
                type="button"
                onClick={() => setQuickAmount(balance)}
                className="btn btn-ghost btn-xs rounded-lg"
              >
                Full ({formatCurrency(balance)})
              </button>
              <button
                type="button"
                onClick={() => setQuickAmount((balance / 2).toFixed(2))}
                className="btn btn-ghost btn-xs rounded-lg"
              >
                Half
              </button>
            </div>
            {willBePartial && Number(form.paid_amount) > 0 && (
              <p className="text-[11px] text-warning mt-1.5">
                This leaves {formatCurrency(resultingBalance)} outstanding —
                installment will be marked "partial".
              </p>
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
                  Payment Mode
                </span>
              </label>
              <select
                value={form.payment_mode}
                onChange={handleChange("payment_mode")}
                className="select select-bordered select-sm rounded-lg w-full capitalize"
              >
                {PAYMENT_MODES.map((m) => (
                  <option key={m} value={m} className="capitalize">
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">
                  Reference
                </span>
              </label>
              <input
                type="text"
                value={form.transaction_reference}
                onChange={handleChange("transaction_reference")}
                className="input input-bordered input-sm rounded-lg w-full"
                placeholder="UTR/UPI"
              />
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
              Record Payment
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
