import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Loader2,
  Percent,
  Search,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calendar,
  Clock,
} from "lucide-react";
import {
  calculateInterestOnlyLoan,
  formatCurrency,
  FREQUENCY_LABELS,
} from "../utils/interestOnlyLoanHelpers.js";

/**
 * InterestOnlyLoanFormModal
 * Modal to create or edit an interest-only loan based directly on the chosen plan.
 *
 * Props:
 * - open (bool)
 * - initialData (object|null) : null = create mode, object = edit mode
 * - customers (array) : [{ id, first_name, last_name, mobile, customer_no }]
 * - plans (array)      : [{ id, plan_name, plan_code, interest_type, interest_value,
 *                          interest_frequency, tenure, tenure_type, commission_type, commission_value }]
 * - loading (bool)
 * - error (string|object|null)
 * - onClose (fn)
 * - onSubmit (fn)
 */
export default function InterestOnlyLoanFormModal({
  open,
  initialData = null,
  customers = [],
  plans = [],
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const isEdit = Boolean(initialData?.id);
  const hasPayments =
    isEdit &&
    (Number(initialData?.total_interest_paid || 0) > 0 ||
      Number(initialData?.total_principal_paid || 0) > 0);

  const [form, setForm] = useState({
    customer_id: "",
    interest_plan_id: "",
    principal_amount: "",
    start_date: new Date().toISOString().slice(0, 10),
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [customerQuery, setCustomerQuery] = useState("");
  const [showCustomerList, setShowCustomerList] = useState(false);

  // Initialize or reset form state
  useEffect(() => {
    if (!open) return;

    if (isEdit && initialData) {
      setForm({
        customer_id: initialData.customer_id || "",
        interest_plan_id: initialData.interest_plan_id || "",
        principal_amount: initialData.principal_amount || "",
        start_date: initialData.start_date
          ? String(initialData.start_date).slice(0, 10)
          : new Date().toISOString().slice(0, 10),
      });

      const foundCustomer = customers.find(
        (c) => String(c.id) === String(initialData.customer_id),
      );
      if (foundCustomer) {
        setCustomerQuery(
          `${foundCustomer.first_name} ${foundCustomer.last_name || ""}`.trim(),
        );
      } else if (initialData.customer_name) {
        setCustomerQuery(initialData.customer_name);
      }
    } else {
      setForm({
        customer_id: "",
        interest_plan_id: "",
        principal_amount: "",
        start_date: new Date().toISOString().slice(0, 10),
      });
      setCustomerQuery("");
    }
    setFieldErrors({});
    setShowCustomerList(false);
  }, [open, isEdit, initialData, customers]);

  const selectedPlan = useMemo(
    () =>
      plans.find((p) => String(p.id) === String(form.interest_plan_id)) || null,
    [plans, form.interest_plan_id],
  );

  const derived = useMemo(() => {
    if (!selectedPlan) return null;
    return calculateInterestOnlyLoan({
      principal: form.principal_amount,
      interestType: selectedPlan.interest_type || "percentage",
      interestValue: selectedPlan.interest_value || 0,
      interestFrequency: selectedPlan.interest_frequency || "monthly",
      tenure: selectedPlan.tenure || 12,
      tenureType: selectedPlan.tenure_type || "months",
      commissionType: selectedPlan.commission_type,
      commissionValue: selectedPlan.commission_value || 0,
    });
  }, [selectedPlan, form.principal_amount]);

  const endDate = useMemo(() => {
    if (!form.start_date || !selectedPlan) return null;
    const d = new Date(form.start_date);
    const months =
      selectedPlan.tenure_type === "years"
        ? Number(selectedPlan.tenure || 1) * 12
        : Number(selectedPlan.tenure || 12);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0, 10);
  }, [form.start_date, selectedPlan]);

  if (!open) return null;

  const filteredCustomers = customerQuery.trim()
    ? customers.filter(
        (c) =>
          `${c.first_name} ${c.last_name || ""}`
            .toLowerCase()
            .includes(customerQuery.toLowerCase()) ||
          c.mobile?.includes(customerQuery) ||
          c.customer_no?.toLowerCase().includes(customerQuery.toLowerCase()),
      )
    : customers.slice(0, 8);

  const handleSelectCustomer = (c) => {
    setForm((prev) => ({ ...prev, customer_id: c.id }));
    setCustomerQuery(`${c.first_name} ${c.last_name || ""}`.trim());
    setShowCustomerList(false);
    setFieldErrors((prev) => ({ ...prev, customer_id: null }));
  };

  const handleSelectPlan = (planId) => {
    setForm((prev) => ({ ...prev, interest_plan_id: planId }));
    setFieldErrors((prev) => ({ ...prev, interest_plan_id: null }));
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errors = {};
    if (!form.customer_id) errors.customer_id = "Select a customer";
    if (!form.interest_plan_id)
      errors.interest_plan_id = "Select an interest plan";
    if (!form.principal_amount || Number(form.principal_amount) <= 0)
      errors.principal_amount = "Enter a valid principal amount";
    if (!form.start_date) errors.start_date = "Select a start date";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      customer_id: Number(form.customer_id),
      interest_plan_id: Number(form.interest_plan_id),
      principal_amount: Number(form.principal_amount),
      start_date: form.start_date,
    };

    if (isEdit && initialData?.id) {
      onSubmit({ id: initialData.id, ...payload });
    } else {
      onSubmit(payload);
    }
  };

  const inputClass = (field) =>
    `input input-bordered input-sm rounded-lg w-full ${
      fieldErrors[field] ? "input-error" : ""
    }`;
  const FieldError = ({ field }) =>
    fieldErrors[field] ? (
      <span className="text-[11px] text-error mt-1">{fieldErrors[field]}</span>
    ) : null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-xl rounded-2xl max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-3 border-b border-base-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Percent size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {isEdit ? "Edit Interest-Only Loan" : "New Interest-Only Loan"}
              </h3>
              <p className="text-[11px] text-base-content/50">
                {isEdit
                  ? `Loan #${initialData?.loan_no || initialData?.id}`
                  : "Issue an interest-only periodic loan with automated installments"}
              </p>
            </div>
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
          <div className="alert alert-error text-xs py-2.5 mb-3 flex items-center gap-2">
            <span>
              {typeof error === "string"
                ? error
                : error?.message || error?.error || "Something went wrong."}
            </span>
          </div>
        )}

        {hasPayments && (
          <div className="alert alert-warning text-xs py-2 mb-3 flex items-start gap-2">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Payments have been recorded.</span> Loan terms cannot be altered to preserve transaction records.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Customer search-select */}
          <div className="form-control relative">
            <label className="label pb-1 pt-0">
              <span className="label-text text-xs font-semibold">
                Customer *
              </span>
            </label>
            <label
              className={`input input-bordered input-sm flex items-center gap-2 rounded-lg ${
                fieldErrors.customer_id ? "input-error" : ""
              } ${hasPayments ? "bg-base-200 opacity-80 cursor-not-allowed" : ""}`}
            >
              <Search size={14} className="text-base-content/40 shrink-0" />
              <input
                type="text"
                disabled={hasPayments}
                className="grow text-xs"
                placeholder="Search customer by name, mobile, customer #…"
                value={customerQuery}
                onChange={(e) => {
                  setCustomerQuery(e.target.value);
                  setForm((prev) => ({ ...prev, customer_id: "" }));
                  setShowCustomerList(true);
                }}
                onFocus={() => {
                  if (!hasPayments) setShowCustomerList(true);
                }}
              />
            </label>
            <FieldError field="customer_id" />
            {showCustomerList && !hasPayments && (
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
                          {c.first_name} {c.last_name || ""}
                        </span>
                        <span className="text-base-content/40 font-mono text-[11px]">
                          {c.mobile}
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          {/* Interest Plan selection */}
          <div className="form-control">
            <label className="label pb-1 pt-0">
              <span className="label-text text-xs font-semibold">
                Interest Plan *
              </span>
            </label>
            <select
              value={form.interest_plan_id}
              disabled={hasPayments}
              onChange={(e) => handleSelectPlan(e.target.value)}
              className={`select select-bordered select-sm rounded-lg w-full text-xs ${
                fieldErrors.interest_plan_id ? "select-error" : ""
              } ${hasPayments ? "bg-base-200 cursor-not-allowed" : ""}`}
            >
              <option value="" disabled>
                Select interest plan
              </option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.plan_name} ({p.plan_code}) — {p.interest_value}%{" "}
                  {FREQUENCY_LABELS[p.interest_frequency] || p.interest_frequency} ·{" "}
                  {p.tenure} {p.tenure_type}
                </option>
              ))}
            </select>
            <FieldError field="interest_plan_id" />
          </div>

          {/* Selected Plan Details Breakdown */}
          {selectedPlan && (
            <div className="rounded-xl border border-base-300 bg-base-200/50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/60 flex items-center gap-1.5">
                  <Clock size={13} className="text-primary" /> Plan Terms & Structure
                </span>
                <span className="badge badge-primary badge-outline badge-xs font-mono font-medium">
                  {selectedPlan.plan_code}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-base-100 p-2 rounded-lg border border-base-200">
                  <span className="text-[10px] text-base-content/50 block font-medium">Interest Rate</span>
                  <span className="font-bold text-base-content">
                    {selectedPlan.interest_value}%{" "}
                    <span className="text-[10px] font-normal text-base-content/60">
                      ({selectedPlan.interest_type === "fixed" ? "Flat" : "%/cycle"})
                    </span>
                  </span>
                </div>

                <div className="bg-base-100 p-2 rounded-lg border border-base-200">
                  <span className="text-[10px] text-base-content/50 block font-medium">Frequency</span>
                  <span className="font-bold text-base-content">
                    {FREQUENCY_LABELS[selectedPlan.interest_frequency] || selectedPlan.interest_frequency}
                  </span>
                </div>

                <div className="bg-base-100 p-2 rounded-lg border border-base-200">
                  <span className="text-[10px] text-base-content/50 block font-medium">Tenure</span>
                  <span className="font-bold text-base-content">
                    {selectedPlan.tenure} {selectedPlan.tenure_type}
                  </span>
                </div>

                <div className="bg-base-100 p-2 rounded-lg border border-base-200">
                  <span className="text-[10px] text-base-content/50 block font-medium">Commission</span>
                  <span className="font-bold text-base-content">
                    {Number(selectedPlan.commission_value || 0) > 0
                      ? `${selectedPlan.commission_value}${selectedPlan.commission_type === "percentage" ? "%" : " ₹"}`
                      : "0.00"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Principal Amount & Start Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label pb-1 pt-0">
                <span className="label-text text-xs font-semibold">
                  Principal Amount (₹) *
                </span>
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                disabled={hasPayments}
                value={form.principal_amount}
                onChange={handleChange("principal_amount")}
                className={`${inputClass("principal_amount")} text-xs ${
                  hasPayments ? "bg-base-200 cursor-not-allowed" : ""
                }`}
                placeholder="e.g. 1,00,000"
              />
              <FieldError field="principal_amount" />
            </div>
            <div className="form-control">
              <label className="label pb-1 pt-0">
                <span className="label-text text-xs font-semibold">
                  Start Date *
                </span>
              </label>
              <input
                type="date"
                disabled={hasPayments}
                value={form.start_date}
                onChange={handleChange("start_date")}
                className={`${inputClass("start_date")} text-xs ${
                  hasPayments ? "bg-base-200 cursor-not-allowed" : ""
                }`}
              />
              <FieldError field="start_date" />
            </div>
          </div>

          {/* Live calculated summary */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                <CheckCircle2 size={13} />
                Calculated Summary {!selectedPlan && "(select a plan)"}
              </span>
              {derived && derived.numberOfPeriods > 0 && (
                <span className="badge badge-primary badge-sm font-semibold">
                  {derived.numberOfPeriods} {derived.numberOfPeriods === 1 ? "Due" : "Dues"}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <SummaryRow
                label="Interest / Period"
                value={
                  derived && Number(form.principal_amount) > 0
                    ? formatCurrency(derived.interestPerPeriod)
                    : "—"
                }
              />
              <SummaryRow
                label="Installment Count"
                value={
                  derived
                    ? `${derived.numberOfPeriods} ${
                        derived.numberOfPeriods === 1 ? "due" : "dues"
                      }`
                    : "—"
                }
              />
              <SummaryRow
                label="Total Interest"
                value={
                  derived && Number(form.principal_amount) > 0
                    ? formatCurrency(derived.totalInterest)
                    : "—"
                }
              />
              <SummaryRow
                label="Principal at Maturity"
                value={
                  Number(form.principal_amount) > 0
                    ? formatCurrency(form.principal_amount)
                    : "—"
                }
              />
              <SummaryRow
                label="Total Payable"
                value={
                  derived && Number(form.principal_amount) > 0
                    ? formatCurrency(derived.totalPayable)
                    : "—"
                }
              />
              <SummaryRow
                label="Net Disbursed"
                value={
                  derived && Number(form.principal_amount) > 0
                    ? formatCurrency(derived.netDisbursed)
                    : "—"
                }
              />
              <SummaryRow
                label="Maturity Date"
                value={endDate ? new Date(endDate).toLocaleDateString() : "—"}
              />
            </div>

            {derived && (
              <div className="pt-1.5 border-t border-primary/15 text-[11px] text-primary/80 font-medium leading-relaxed">
                {Number(form.principal_amount) > 0 ? (
                  derived.numberOfPeriods > 1 ? (
                    <span>
                      ✓ Will generate {derived.numberOfPeriods} installments:{" "}
                      <strong>{derived.numberOfPeriods - 1}</strong> periodic interest dues of{" "}
                      <strong>{formatCurrency(derived.interestPerPeriod)}</strong> +{" "}
                      <strong>1</strong> final principal return of{" "}
                      <strong>{formatCurrency(form.principal_amount)}</strong>.
                    </span>
                  ) : (
                    <span>
                      ✓ Will generate <strong>1 single bullet installment</strong> at maturity for{" "}
                      {formatCurrency(derived.totalPayable)}.
                    </span>
                  )
                ) : (
                  <span className="text-base-content/50 flex items-center gap-1">
                    <Info size={12} />
                    Enter the principal amount above to see calculated periodic dues and total payable.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="modal-action mt-4 pt-2 border-t border-base-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm rounded-lg"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-sm rounded-lg gap-1.5"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Update Loan" : "Create Loan & Schedule"}
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
      <span className="font-semibold text-base-content">{value}</span>
    </div>
  );
}
