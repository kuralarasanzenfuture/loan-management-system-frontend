import React, { useState, useEffect } from "react";
import {
  X,
  Loader2,
  HandCoins,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
} from "lucide-react";

const PAYMENT_MODES = ["cash", "bank", "upi", "cheque", "other"];

const emptyForm = {
  loan_direction: "given",
  customer_id: "",
  person_name: "",
  mobile: "",
  address: "",
  amount: "",
  given_date: new Date().toISOString().slice(0, 10),
  expected_return_date: "",
  payment_mode: "cash",
  purpose: "",
  remarks: "",
};

/**
 * HandLoanFormModal
 * Handles both create and edit:
 * - Create: POST /hand-loans
 * - Edit:   PUT /hand-loans/:id
 */
export default function HandLoanFormModal({
  open,
  initialData,
  customers = [],
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
        loan_direction: initialData.loan_direction || "given",
        customer_id: initialData.customer_id ?? "",
        person_name: initialData.person_name || "",
        mobile: initialData.mobile || "",
        address: initialData.address || "",
        amount: initialData.amount ?? "",
        given_date: initialData.given_date
          ? initialData.given_date.slice(0, 10)
          : "",
        expected_return_date: initialData.expected_return_date
          ? initialData.expected_return_date.slice(0, 10)
          : "",
        payment_mode: initialData.payment_mode || "cash",
        purpose: initialData.purpose || "",
        remarks: initialData.remarks || "",
      });
      setCustomerQuery(initialData.person_name || "");
    } else {
      setForm(emptyForm);
      setCustomerQuery("");
    }
    setFieldErrors({});
    setShowCustomerList(false);
  }, [open, initialData, isEdit]);

  if (!open) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  const filteredCustomers = customerQuery.trim()
    ? customers.filter(
        (c) =>
          `${c.first_name} ${c.last_name || ""}`
            .toLowerCase()
            .includes(customerQuery.toLowerCase()) ||
          c.mobile?.includes(customerQuery),
      )
    : customers.slice(0, 8);

  const handleSelectCustomer = (c) => {
    setForm((prev) => ({
      ...prev,
      customer_id: c.id,
      person_name: `${c.first_name} ${c.last_name || ""}`.trim(),
      mobile: c.mobile || prev.mobile,
      address: c.address || prev.address,
    }));
    setCustomerQuery(`${c.first_name} ${c.last_name || ""}`.trim());
    setShowCustomerList(false);
  };

  const validate = () => {
    const errors = {};
    if (!form.person_name.trim())
      errors.person_name = "Person name is required";
    if (!form.amount || Number(form.amount) <= 0)
      errors.amount = "Enter a valid amount";
    if (!form.given_date) errors.given_date = "Select the given date";
    if (
      form.expected_return_date &&
      form.given_date &&
      new Date(form.expected_return_date) < new Date(form.given_date)
    )
      errors.expected_return_date =
        "Return date cannot be before the given date";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      loan_direction: form.loan_direction,
      customer_id: form.customer_id ? Number(form.customer_id) : null,
      person_name: form.person_name.trim(),
      mobile: form.mobile.trim() || null,
      address: form.address.trim() || null,
      amount: Number(form.amount),
      given_date: form.given_date,
      expected_return_date: form.expected_return_date || null,
      payment_mode: form.payment_mode,
      purpose: form.purpose.trim() || null,
      remarks: form.remarks.trim() || null,
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
            {isEdit ? "Edit Hand Loan" : "New Hand Loan"}
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

        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[65vh] overflow-y-auto pr-1"
        >
          {/* Direction toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isEdit}
              onClick={() =>
                setForm((p) => ({ ...p, loan_direction: "given" }))
              }
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                form.loan_direction === "given"
                  ? "border-info bg-info/10 text-info"
                  : "border-base-300 text-base-content/50 hover:bg-base-200"
              }`}
            >
              <ArrowUpRight size={16} />
              Given (You Lent)
            </button>
            <button
              type="button"
              disabled={isEdit}
              onClick={() =>
                setForm((p) => ({ ...p, loan_direction: "borrowed" }))
              }
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                form.loan_direction === "borrowed"
                  ? "border-warning bg-warning/10 text-warning"
                  : "border-base-300 text-base-content/50 hover:bg-base-200"
              }`}
            >
              <ArrowDownLeft size={16} />
              Borrowed (You Owe)
            </button>
          </div>
          {isEdit && (
            <p className="text-[10px] text-base-content/40 -mt-2">
              Loan direction cannot be changed after creation.
            </p>
          )}

          {/* Person */}
          <div className="form-control relative">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">
                Person Name *
              </span>
            </label>
            <label
              className={`input input-bordered input-sm flex items-center gap-2 rounded-lg ${fieldErrors.person_name ? "input-error" : ""}`}
            >
              <Search size={14} className="text-base-content/40 shrink-0" />
              <input
                type="text"
                className="grow"
                placeholder="Search customer or type a name…"
                value={customerQuery}
                onChange={(e) => {
                  setCustomerQuery(e.target.value);
                  setForm((p) => ({
                    ...p,
                    person_name: e.target.value,
                    customer_id: "",
                  }));
                  setShowCustomerList(true);
                }}
                onFocus={() => setShowCustomerList(true)}
              />
            </label>
            <FieldError field="person_name" />
            {showCustomerList && customers.length > 0 && (
              <ul className="absolute z-20 top-full mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-base-300 bg-base-100 shadow-dropdown py-1">
                {filteredCustomers.length === 0 ? (
                  <li className="px-3 py-2 text-xs text-base-content/40">
                    No matching customers — will save as a manual person
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

          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">Mobile</span>
              </label>
              <input
                type="tel"
                value={form.mobile}
                onChange={handleChange("mobile")}
                className={inputClass("mobile")}
                placeholder="e.g. 9876543210"
              />
            </div>
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">
                  Amount (₹) *
                </span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={handleChange("amount")}
                className={inputClass("amount")}
                placeholder="50000"
              />
              <FieldError field="amount" />
            </div>
          </div>

          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">Address</span>
            </label>
            <input
              type="text"
              value={form.address}
              onChange={handleChange("address")}
              className={inputClass("address")}
              placeholder="City / Address"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">
                  Given Date *
                </span>
              </label>
              <input
                type="date"
                value={form.given_date}
                onChange={handleChange("given_date")}
                className={inputClass("given_date")}
              />
              <FieldError field="given_date" />
            </div>
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">
                  Expected Return Date
                </span>
              </label>
              <input
                type="date"
                value={form.expected_return_date}
                onChange={handleChange("expected_return_date")}
                className={inputClass("expected_return_date")}
              />
              <FieldError field="expected_return_date" />
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

          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">Purpose</span>
            </label>
            <input
              type="text"
              value={form.purpose}
              onChange={handleChange("purpose")}
              className={inputClass("purpose")}
              placeholder="e.g. Personal emergency"
            />
          </div>

          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">Remarks</span>
            </label>
            <textarea
              value={form.remarks}
              onChange={handleChange("remarks")}
              rows={2}
              className="textarea textarea-bordered textarea-sm rounded-lg w-full"
              placeholder="Any additional notes…"
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
              {isEdit ? "Save Changes" : "Create Hand Loan"}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
