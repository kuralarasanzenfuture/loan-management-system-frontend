import React, { useState, useEffect } from "react";
import { X, Loader2, Wallet2, Sparkles } from "lucide-react";

/**
 * RecordChitPaymentModal
 * Dedicated "Pay" UI — separate from ChitPaymentFormModal (which only
 * edits the schedule: installment_no/due_date/due_amount). This modal is
 * the only place paid_amount, bit_benefit_amount, payment_mode, and
 * transaction_reference get set, matching personal_chit_payments' real
 * columns.
 *
 * IMPORTANT: submits CUMULATIVE totals (already-paid + this payment),
 * not just this payment's delta — matching the same "PATCH replaces the
 * field" pattern your other edit thunks use (editPayment, editRole, etc.),
 * rather than assuming the backend does incremental math server-side.
 * If your API actually wants deltas instead of totals, swap
 * newTotalPaid/newTotalBenefit for effectivePaidAmount/bidBenefitNow in
 * handleSubmit's payload below.
 *
 * Props:
 * - open (bool)
 * - payment (object) : the installment row — id, installment_no, due_date,
 *                       due_amount, paid_amount, bit_benefit_amount, status
 * - loading (bool)
 * - error (string|null)
 * - onClose (fn)
 * - onSubmit (fn)    : called with the full updated payment payload
 */

const PAYMENT_MODE_LABELS = {
  cash: "Cash",
  bank: "Bank Transfer",
  upi: "UPI",
  cheque: "Cheque",
  other: "Other",
};

export default function RecordChitPaymentModal({
  open,
  payment,
  loading = false,
  error = null,
  onClose,
  onSubmit,
}) {
  const alreadyPaid = Number(payment?.paid_amount || 0);
  const alreadyBenefit = Number(payment?.bit_benefit_amount || 0);
  const dueAmount = Number(payment?.due_amount || 0);
  const remainingBefore = Math.max(0, dueAmount - alreadyPaid - alreadyBenefit);

  const [amountMode, setAmountMode] = useState("full"); // "full" | "partial"
  const [form, setForm] = useState({
    payment_date: new Date().toISOString().slice(0, 10),
    bit_benefit_amount: "",
    paid_amount: "",
    payment_mode: "cash",
    transaction_reference: "",
    remarks: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setAmountMode("full");
    setForm({
      payment_date: new Date().toISOString().slice(0, 10),
      bit_benefit_amount: "",
      paid_amount: "",
      payment_mode: "cash",
      transaction_reference: "",
      remarks: "",
    });
    setErrors({});
  }, [open, payment]);

  if (!open || !payment) return null;

  const bidBenefitNow = Number(form.bit_benefit_amount) || 0;
  const remainingAfterBenefit = Math.max(0, remainingBefore - bidBenefitNow);

  // Full mode auto-fills to whatever's left once this cycle's bid benefit is applied.
  const effectivePaidAmount =
    amountMode === "full"
      ? remainingAfterBenefit
      : Number(form.paid_amount) || 0;

  const newPendingAmount = Math.max(
    0,
    remainingAfterBenefit - effectivePaidAmount,
  );
  const newTotalPaid = alreadyPaid + effectivePaidAmount;
  const newTotalBenefit = alreadyBenefit + bidBenefitNow;
  const projectedStatus =
    newPendingAmount <= 0.01
      ? "paid"
      : newTotalPaid + newTotalBenefit > 0
        ? "partial"
        : "pending";

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.payment_date) errs.payment_date = "Select a payment date.";
    if (
      amountMode === "partial" &&
      (!form.paid_amount || Number(form.paid_amount) <= 0)
    )
      errs.paid_amount = "Enter a valid amount.";
    if (effectivePaidAmount > remainingAfterBenefit + 0.01)
      errs.paid_amount =
        "Amount exceeds what's remaining after the bid benefit.";
    if (effectivePaidAmount <= 0 && bidBenefitNow <= 0)
      errs.paid_amount = "Enter a payment amount or a bid benefit.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    onSubmit({
      id: payment.id,
      payment_date: form.payment_date,
      paid_amount: newTotalPaid,
      bit_benefit_amount: newTotalBenefit,
      pending_amount: newPendingAmount,
      status: projectedStatus,
      payment_mode: form.payment_mode,
      transaction_reference: form.transaction_reference.trim() || null,
      remarks: form.remarks.trim() || null,
    });
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg rounded-2xl">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Wallet2 size={18} className="text-primary" />
            Record Payment
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
        <p className="text-xs text-base-content/50 mb-4">
          Installment #{payment.installment_no} · Due{" "}
          {payment.due_date?.slice(0, 10)}
        </p>

        {/* Reference strip */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="rounded-xl border border-base-300 px-3 py-2 text-center">
            <div className="text-[10px] text-base-content/40">Due Amount</div>
            <div className="text-sm font-semibold">
              ₹{dueAmount.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="rounded-xl border border-base-300 px-3 py-2 text-center">
            <div className="text-[10px] text-base-content/40">Already Paid</div>
            <div className="text-sm font-semibold text-success">
              ₹{alreadyPaid.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="rounded-xl border border-base-300 px-3 py-2 text-center">
            <div className="text-[10px] text-base-content/40">Remaining</div>
            <div className="text-sm font-semibold text-error">
              ₹{remainingBefore.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error text-sm py-2 mb-4">
            <span>
              {typeof error === "string" ? error : "Something went wrong."}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bid benefit */}
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold flex items-center gap-1.5">
                <Sparkles size={12} className="text-primary" />
                Bid Benefit / Dividend Applied (₹)
              </span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.bit_benefit_amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, bit_benefit_amount: e.target.value }))
              }
              className="input input-bordered input-sm rounded-lg w-full"
              placeholder="0"
            />
            <span className="text-[11px] text-base-content/40 mt-1">
              Chit auction dividend that reduces this installment's remaining
              due, if any.
            </span>
          </div>

          {/* Amount mode toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAmountMode("full")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                amountMode === "full"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-base-300 text-base-content/50 hover:bg-base-200"
              }`}
            >
              Full Amount
            </button>
            <button
              type="button"
              onClick={() => setAmountMode("partial")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                amountMode === "partial"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-base-300 text-base-content/50 hover:bg-base-200"
              }`}
            >
              Partial Amount
            </button>
          </div>

          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">
                Payment Amount (₹) *
              </span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={
                amountMode === "full" ? remainingAfterBenefit : form.paid_amount
              }
              onChange={(e) =>
                setForm((f) => ({ ...f, paid_amount: e.target.value }))
              }
              disabled={amountMode === "full"}
              className={`input input-bordered input-sm rounded-lg w-full ${errors.paid_amount ? "input-error" : ""} ${
                amountMode === "full" ? "opacity-70" : ""
              }`}
            />
            {errors.paid_amount && (
              <span className="text-[11px] text-error mt-1">
                {errors.paid_amount}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">
                  Payment Date *
                </span>
              </label>
              <input
                type="date"
                value={form.payment_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, payment_date: e.target.value }))
                }
                className={`input input-bordered input-sm rounded-lg w-full ${errors.payment_date ? "input-error" : ""}`}
              />
              {errors.payment_date && (
                <span className="text-[11px] text-error mt-1">
                  {errors.payment_date}
                </span>
              )}
            </div>
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">
                  Payment Mode
                </span>
              </label>
              <select
                value={form.payment_mode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, payment_mode: e.target.value }))
                }
                className="select select-bordered select-sm rounded-lg w-full"
              >
                {Object.entries(PAYMENT_MODE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {form.payment_mode !== "cash" && (
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">
                  Transaction Reference
                </span>
              </label>
              <input
                type="text"
                value={form.transaction_reference}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    transaction_reference: e.target.value,
                  }))
                }
                className="input input-bordered input-sm rounded-lg w-full"
                placeholder="UTR / Cheque no. / UPI ref"
              />
            </div>
          )}

          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">Remarks</span>
            </label>
            <textarea
              rows={2}
              value={form.remarks}
              onChange={(e) =>
                setForm((f) => ({ ...f, remarks: e.target.value }))
              }
              className="textarea textarea-bordered textarea-sm rounded-lg w-full"
            />
          </div>

          {/* Live preview */}
          <div className="rounded-xl bg-base-200/50 border border-base-300 px-4 py-3 flex items-center justify-between">
            <div className="text-xs text-base-content/50">
              New pending:{" "}
              <span className="font-semibold text-base-content">
                ₹{newPendingAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <span
              className={`badge badge-sm ${
                projectedStatus === "paid"
                  ? "badge-success"
                  : projectedStatus === "partial"
                    ? "badge-warning"
                    : "badge-ghost"
              }`}
            >
              {projectedStatus}
            </span>
          </div>

          <div className="modal-action mt-4">
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
