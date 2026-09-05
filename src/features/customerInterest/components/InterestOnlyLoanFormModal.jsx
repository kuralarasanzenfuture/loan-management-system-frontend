import React, { useState, useMemo } from "react";
import { X, Loader2, Percent, Search, Calendar, Clock, Sliders } from "lucide-react";
import {
  calculateInterestOnlyLoan,
  formatCurrency,
  FREQUENCY_LABELS,
} from "../utils/interestOnlyLoanHelpers.js";

/**
 * InterestOnlyLoanFormModal
 * Modal to create an interest-only loan with transparent installment schedule generation.
 *
 * Props:
 * - open (bool)
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
  customers = [],
  plans = [],
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState({
    customer_id: "",
    interest_plan_id: "",
    principal_amount: "",
    start_date: new Date().toISOString().slice(0, 10),
    interest_frequency: "monthly",
    tenure: 12,
    tenure_type: "months",
    interest_rate: "",
    interest_type: "percentage",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [customerQuery, setCustomerQuery] = useState("");
  const [showCustomerList, setShowCustomerList] = useState(false);

  const selectedPlan = useMemo(
    () =>
      plans.find((p) => String(p.id) === String(form.interest_plan_id)) || null,
    [plans, form.interest_plan_id],
  );

  const derived = useMemo(() => {
    if (!selectedPlan) return null;
    return calculateInterestOnlyLoan({
      principal: form.principal_amount,
      interestType: form.interest_type || selectedPlan.interest_type,
      interestValue: form.interest_rate !== "" ? form.interest_rate : selectedPlan.interest_value,
      interestFrequency: form.interest_frequency || selectedPlan.interest_frequency || "monthly",
      tenure: form.tenure || selectedPlan.tenure || 12,
      tenureType: form.tenure_type || selectedPlan.tenure_type || "months",
      commissionType: selectedPlan.commission_type,
      commissionValue: selectedPlan.commission_value,
    });
  }, [
    selectedPlan,
    form.principal_amount,
    form.interest_frequency,
    form.tenure,
    form.tenure_type,
    form.interest_rate,
    form.interest_type,
  ]);

  const endDate = useMemo(() => {
    if (!form.start_date) return null;
    const d = new Date(form.start_date);
    const months =
      form.tenure_type === "years"
        ? Number(form.tenure || 1) * 12
        : Number(form.tenure || 12);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0, 10);
  }, [form.start_date, form.tenure, form.tenure_type]);

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
    const p = plans.find((item) => String(item.id) === String(planId));
    if (p) {
      setForm((prev) => ({
        ...prev,
        interest_plan_id: planId,
        interest_frequency: p.interest_frequency || "monthly",
        tenure: p.tenure || 12,
        tenure_type: p.tenure_type || "months",
        interest_rate: p.interest_value || "",
        interest_type: p.interest_type || "percentage",
      }));
    } else {
      setForm((prev) => ({ ...prev, interest_plan_id: planId }));
    }
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
    if (!form.tenure || Number(form.tenure) <= 0)
      errors.tenure = "Enter a valid tenure";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      customer_id: Number(form.customer_id),
      interest_plan_id: Number(form.interest_plan_id),
      principal_amount: Number(form.principal_amount),
      start_date: form.start_date,
      interest_rate: Number(
        form.interest_rate !== "" ? form.interest_rate : selectedPlan?.interest_value || 0,
      ),
      interest_type: form.interest_type || selectedPlan?.interest_type || "percentage",
      interest_frequency: form.interest_frequency || selectedPlan?.interest_frequency || "monthly",
      tenure: Number(form.tenure || selectedPlan?.tenure || 12),
      tenure_type: form.tenure_type || selectedPlan?.tenure_type || "months",
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
      <div className="modal-box max-w-xl rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Percent size={18} className="text-primary" />
            New Interest-Only Loan
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
              {typeof error === "string"
                ? error
                : error?.message || error?.error || "Something went wrong."}
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
                placeholder="Search by name, mobile, customer #…"
                value={customerQuery}
                onChange={(e) => {
                  setCustomerQuery(e.target.value);
                  setForm((prev) => ({ ...prev, customer_id: "" }));
                  setShowCustomerList(true);
                }}
                onFocus={() => setShowCustomerList(true)}
              />
            </label>
            <FieldError field="customer_id" />
            {showCustomerList && (
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

          {/* Plan */}
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">
                Interest Plan *
              </span>
            </label>
            <select
              value={form.interest_plan_id}
              onChange={(e) => handleSelectPlan(e.target.value)}
              className={`select select-bordered select-sm rounded-lg w-full ${fieldErrors.interest_plan_id ? "select-error" : ""}`}
            >
              <option value="" disabled>
                Select interest plan
              </option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.plan_name} ({p.plan_code}) — {p.interest_value}% {FREQUENCY_LABELS[p.interest_frequency] || p.interest_frequency} · {p.tenure} {p.tenure_type}
                </option>
              ))}
            </select>
            <FieldError field="interest_plan_id" />
          </div>

          {/* Principal + Start date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">
                  Principal Amount (₹) *
                </span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.principal_amount}
                onChange={handleChange("principal_amount")}
                className={inputClass("principal_amount")}
                placeholder="100000"
              />
              <FieldError field="principal_amount" />
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

          {/* Schedule Configuration Options */}
          {selectedPlan && (
            <div className="p-3 bg-base-200/50 rounded-xl border border-base-300 space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-base-content/60 flex items-center gap-1.5">
                <Sliders size={12} /> Installment Schedule Settings
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Frequency */}
                <div className="form-control">
                  <label className="label pb-0.5 pt-0">
                    <span className="label-text text-[11px] font-medium">
                      Collection Frequency
                    </span>
                  </label>
                  <select
                    value={form.interest_frequency}
                    onChange={handleChange("interest_frequency")}
                    className="select select-bordered select-xs rounded-lg w-full text-xs"
                  >
                    <option value="monthly">Monthly (Recommended)</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="half_yearly">Half-Yearly</option>
                    <option value="yearly">Yearly / Bullet</option>
                  </select>
                </div>

                {/* Tenure */}
                <div className="form-control">
                  <label className="label pb-0.5 pt-0">
                    <span className="label-text text-[11px] font-medium">
                      Tenure
                    </span>
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      value={form.tenure}
                      onChange={handleChange("tenure")}
                      className="input input-bordered input-xs rounded-lg w-16 text-xs"
                    />
                    <select
                      value={form.tenure_type}
                      onChange={handleChange("tenure_type")}
                      className="select select-bordered select-xs rounded-lg grow text-xs"
                    >
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                </div>

                {/* Interest Rate */}
                <div className="form-control">
                  <label className="label pb-0.5 pt-0">
                    <span className="label-text text-[11px] font-medium">
                      Rate (% / period)
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.interest_rate}
                    onChange={handleChange("interest_rate")}
                    className="input input-bordered input-xs rounded-lg text-xs"
                    placeholder={selectedPlan.interest_value}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Live calculated summary */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Calculated Summary {!selectedPlan && "(select a plan)"}
              </p>
              {derived && derived.numberOfPeriods > 0 && (
                <span className="badge badge-primary badge-sm font-semibold">
                  {derived.numberOfPeriods} Installments
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <SummaryRow
                label="Interest / Period"
                value={
                  derived ? formatCurrency(derived.interestPerPeriod) : "—"
                }
              />
              <SummaryRow
                label="Installment Count"
                value={derived ? `${derived.numberOfPeriods} dues` : "—"}
              />
              <SummaryRow
                label="Total Interest"
                value={derived ? formatCurrency(derived.totalInterest) : "—"}
              />
              <SummaryRow
                label="Principal at Maturity"
                value={form.principal_amount ? formatCurrency(form.principal_amount) : "—"}
              />
              <SummaryRow
                label="Total Payable"
                value={derived ? formatCurrency(derived.totalPayable) : "—"}
              />
              <SummaryRow
                label="Net Disbursed"
                value={derived ? formatCurrency(derived.netDisbursed) : "—"}
              />
              <SummaryRow
                label="Maturity Date"
                value={endDate ? new Date(endDate).toLocaleDateString() : "—"}
              />
            </div>

            {derived && derived.numberOfPeriods > 0 && (
              <p className="text-[11px] text-primary/80 font-medium pt-1 border-t border-primary/10">
                {derived.numberOfPeriods > 1
                  ? `✓ Will generate ${derived.numberOfPeriods} installments: ${derived.numberOfPeriods - 1} periodic interest dues of ${formatCurrency(derived.interestPerPeriod)} + 1 final principal return.`
                  : `✓ Will generate 1 single lump-sum installment at maturity.`}
              </p>
            )}
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
              Create Loan & Schedule
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
