import React, { useState } from "react";
import {
  Search,
  Calendar,
  X,
  Download,
  User,
  Phone,
  Hash,
  CreditCard,
  RotateCcw,
} from "lucide-react";

const DATE_MODES = [
  { value: "all", label: "All Records" },
  { value: "today", label: "Today" },
  { value: "month", label: "This Month" },
  { value: "range", label: "Date Range" },
];

const PAYMENT_MODES = [
  { value: "all", label: "All Payment Modes" },
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank Transfer" },
  { value: "upi", label: "UPI" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
];

/**
 * InterestCollectionReportFilters
 * Builds filter parameters for interest collection reports:
 * - date / from_date / to_date
 * - search (customer name, phone, loan no, reference)
 * - customer_name, phone, loan_no, payment_mode
 * - customer_id, loan_id
 */
export default function InterestCollectionReportFilters({
  onApply,
  onExport,
  hasResults,
}) {
  const today = new Date().toISOString().slice(0, 10);
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  const [dateMode, setDateMode] = useState("all");
  const [date, setDate] = useState(today);
  const [fromDate, setFromDate] = useState(startOfMonth);
  const [toDate, setToDate] = useState(today);

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loanNumber, setLoanNumber] = useState("");
  const [paymentMode, setPaymentMode] = useState("all");
  const [customerId, setCustomerId] = useState("");
  const [loanId, setLoanId] = useState("");

  const buildFilters = (mode = dateMode) => {
    const filters = {};
    if (mode === "today") {
      filters.date = date || today;
    } else if (mode === "month") {
      filters.from_date = startOfMonth;
      filters.to_date = today;
    } else if (mode === "range") {
      if (fromDate) filters.from_date = fromDate;
      if (toDate) filters.to_date = toDate;
    } else {
      filters.all = "true";
    }

    if (search.trim()) filters.search = search.trim();
    if (customerName.trim()) filters.customer_name = customerName.trim();
    if (phoneNumber.trim()) filters.phone = phoneNumber.trim();
    if (loanNumber.trim()) filters.loan_no = loanNumber.trim();
    if (paymentMode && paymentMode !== "all") filters.payment_mode = paymentMode;
    if (customerId.trim()) filters.customer_id = customerId.trim();
    if (loanId.trim()) filters.loan_id = loanId.trim();

    return filters;
  };

  const handleModeChange = (mode) => {
    setDateMode(mode);
    onApply(buildFilters(mode));
  };

  const handleApply = (e) => {
    if (e) e.preventDefault();
    onApply(buildFilters());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleApply(e);
    }
  };

  const handleReset = () => {
    setDateMode("all");
    setDate(today);
    setFromDate(startOfMonth);
    setToDate(today);
    setSearch("");
    setCustomerName("");
    setPhoneNumber("");
    setLoanNumber("");
    setPaymentMode("all");
    setCustomerId("");
    setLoanId("");
    onApply({ all: "true" });
  };

  const hasActiveFilters = Boolean(
    search ||
    customerName ||
    phoneNumber ||
    loanNumber ||
    (paymentMode && paymentMode !== "all") ||
    customerId ||
    loanId ||
    dateMode !== "all"
  );

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-4 space-y-4 shadow-xs">
      {/* Top Row: Universal Search & Date Mode Toggle */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Universal Search Bar */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by customer name, phone, loan #, reference..."
            className="input input-sm input-bordered rounded-xl pl-9 pr-8 w-full font-medium"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                onApply({ ...buildFilters(), search: undefined });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Date Mode Buttons */}
        <div className="flex items-center gap-1.5 bg-base-200/50 border border-base-300 rounded-xl p-1 shrink-0 flex-wrap">
          {DATE_MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => handleModeChange(m.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                dateMode === m.value
                  ? "bg-primary text-primary-content shadow-xs"
                  : "text-base-content/60 hover:text-base-content hover:bg-base-100"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Selectors (if not 'all') */}
      {dateMode !== "all" && (
        <div className="flex items-center gap-3 flex-wrap pt-1 border-t border-base-200">
          {dateMode === "today" && (
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">Date</span>
              </label>
              <label className="input input-sm input-bordered flex items-center gap-2 rounded-xl bg-base-100">
                <Calendar size={13} className="text-base-content/40" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="grow font-medium text-xs"
                />
              </label>
            </div>
          )}

          {dateMode === "month" && (
            <div className="text-xs text-base-content/60 self-center py-2">
              Period: <span className="font-semibold text-base-content">{fromDate}</span> to{" "}
              <span className="font-semibold text-base-content">{toDate}</span>
            </div>
          )}

          {dateMode === "range" && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">From Date</span>
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="input input-bordered input-sm rounded-xl font-medium text-xs"
                />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-xs font-semibold">To Date</span>
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="input input-bordered input-sm rounded-xl font-medium text-xs"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dedicated Filter Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
        {/* Customer Name */}
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-xs font-semibold flex items-center gap-1">
              <User size={12} className="text-primary" /> Customer Name
            </span>
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Arjun"
            className="input input-bordered input-sm rounded-xl font-medium"
          />
        </div>

        {/* Phone Number */}
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-xs font-semibold flex items-center gap-1">
              <Phone size={12} className="text-primary" /> Phone Number
            </span>
          </label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 954429..."
            className="input input-bordered input-sm rounded-xl font-medium"
          />
        </div>

        {/* Loan Number */}
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-xs font-semibold flex items-center gap-1">
              <Hash size={12} className="text-primary" /> Loan Number
            </span>
          </label>
          <input
            type="text"
            value={loanNumber}
            onChange={(e) => setLoanNumber(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. IOL-2026-..."
            className="input input-bordered input-sm rounded-xl font-medium"
          />
        </div>

        {/* Payment Mode */}
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-xs font-semibold flex items-center gap-1">
              <CreditCard size={12} className="text-primary" /> Payment Mode
            </span>
          </label>
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            className="select select-bordered select-sm rounded-xl font-medium"
          >
            {PAYMENT_MODES.map((pm) => (
              <option key={pm.value} value={pm.value}>
                {pm.label}
              </option>
            ))}
          </select>
        </div>

        {/* Customer ID */}
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-xs font-semibold text-base-content/60">
              Customer ID
            </span>
          </label>
          <input
            type="number"
            min="1"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ID #"
            className="input input-bordered input-sm rounded-xl font-medium"
          />
        </div>

        {/* Loan ID */}
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-xs font-semibold text-base-content/60">
              Loan ID
            </span>
          </label>
          <input
            type="number"
            min="1"
            value={loanId}
            onChange={(e) => setLoanId(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ID #"
            className="input input-bordered input-sm rounded-xl font-medium"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-base-200 flex-wrap gap-2">
        <div className="text-xs text-base-content/50">
          {hasActiveFilters ? (
            <span className="text-primary font-medium">Filters active</span>
          ) : (
            <span>Showing all collection records</span>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-ghost btn-sm rounded-xl gap-1.5 text-xs font-medium"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          )}

          <button
            type="button"
            onClick={handleApply}
            className="btn btn-primary btn-sm rounded-xl gap-1.5 text-xs font-bold shadow-xs"
          >
            <Search size={13} />
            Apply Search & Filters
          </button>

          {hasResults && (
            <button
              type="button"
              onClick={onExport}
              className="btn btn-outline btn-sm rounded-xl gap-1.5 border-base-300 text-xs font-medium"
            >
              <Download size={13} />
              Export CSV
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
