import React, { useState, useEffect, useMemo } from "react";
import { X, Loader2, Search, HandCoins } from "lucide-react";
import {
  calculateLoanDerivedFields,
  formatCurrency,
} from "../utils/loanCalculations.js";

const emptyForm = {
  customer_id: "",
  loan_plan_id: "",
  loan_amount: "",
  start_date: "",
  status: "active",
};

const STATUS_OPTIONS = ["active", "completed", "closed", "default"];

/**
 * CustomerLoanFormModal
 * Props:
 * - open (bool)
 * - initialData (object|null) : null/undefined = create, {...loan} = edit
 * - customers (array) : [{ id, first_name, last_name, customer_no, mobile }]
 * - plans (array)     : [{ id, plan_name, plan_code, commission_type, commission_value, tenure, tenure_type }]
 * - loading (bool)
 * - error (string|object|null)
 * - onClose (fn)
 * - onSubmit (fn)
 */
export default function CustomerLoanFormModal({
  open,
  initialData,
  customers = [],
  plans = [],
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const isEdit = Boolean(initialData?.id);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [customerQuery, setCustomerQuery] = useState("");
  const [showCustomerList, setShowCustomerList] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      setForm({
        customer_id: initialData.customer_id ?? "",
        loan_plan_id: initialData.loan_plan_id ?? "",
        loan_amount: initialData.loan_amount ?? "",
        start_date: initialData.start_date
          ? initialData.start_date.slice(0, 10)
          : "",
        status: initialData.status || "active",
      });
      const c = customers.find((c) => c.id === initialData.customer_id);
      setCustomerQuery(c ? `${c.first_name} ${c.last_name || ""}`.trim() : "");
    } else {
      setForm(emptyForm);
      setCustomerQuery("");
    }
    setFieldErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData, isEdit]);

  const selectedPlan = useMemo(
    () => plans.find((p) => String(p.id) === String(form.loan_plan_id)) || null,
    [plans, form.loan_plan_id],
  );

  const derived = useMemo(
    () =>
      calculateLoanDerivedFields({
        loanAmount: form.loan_amount,
        plan: selectedPlan,
        startDate: form.start_date,
      }),
    [form.loan_amount, selectedPlan, form.start_date],
  );

  const filteredCustomers = useMemo(() => {
    if (!customerQuery.trim()) return customers.slice(0, 8);
    const q = customerQuery.toLowerCase();
    return customers
      .filter(
        (c) =>
          `${c.first_name} ${c.last_name || ""}`.toLowerCase().includes(q) ||
          c.mobile?.includes(q) ||
          c.customer_no?.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [customers, customerQuery]);

  if (!open) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleSelectCustomer = (customer) => {
    setForm((prev) => ({ ...prev, customer_id: customer.id }));
    setCustomerQuery(
      `${customer.first_name} ${customer.last_name || ""}`.trim(),
    );
    setShowCustomerList(false);
    setFieldErrors((prev) => ({ ...prev, customer_id: null }));
  };

  const validate = () => {
    const errors = {};
    if (!form.customer_id) errors.customer_id = "Select a customer";
    if (!form.loan_plan_id) errors.loan_plan_id = "Select a loan plan";
    if (!form.loan_amount || Number(form.loan_amount) <= 0)
      errors.loan_amount = "Enter a valid loan amount";
    if (!form.start_date) errors.start_date = "Select a start date";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      customer_id: Number(form.customer_id),
      loan_plan_id: Number(form.loan_plan_id),
      loan_amount: Number(form.loan_amount),
      start_date: form.start_date,
      status: form.status,
      // Send calculated fields too — most backends still want these
      // persisted rather than recomputed, per your loans table schema.
    //   commission_amount: derived.commission_amount,
    //   net_disbursed_amount: derived.net_disbursed_amount,
    //   installment_amount: derived.installment_amount,
    //   total_repayment: derived.total_repayment,
    //   end_date: derived.end_date,
    };

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
      <div className="modal-box max-w-xl rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <HandCoins size={18} className="text-primary" />
            {isEdit ? "Edit Loan" : "New Loan"}
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
          {/* Customer search-select */}
          <div className="form-control relative">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">
                Customer *
              </span>
            </label>
            <label
              className={`input input-bordered input-sm flex items-center gap-2 rounded-lg ${fieldErrors.customer_id ? "input-error" : ""}`}
            >
              <Search size={14} className="text-base-content/40 shrink-0" />
              <input
                type="text"
                className="grow"
                placeholder="Search by name, mobile, or customer no…"
                value={customerQuery}
                onChange={(e) => {
                  setCustomerQuery(e.target.value);
                  setShowCustomerList(true);
                  setForm((prev) => ({ ...prev, customer_id: "" }));
                }}
                onFocus={() => setShowCustomerList(true)}
                disabled={isEdit}
              />
            </label>
            <FieldError field="customer_id" />

            {showCustomerList && !isEdit && (
              <ul className="absolute z-20 top-full mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-base-300 bg-base-100 shadow-dropdown py-1">
                {filteredCustomers.length === 0 ? (
                  <li className="px-3 py-2 text-xs text-base-content/40">
                    No matching customers
                  </li>
                ) : (
                  filteredCustomers.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectCustomer(c)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-base-200 flex items-center justify-between gap-2"
                      >
                        <span className="font-medium">
                          {c.first_name} {c.last_name}
                        </span>
                        <span className="text-base-content/40">{c.mobile}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          {/* Loan plan */}
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">
                Loan Plan *
              </span>
            </label>
            <select
              value={form.loan_plan_id}
              onChange={handleChange("loan_plan_id")}
              className={`select select-bordered select-sm rounded-lg w-full ${fieldErrors.loan_plan_id ? "select-error" : ""}`}
            >
              <option value="" disabled>
                Select loan plan
              </option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.plan_name} ({p.plan_code}) — {p.tenure} {p.tenure_type}
                </option>
              ))}
            </select>
            <FieldError field="loan_plan_id" />
          </div>

          {/* Amount + Start date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">
                  Loan Amount (₹) *
                </span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.loan_amount}
                onChange={handleChange("loan_amount")}
                className={inputClass("loan_amount")}
                placeholder="50000"
              />
              <FieldError field="loan_amount" />
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
          </div>

          {isEdit && (
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
          )}

          {/* Live-calculated summary */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Calculated Summary {!selectedPlan && "(select a plan)"}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <SummaryRow
                label="Commission"
                value={formatCurrency(derived.commission_amount)}
              />
              <SummaryRow
                label="Net Disbursed"
                value={formatCurrency(derived.net_disbursed_amount)}
              />
              <SummaryRow
                label="Installment"
                value={formatCurrency(derived.installment_amount)}
              />
              <SummaryRow
                label="Total Repayment"
                value={formatCurrency(derived.total_repayment)}
              />
              <SummaryRow
                label="Installments"
                value={
                  derived.installment_count
                    ? `${derived.installment_count}`
                    : "—"
                }
              />
              <SummaryRow
                label="End Date"
                value={
                  derived.end_date
                    ? new Date(derived.end_date).toLocaleDateString()
                    : "—"
                }
              />
            </div>
          </div>

          {/* Actions */}
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
              {isEdit ? "Save Changes" : "Create Loan"}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-base-content/50">{label}</span>
      <span className="font-bold text-base-content">{value}</span>
    </div>
  );
}
