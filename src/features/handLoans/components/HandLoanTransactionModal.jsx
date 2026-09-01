import React, { useState, useEffect } from "react";
import { X, Loader2, Receipt } from "lucide-react";
import {
  getTransactionTypesForDirection,
  formatCurrency,
} from "../utils/handLoanHelpers.js";

const PAYMENT_MODES = ["cash", "bank", "upi", "cheque", "other"];

/**
 * HandLoanTransactionModal
 * Props:
 * - open (bool)
 * - loan (object) : the parent hand loan (for direction + outstanding display)
 * - banks (array)  : [{ id, bank_name, account_number }] optional, for payment_mode = bank
 * - loading (bool)
 * - error (string|object|null)
 * - onClose (fn)
 * - onSubmit (fn) : called with { id: loan.id, formData }
 */
export default function HandLoanTransactionModal({
  open,
  loan,
  banks = [],
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const txnTypes = loan
    ? getTransactionTypesForDirection(loan.loan_direction)
    : [];

  const [form, setForm] = useState({
    transaction_type: txnTypes[0]?.value || "collection",
    amount: "",
    transaction_date: new Date().toISOString().slice(0, 16),
    payment_mode: "cash",
    company_bank_id: "",
    transaction_reference: "",
    cheque_number: "",
    description: "",
    remarks: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (open && loan) {
      const types = getTransactionTypesForDirection(loan.loan_direction);
      setForm({
        transaction_type: types[0]?.value || (loan.loan_direction === "borrowed" ? "repayment" : "collection"),
        amount: "",
        transaction_date: new Date().toISOString().slice(0, 16),
        payment_mode: "cash",
        company_bank_id: "",
        transaction_reference: "",
        cheque_number: "",
        description: "",
        remarks: "",
      });
      setFieldErrors({});
    }
  }, [open, loan]);

  if (!open || !loan) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errors = {};
    if (!form.amount || Number(form.amount) <= 0) {
      errors.amount = "Enter a valid amount";
    } else if (Number(form.amount) > Number(loan.outstanding_amount)) {
      errors.amount = `Amount cannot exceed outstanding balance (${formatCurrency(loan.outstanding_amount)})`;
    }
    if (!form.transaction_date) {
      errors.transaction_date = "Select date and time";
    }
    if (form.payment_mode === "cheque" && !form.cheque_number.trim()) {
      errors.cheque_number = "Cheque number is required";
    }
    if (form.payment_mode === "bank" && !form.company_bank_id) {
      errors.company_bank_id = "Select a bank account";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      id: loan.id,
      formData: {
        transaction_type: form.transaction_type,
        amount: Number(form.amount),
        transaction_date: form.transaction_date.replace("T", " ") + ":00",
        payment_mode: form.payment_mode,
        company_bank_id: form.company_bank_id || null,
        transaction_reference: form.transaction_reference.trim() || null,
        cheque_number: form.cheque_number.trim() || null,
        description: form.description.trim() || null,
        remarks: form.remarks.trim() || null,
      },
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
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Receipt size={18} className="text-primary" />
            Record Transaction
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
          {loan.person_name} · {loan.hand_loan_no} · Outstanding{" "}
          <span className="font-semibold text-error">
            {formatCurrency(loan.outstanding_amount)}
          </span>
        </p>

        {error && (
          <div className="alert alert-error text-sm py-2 mb-4">
            <span>
              {typeof error === "string" ? error : "Something went wrong."}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-2">
            {txnTypes.map((t) => (
              <div
                key={t.value}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${
                  t.moneyDirection === "in"
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-warning/30 bg-warning/10 text-warning"
                }`}
              >
                <span>Transaction Type:</span>
                <span className="badge badge-sm badge-outline border-0 font-bold uppercase">
                  {t.label}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">
                  Amount (₹) *
                </span>
              </label>
              <input
                type="number"
                min="0.01"
                max={loan.outstanding_amount}
                step="0.01"
                value={form.amount}
                onChange={handleChange("amount")}
                className={inputClass("amount")}
                placeholder={loan.outstanding_amount ? String(loan.outstanding_amount) : "0"}
              />
              <FieldError field="amount" />
            </div>
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">
                  Date & Time *
                </span>
              </label>
              <input
                type="datetime-local"
                value={form.transaction_date}
                onChange={handleChange("transaction_date")}
                className={inputClass("transaction_date")}
              />
              <FieldError field="transaction_date" />
            </div>
          </div>

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

          {form.payment_mode === "bank" && (
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">
                  Bank Account *
                </span>
              </label>
              <select
                value={form.company_bank_id}
                onChange={handleChange("company_bank_id")}
                className={`select select-bordered select-sm rounded-lg w-full ${fieldErrors.company_bank_id ? "select-error" : ""}`}
              >
                <option value="" disabled>
                  Select bank account
                </option>
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bank_name} •••• {b.account_number?.slice(-4)}
                  </option>
                ))}
              </select>
              <FieldError field="company_bank_id" />
            </div>
          )}

          {form.payment_mode === "cheque" && (
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">
                  Cheque Number *
                </span>
              </label>
              <input
                type="text"
                value={form.cheque_number}
                onChange={handleChange("cheque_number")}
                className={inputClass("cheque_number")}
              />
              <FieldError field="cheque_number" />
            </div>
          )}

          {(form.payment_mode === "upi" || form.payment_mode === "bank") && (
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">
                  Transaction Ref.
                </span>
              </label>
              <input
                type="text"
                value={form.transaction_reference}
                onChange={handleChange("transaction_reference")}
                className={inputClass("transaction_reference")}
                placeholder="UTR / UPI Ref"
              />
            </div>
          )}

          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">
                Description
              </span>
            </label>
            <input
              type="text"
              value={form.description}
              onChange={handleChange("description")}
              className={inputClass("description")}
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
              Record Transaction
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
