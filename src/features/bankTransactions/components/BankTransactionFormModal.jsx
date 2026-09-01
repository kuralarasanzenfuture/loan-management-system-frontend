import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { X, Loader2, Receipt, ArrowDownLeft, ArrowUpRight, Landmark } from "lucide-react";
import { REFERENCE_TYPE_LABELS, PAYMENT_METHOD_LABELS } from "../utils/transactionHelpers.js";
import { fetchCompanyBanks } from "../../../redux/companyBanks/companyBankSlice.js";

const emptyForm = {
  company_bank_id: "",
  transaction_date: new Date().toISOString().slice(0, 16),
  transaction_type: "credit",
  amount: "",
  reference_type: "income",
  reference_id: "",
  payment_method: "bank_transfer",
  transaction_reference: "",
  cheque_number: "",
  description: "",
  remarks: "",
};

/**
 * BankTransactionFormModal
 * Props:
 * - open (bool)
 * - bankId (number|null)  : company_bank_id — if provided, locked; otherwise selectable
 * - bankLabel (string)    : e.g. "HDFC Bank •••• 6789" for display
 * - loading (bool)
 * - error (string|object|null)
 * - onClose (fn)
 * - onSubmit (fn)
 */
export default function BankTransactionFormModal({ open, bankId, bankLabel, loading, error, onClose, onSubmit }) {
  const dispatch = useDispatch();
  const { companyBanks = [], banks: legacyBanks = [] } = useSelector(
    (state) => state.companyBanks || {}
  );
  const banks = companyBanks.length > 0 ? companyBanks : legacyBanks;

  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (!banks || banks.length === 0) {
        dispatch(fetchCompanyBanks());
      }
      setForm({
        ...emptyForm,
        company_bank_id: bankId || (banks[0]?.id ? String(banks[0].id) : ""),
        transaction_date: new Date().toISOString().slice(0, 16),
      });
      setFieldErrors({});
    }
  }, [open, bankId, dispatch, banks]);

  if (!open) return null;

  const targetBankId = bankId || form.company_bank_id;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errors = {};
    if (!targetBankId) errors.company_bank_id = "Please select a bank account";
    if (!form.transaction_date) errors.transaction_date = "Select a date and time";
    if (!form.amount || Number(form.amount) <= 0) errors.amount = "Enter a valid amount";
    if (!form.reference_type) errors.reference_type = "Select a reference type";
    if (form.payment_method === "cheque" && !form.cheque_number?.trim())
      errors.cheque_number = "Cheque number is required for cheque payments";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      company_bank_id: Number(targetBankId),
      transaction_date: form.transaction_date.replace("T", " ") + ":00",
      transaction_type: form.transaction_type,
      amount: Number(form.amount),
      reference_type: form.reference_type,
      reference_id: form.reference_id ? Number(form.reference_id) : null,
      payment_method: form.payment_method || null,
      transaction_reference: form.transaction_reference.trim() || null,
      cheque_number: form.cheque_number.trim() || null,
      description: form.description.trim() || null,
      remarks: form.remarks.trim() || null,
    };

    onSubmit(payload);
  };

  const inputClass = (field) =>
    `input input-bordered input-sm rounded-lg w-full ${fieldErrors[field] ? "input-error" : ""}`;
  const FieldError = ({ field }) =>
    fieldErrors[field] ? <span className="text-[11px] text-error mt-1">{fieldErrors[field]}</span> : null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg rounded-2xl">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Receipt size={18} className="text-primary" />
            New Transaction
          </h3>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm btn-square" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Bank account selection/context */}
        {bankId ? (
          <div className="flex items-center gap-2 mb-4 mt-1">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary shrink-0">
              <Landmark size={13} />
            </span>
            <p className="text-xs text-base-content/60 font-medium">{bankLabel || `Bank Account #${bankId}`}</p>
          </div>
        ) : (
          <div className="form-control mb-3 mt-1">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">Select Bank Account *</span>
            </label>
            <select
              value={form.company_bank_id}
              onChange={handleChange("company_bank_id")}
              className={`select select-bordered select-sm rounded-lg w-full ${fieldErrors.company_bank_id ? "select-error" : ""}`}
            >
              <option value="" disabled>Choose bank account…</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bank_name} {b.account_number ? `(•••• ${b.account_number.slice(-4)})` : ""}
                </option>
              ))}
            </select>
            <FieldError field="company_bank_id" />
          </div>
        )}

        {error && (
          <div className="alert alert-error text-sm py-2 mb-4">
            <span>{typeof error === "string" ? error : "Something went wrong."}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction type toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, transaction_type: "credit" }))}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                form.transaction_type === "credit"
                  ? "border-success bg-success/10 text-success"
                  : "border-base-300 text-base-content/50 hover:bg-base-200"
              }`}
            >
              <ArrowDownLeft size={16} />
              Credit (Money In)
            </button>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, transaction_type: "debit" }))}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                form.transaction_type === "debit"
                  ? "border-error bg-error/10 text-error"
                  : "border-base-300 text-base-content/50 hover:bg-base-200"
              }`}
            >
              <ArrowUpRight size={16} />
              Debit (Money Out)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label pb-1"><span className="label-text text-xs font-semibold">Amount (₹) *</span></label>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={handleChange("amount")} className={inputClass("amount")} placeholder="50000" />
              <FieldError field="amount" />
            </div>
            <div className="form-control">
              <label className="label pb-1"><span className="label-text text-xs font-semibold">Date & Time *</span></label>
              <input type="datetime-local" value={form.transaction_date} onChange={handleChange("transaction_date")} className={inputClass("transaction_date")} />
              <FieldError field="transaction_date" />
            </div>
          </div>

          <div className="form-control">
            <label className="label pb-1"><span className="label-text text-xs font-semibold">Reference Type *</span></label>
            <select value={form.reference_type} onChange={handleChange("reference_type")} className="select select-bordered select-sm rounded-lg w-full">
              {Object.entries(REFERENCE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label pb-1"><span className="label-text text-xs font-semibold">Payment Method</span></label>
              <select value={form.payment_method} onChange={handleChange("payment_method")} className="select select-bordered select-sm rounded-lg w-full">
                {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            {form.payment_method === "cheque" ? (
              <div className="form-control">
                <label className="label pb-1"><span className="label-text text-xs font-semibold">Cheque Number *</span></label>
                <input type="text" value={form.cheque_number} onChange={handleChange("cheque_number")} className={inputClass("cheque_number")} />
                <FieldError field="cheque_number" />
              </div>
            ) : (
              <div className="form-control">
                <label className="label pb-1"><span className="label-text text-xs font-semibold">Transaction Ref. (UTR/UPI)</span></label>
                <input type="text" value={form.transaction_reference} onChange={handleChange("transaction_reference")} className={inputClass("transaction_reference")} placeholder="UTR123456789" />
              </div>
            )}
          </div>

          <div className="form-control">
            <label className="label pb-1"><span className="label-text text-xs font-semibold">Description</span></label>
            <input type="text" value={form.description} onChange={handleChange("description")} className={inputClass("description")} placeholder="Business income received" />
          </div>

          <div className="form-control">
            <label className="label pb-1"><span className="label-text text-xs font-semibold">Remarks</span></label>
            <textarea value={form.remarks} onChange={handleChange("remarks")} rows={2} className="textarea textarea-bordered textarea-sm rounded-lg w-full" />
          </div>

          <div className="modal-action mt-6">
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm rounded-lg">Cancel</button>
            <button type="submit" disabled={loading || !bankId} className="btn btn-primary btn-sm rounded-lg gap-1.5">
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