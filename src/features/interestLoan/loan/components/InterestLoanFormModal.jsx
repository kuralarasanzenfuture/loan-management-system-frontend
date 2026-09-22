import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  PlusCircle,
  Calendar,
  DollarSign,
  User,
  Layers,
  Calculator,
  Info,
  Search,
  Check,
  FileEdit,
  Lock,
} from "lucide-react";
import { fetchActiveInterestPlans } from "../../../../redux/interestLoan/plan/interestPlanSlice.js";
import { fetchCustomers } from "../../../../redux/customers/customerSlice.js";
import {
  addInterestLoan,
  editInterestLoan,
} from "../../../../redux/interestLoan/loan/interestLoanSlice.js";
import {
  formatCurrency,
  formatRate,
  FREQUENCY_CONFIG,
} from "../utils/interestLoanHelpers.js";

const InterestLoanFormModal = ({
  isOpen,
  initialData = null,
  lockedCustomer = false,
  onClose,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const isEdit = Boolean(initialData?.id);

  const { activePlans = [] } = useSelector(
    (state) => state.interestPlans || {},
  );
  const customersState = useSelector((state) => state.customers?.customers || []);
  const { saving } = useSelector((state) => state.interestLoans || {});

  // Check if payments have been made on the loan
  const hasPayments =
    isEdit &&
    (Number(initialData?.total_principal_paid || 0) > 0 ||
      Number(initialData?.total_interest_paid || 0) > 0);

  // Normalize customer list whether array or nested in data
  const customerList = useMemo(() => {
    if (Array.isArray(customersState)) return customersState;
    if (Array.isArray(customersState?.customers)) return customersState.customers;
    if (Array.isArray(customersState?.data)) return customersState.data;
    return [];
  }, [customersState]);

  // Form State
  const [formData, setFormData] = useState({
    customer_id: "",
    interest_plan_id: "",
    principal_amount: "",
    start_date: new Date().toISOString().split("T")[0],
    remarks: "",
  });

  // Customer search & dropdown state
  const [customerQuery, setCustomerQuery] = useState("");
  const [showCustomerList, setShowCustomerList] = useState(false);
  const customerDropdownRef = useRef(null);

  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(event.target)
      ) {
        setShowCustomerList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load Customers & Active Plans on Modal Open / populate on edit
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchActiveInterestPlans());
      dispatch(fetchCustomers({ status: "active", limit: 1000 }));

      if (initialData) {
        setFormData({
          customer_id: initialData.customer_id || "",
          interest_plan_id: initialData.interest_plan_id || "",
          principal_amount:
            initialData.principal_amount != null && initialData.principal_amount !== ""
              ? parseFloat(initialData.principal_amount)
              : "",
          start_date: initialData.start_date
            ? initialData.start_date.split("T")[0]
            : new Date().toISOString().split("T")[0],
          remarks: initialData.remarks || "",
        });
      } else {
        setFormData({
          customer_id: "",
          interest_plan_id: "",
          principal_amount: "",
          start_date: new Date().toISOString().split("T")[0],
          remarks: "",
        });
      }

      setCustomerQuery("");
      setShowCustomerList(false);
      setFormErrors({});
      setSubmitError(null);
    }
  }, [isOpen, initialData, dispatch]);

  if (!isOpen) return null;

  // Selected customer object (lookup in customerList or fallback to initialData fields)
  const selectedCustomer =
    customerList.find((c) => String(c.id) === String(formData.customer_id)) ||
    (initialData
      ? {
          id: initialData.customer_id || initialData.id,
          first_name:
            initialData.first_name ||
            (initialData.customer_name ? initialData.customer_name.split(" ")[0] : "Customer"),
          last_name:
            initialData.last_name ||
            (initialData.customer_name ? initialData.customer_name.split(" ").slice(1).join(" ") : ""),
          customer_no: initialData.customer_no,
          mobile: initialData.customer_mobile || initialData.mobile,
        }
      : null);

  // Filtered customer list for search
  const filteredCustomers = customerQuery.trim()
    ? customerList.filter((c) => {
        const fullName = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
        const mobile = (c.mobile || "").toLowerCase();
        const customerNo = (c.customer_no || "").toLowerCase();
        const query = customerQuery.toLowerCase();
        return (
          fullName.includes(query) ||
          mobile.includes(query) ||
          customerNo.includes(query)
        );
      })
    : customerList.slice(0, 10);

  const handleSelectCustomer = (customer) => {
    setFormData((prev) => ({ ...prev, customer_id: customer.id }));
    setCustomerQuery("");
    setShowCustomerList(false);
    setFormErrors((prev) => ({ ...prev, customer_id: null }));
  };

  const handleClearCustomer = () => {
    setFormData((prev) => ({ ...prev, customer_id: "" }));
    setCustomerQuery("");
    setShowCustomerList(true);
  };

  // Find selected plan
  const selectedPlan = activePlans.find(
    (p) => String(p.id) === String(formData.interest_plan_id),
  );

  // Dynamic Calculation
  const principalNum = parseFloat(formData.principal_amount) || 0;
  let estimatedInterest = 0;
  if (selectedPlan && principalNum > 0) {
    const rateVal = parseFloat(selectedPlan.interest_value) || 0;
    if (selectedPlan.interest_type === "percentage") {
      estimatedInterest = (principalNum * rateVal) / 100;
    } else {
      estimatedInterest = rateVal;
    }
  }

  // Validation
  const validate = () => {
    const errors = {};
    if (!formData.customer_id) errors.customer_id = "Please select a customer";
    if (!formData.interest_plan_id)
      errors.interest_plan_id = "Please select an interest loan plan";
    if (!formData.principal_amount || principalNum <= 0)
      errors.principal_amount = "Principal amount must be greater than 0";
    if (!formData.start_date) errors.start_date = "Start date is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (isEdit) {
        const updatePayload = {
          remarks: formData.remarks?.trim() || null,
        };

        if (!hasPayments) {
          updatePayload.principal_amount = principalNum;
          updatePayload.interest_plan_id = parseInt(formData.interest_plan_id, 10);
          updatePayload.start_date = formData.start_date;
        }

        await dispatch(
          editInterestLoan({
            id: initialData.id,
            formData: updatePayload,
          }),
        ).unwrap();
      } else {
        await dispatch(
          addInterestLoan({
            customer_id: parseInt(formData.customer_id, 10),
            interest_plan_id: parseInt(formData.interest_plan_id, 10),
            principal_amount: principalNum,
            start_date: formData.start_date,
            remarks: formData.remarks?.trim() || null,
          }),
        ).unwrap();
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setSubmitError(err || `Failed to ${isEdit ? "update" : "create"} interest loan`);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-xl rounded-2xl border border-base-300 bg-base-100 p-0 overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-base-200 flex items-center justify-between bg-base-200/40">
          <div>
            <h2 className="text-base font-bold text-base-content flex items-center gap-2">
              {isEdit ? (
                <>
                  <FileEdit size={18} className="text-primary" />
                  Edit Loan {initialData?.loan_no}
                </>
              ) : (
                <>
                  <PlusCircle size={18} className="text-primary" />
                  Disburse Anytime Interest Loan
                </>
              )}
            </h2>
            <p className="text-xs text-base-content/50 mt-0.5">
              {isEdit
                ? "Modify loan terms or administrative notes"
                : "Open a new flexible interest-based lending account"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-xs btn-square text-base-content/60"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {submitError && (
            <div className="alert alert-error text-xs py-2 rounded-xl">
              <Info size={14} className="shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {hasPayments && (
            <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 text-warning-content text-xs flex items-start gap-2.5">
              <Lock size={15} className="text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-base-content">Financial Terms Locked</p>
                <p className="text-base-content/70 mt-0.5 leading-relaxed">
                  Payments have already been collected for this loan. Principal amount, plan, and start date are locked to protect financial accounting records. Only remarks can be updated.
                </p>
              </div>
            </div>
          )}

          {/* Customer Search & Picker */}
          <div className="form-control relative">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold flex items-center gap-1.5 text-base-content">
                <User size={13} className="text-primary" />
                Customer {isEdit || lockedCustomer ? "(Locked)" : "*"}
              </span>
            </label>

            {formData.customer_id && selectedCustomer ? (
              /* Selected Customer Card */
              <div className="flex items-center justify-between p-3 rounded-xl border border-base-300 bg-base-200/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center uppercase shrink-0">
                    {`${selectedCustomer.first_name?.[0] || ""}${selectedCustomer.last_name?.[0] || ""}`.toUpperCase() || "C"}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-base-content truncate">
                      {selectedCustomer.first_name} {selectedCustomer.last_name || ""}
                    </div>
                    <div className="text-[11px] text-base-content/50 flex items-center gap-2 font-mono">
                      {selectedCustomer.customer_no && (
                        <span>{selectedCustomer.customer_no}</span>
                      )}
                      {selectedCustomer.mobile && (
                        <span>• {selectedCustomer.mobile}</span>
                      )}
                    </div>
                  </div>
                </div>

                {!isEdit && !lockedCustomer && (
                  <button
                    type="button"
                    onClick={handleClearCustomer}
                    className="btn btn-ghost btn-xs text-primary font-semibold hover:bg-primary/10"
                  >
                    Change
                  </button>
                )}
                {(isEdit || lockedCustomer) && (
                  <span className="badge badge-sm badge-ghost gap-1 text-[11px] text-base-content/60">
                    <Lock size={11} /> Locked
                  </span>
                )}
              </div>
            ) : (
              /* Search Input with Dropdown */
              <div ref={customerDropdownRef} className="relative">
                <label
                  className={`input input-bordered input-sm flex items-center gap-2 rounded-xl bg-base-100 border-base-300 text-base-content ${
                    formErrors.customer_id ? "input-error" : ""
                  }`}
                >
                  <Search size={14} className="text-base-content/40 shrink-0" />
                  <input
                    type="text"
                    className="grow text-xs placeholder:text-base-content/40"
                    placeholder="Search customer by name, mobile, customer #…"
                    value={customerQuery}
                    onChange={(e) => {
                      setCustomerQuery(e.target.value);
                      setShowCustomerList(true);
                    }}
                    onFocus={() => setShowCustomerList(true)}
                  />
                </label>

                {showCustomerList && (
                  <ul className="absolute z-30 top-full mt-1.5 w-full max-h-56 overflow-y-auto rounded-xl border border-base-300 bg-base-100 shadow-2xl py-1 divide-y divide-base-200/60">
                    {filteredCustomers.length === 0 ? (
                      <li className="px-3 py-3 text-xs text-base-content/40 text-center">
                        No matching customers found
                      </li>
                    ) : (
                      filteredCustomers.map((c) => {
                        const fullName = `${c.first_name || ""} ${c.last_name || ""}`.trim();
                        const initials =
                          `${c.first_name?.[0] || ""}${c.last_name?.[0] || ""}`.toUpperCase() ||
                          "C";

                        return (
                          <li key={c.id}>
                            <button
                              type="button"
                              onClick={() => handleSelectCustomer(c)}
                              className="w-full text-left px-3.5 py-2.5 hover:bg-base-200/70 flex items-center justify-between gap-2.5 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 uppercase">
                                  {initials}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-xs text-base-content truncate">
                                    {fullName}
                                  </div>
                                  <div className="text-[10px] text-base-content/50 font-mono">
                                    {c.customer_no} {c.mobile ? `• ${c.mobile}` : ""}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] text-primary font-semibold shrink-0">
                                Select
                              </span>
                            </button>
                          </li>
                        );
                      })
                    )}
                  </ul>
                )}
              </div>
            )}

            {formErrors.customer_id && (
              <span className="text-[11px] text-error mt-1">
                {formErrors.customer_id}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Plan Selector */}
            <div className="form-control md:col-span-2">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold flex items-center gap-1.5 text-base-content">
                  <Layers size={13} className="text-primary" />
                  Interest Plan *
                </span>
              </label>
              <select
                value={formData.interest_plan_id}
                disabled={hasPayments}
                onChange={(e) => {
                  setFormData({ ...formData, interest_plan_id: e.target.value });
                  setFormErrors({ ...formErrors, interest_plan_id: null });
                }}
                className={`select select-bordered select-sm w-full rounded-xl bg-base-100 border-base-300 text-base-content text-xs ${
                  formErrors.interest_plan_id ? "select-error" : ""
                } ${hasPayments ? "opacity-60 cursor-not-allowed bg-base-200" : ""}`}
              >
                <option value="">-- Choose Interest Scheme --</option>
                {activePlans &&
                  activePlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.plan_name} (
                      {p.interest_type === "percentage"
                        ? `${parseFloat(p.interest_value)}%`
                        : `₹${parseFloat(p.interest_value)}`}{" "}
                      / {p.interest_frequency}) - {p.principal_basis?.replace("_", " ")}
                    </option>
                  ))}
              </select>
              {formErrors.interest_plan_id && (
                <span className="text-[11px] text-error mt-1">
                  {formErrors.interest_plan_id}
                </span>
              )}
            </div>

            {/* Principal Amount */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold flex items-center gap-1.5 text-base-content">
                  <DollarSign size={13} className="text-primary" />
                  Principal Amount (₹) *
                </span>
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                disabled={hasPayments}
                placeholder="e.g. 100000"
                value={formData.principal_amount}
                onChange={(e) => {
                  setFormData({ ...formData, principal_amount: e.target.value });
                  setFormErrors({ ...formErrors, principal_amount: null });
                }}
                className={`input input-bordered input-sm w-full rounded-xl bg-base-100 border-base-300 text-base-content text-xs ${
                  formErrors.principal_amount ? "input-error" : ""
                } ${hasPayments ? "opacity-60 cursor-not-allowed bg-base-200" : ""}`}
              />
              {formErrors.principal_amount && (
                <span className="text-[11px] text-error mt-1">
                  {formErrors.principal_amount}
                </span>
              )}
            </div>

            {/* Start Date */}
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold flex items-center gap-1.5 text-base-content">
                  <Calendar size={13} className="text-primary" />
                  Loan Start Date *
                </span>
              </label>
              <input
                type="date"
                disabled={hasPayments}
                value={formData.start_date}
                onChange={(e) => {
                  setFormData({ ...formData, start_date: e.target.value });
                  setFormErrors({ ...formErrors, start_date: null });
                }}
                className={`input input-bordered input-sm w-full rounded-xl bg-base-100 border-base-300 text-base-content text-xs ${
                  formErrors.start_date ? "input-error" : ""
                } ${hasPayments ? "opacity-60 cursor-not-allowed bg-base-200" : ""}`}
              />
              {formErrors.start_date && (
                <span className="text-[11px] text-error mt-1">
                  {formErrors.start_date}
                </span>
              )}
            </div>
          </div>

          {/* Dynamic Estimation Card */}
          {selectedPlan && principalNum > 0 && (
            <div className="p-3.5 bg-base-200/60 rounded-xl border border-base-300 space-y-2">
              <div className="flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider">
                <Calculator size={14} />
                Live Terms Preview
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-base-content/50 block text-[11px]">
                    Interest Rate:
                  </span>
                  <span className="font-bold text-base-content">
                    {formatRate(selectedPlan.interest_value, selectedPlan.interest_type)}
                  </span>
                </div>
                <div>
                  <span className="text-base-content/50 block text-[11px]">
                    Frequency:
                  </span>
                  <span className="font-bold text-base-content capitalize">
                    {selectedPlan.interest_frequency}
                  </span>
                </div>
                <div>
                  <span className="text-base-content/50 block text-[11px]">
                    Estimated Due:
                  </span>
                  <span className="font-bold text-primary">
                    {formatCurrency(estimatedInterest)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Remarks */}
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold text-base-content">
                Remarks / Notes (Optional)
              </span>
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Standard anytime credit on outstanding principal balance"
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              className="textarea textarea-bordered rounded-xl bg-base-100 border-base-300 text-base-content text-xs"
            />
          </div>

          {/* Actions */}
          <div className="modal-action pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm text-base-content/70"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-sm gap-1.5"
            >
              {saving ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  {isEdit ? "Saving…" : "Disbursing…"}
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Disburse Loan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterestLoanFormModal;
