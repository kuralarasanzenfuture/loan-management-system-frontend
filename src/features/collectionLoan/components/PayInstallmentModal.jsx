import React, { useState, useEffect } from "react";
import { X, Loader2, IndianRupee, AlertTriangle, ShieldAlert } from "lucide-react";
import {
  PAYMENT_MODES,
  formatCurrency,
  formatDate,
} from "../utils/collectionHelpers.js";

/**
 * PayInstallmentModal
 * Supports recording payment for both regular and overdue installments,
 * including principal EMI and calculated penalty amount breakdown.
 */
export default function PayInstallmentModal({
  open,
  installment,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const principal = installment ? Number(installment.principal_amount || 0) : 0;
  const penalty = installment
    ? Number(installment.penalty_amount || installment.calculated_penalty_amount || 0)
    : 0;
  const paid = installment ? Number(installment.paid_amount || 0) : 0;

  // Calculate full total due and effective balance
  const computedTotalDue = Number(
    (installment?.total_due != null && Number(installment.total_due) >= principal + penalty)
      ? Number(installment.total_due)
      : (principal + penalty)
  );

  const rawBalance = installment ? Number(installment.balance_amount || 0) : 0;
  const balance = Number(
    Math.max(
      rawBalance,
      computedTotalDue - paid
    ).toFixed(2)
  );

  const remainingPrincipal = Math.max(0, principal - paid);

  const [form, setForm] = useState({
    paid_amount: "",
    paid_date: new Date().toISOString().slice(0, 10),
    payment_mode: "cash",
    transaction_reference: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

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
  }, [open, installment, balance]);

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
    if (!form.paid_amount || amt <= 0) {
      errors.paid_amount = "Enter a valid amount";
    } else if (amt > balance + 0.01) {
      errors.paid_amount = `Cannot exceed total payable balance of ${formatCurrency(balance)}`;
    }
    if (!form.paid_date) errors.paid_date = "Select a payment date";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      id: installment.id,
      penaltyAmount: penalty,
      formData: {
        payment_amount: Number(form.paid_amount),
        paid_amount: Number(form.paid_amount),
        penalty_amount: penalty > 0 ? penalty : undefined,
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
      <div className="modal-box max-w-md rounded-2xl">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <IndianRupee size={18} className="text-primary" />
            Pay Installment #{installment.installment_no}
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

        <p className="text-xs text-base-content/50 mb-3">
          Due Date: {formatDate(installment.due_date) || "—"}
          {installment.days_overdue != null && Number(installment.days_overdue) > 0 && (
            <span className="text-error font-semibold ml-2">
              ({installment.days_overdue} days overdue)
            </span>
          )}
        </p>

        {/* Overdue & Penalty Breakdown Box */}
        {penalty > 0 ? (
          <div className="rounded-xl border border-error/20 bg-error/5 p-3.5 mb-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-error">
              <ShieldAlert size={14} /> Overdue Payment Breakdown
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-error/10">
              <div>
                <span className="text-base-content/60">EMI Principal:</span>
                <span className="font-bold ml-1 text-base-content">
                  {formatCurrency(principal)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-error font-medium">Late Penalty:</span>
                <span className="font-bold ml-1 text-error">
                  +{formatCurrency(penalty)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-error/10 text-xs font-bold">
              <span>Total Payable (EMI + Penalty):</span>
              <span className="text-sm text-primary">{formatCurrency(balance)}</span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-base-200/50 px-4 py-3 mb-4 flex items-center justify-between">
            <span className="text-xs text-base-content/50 font-medium">
              Outstanding Balance
            </span>
            <span className="text-lg font-bold text-base-content">
              {formatCurrency(balance)}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">
                Amount to Collect / Pay (₹) *
              </span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.paid_amount}
              onChange={handleChange("paid_amount")}
              className={`input input-bordered input-sm rounded-lg w-full font-semibold ${fieldErrors.paid_amount ? "input-error" : ""}`}
              placeholder="0.00"
            />
            {fieldErrors.paid_amount && (
              <span className="text-[11px] text-error mt-1">
                {fieldErrors.paid_amount}
              </span>
            )}

            {/* Quick Amount Selection Buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => setQuickAmount(balance)}
                className="btn btn-neutral btn-xs rounded-lg font-medium"
              >
                {penalty > 0 ? "Full (EMI + Penalty)" : "Full Balance"} ({formatCurrency(balance)})
              </button>

              {penalty > 0 && remainingPrincipal > 0 && (
                <button
                  type="button"
                  onClick={() => setQuickAmount(remainingPrincipal)}
                  className="btn btn-outline btn-xs rounded-lg"
                  title="Pay only the principal EMI"
                >
                  Only EMI ({formatCurrency(remainingPrincipal)})
                </button>
              )}

              {penalty > 0 && (
                <button
                  type="button"
                  onClick={() => setQuickAmount(penalty)}
                  className="btn btn-outline btn-xs rounded-lg text-error"
                  title="Pay only penalty"
                >
                  Only Penalty ({formatCurrency(penalty)})
                </button>
              )}

              <button
                type="button"
                onClick={() => setQuickAmount(Number((balance / 2).toFixed(2)))}
                className="btn btn-ghost btn-xs rounded-lg"
              >
                Half ({formatCurrency((balance / 2).toFixed(2))})
              </button>
            </div>

            {willBePartial && Number(form.paid_amount) > 0 && (
              <p className="text-[11px] text-warning mt-2">
                Leaves {formatCurrency(resultingBalance)} balance — marked as "partial".
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
                placeholder="UTR / UPI Ref"
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
