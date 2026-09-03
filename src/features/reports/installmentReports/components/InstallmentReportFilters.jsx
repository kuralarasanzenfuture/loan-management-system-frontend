import React, { useState } from "react";
import {
  Search,
  X,
  Download,
  Filter,
  User,
  Phone,
  Hash,
  Calendar,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

/**
 * InstallmentReportFilters
 * Builds filter params for installment reports:
 * - search (universal query matching customer, mobile, loan, installment)
 * - customer_name
 * - phone
 * - loan_no
 * - installment_no
 * - status
 * - from_date / to_date
 */
export default function InstallmentReportFilters({
  onApply,
  onExport,
  hasResults,
}) {
  const [search, setSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loanNumber, setLoanNumber] = useState("");
  const [installmentNo, setInstallmentNo] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const buildFilters = () => {
    const filters = {};
    if (search.trim()) filters.search = search.trim();
    if (customerName.trim()) filters.customer_name = customerName.trim();
    if (phoneNumber.trim()) filters.phone = phoneNumber.trim();
    if (loanNumber.trim()) filters.loan_no = loanNumber.trim();
    if (installmentNo.trim()) filters.installment_no = installmentNo.trim();
    if (status) filters.status = status;
    if (fromDate) filters.from_date = fromDate;
    if (toDate) filters.to_date = toDate;
    return filters;
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
    setSearch("");
    setCustomerName("");
    setPhoneNumber("");
    setLoanNumber("");
    setInstallmentNo("");
    setStatus("");
    setFromDate("");
    setToDate("");
    onApply({});
  };

  const hasActiveFilters = Boolean(
    search ||
    customerName ||
    phoneNumber ||
    loanNumber ||
    installmentNo ||
    status ||
    fromDate ||
    toDate
  );

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-4 space-y-3.5 shadow-xs">
      
      {/* Universal Search Bar & Export CSV */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
            <Search size={15} />
          </span>
          <input
            type="text"
            className="input input-sm input-bordered rounded-xl pl-9 pr-8 w-full font-medium"
            placeholder="Search by customer name, phone number, loan number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                const f = buildFilters();
                delete f.search;
                onApply(f);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {hasResults && (
          <button
            type="button"
            onClick={onExport}
            className="btn btn-outline btn-sm gap-1.5 border-base-300 rounded-xl ml-auto text-xs font-medium"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* Dedicated Filter Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2.5 pt-2 border-t border-base-200">
        
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
            placeholder="e.g. Ramesh"
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
            placeholder="e.g. 9876543210"
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
            placeholder="e.g. LN-1001"
            className="input input-bordered input-sm rounded-xl font-medium"
          />
        </div>

        {/* Installment Number */}
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-xs font-semibold text-base-content/70">
              Inst #
            </span>
          </label>
          <input
            type="number"
            min="1"
            value={installmentNo}
            onChange={(e) => setInstallmentNo(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 1"
            className="input input-bordered input-sm rounded-xl font-medium"
          />
        </div>

        {/* Status */}
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-xs font-semibold">Status</span>
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="select select-bordered select-sm rounded-xl text-xs font-medium"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* From Date */}
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-xs font-semibold">Due From</span>
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="input input-bordered input-sm rounded-xl text-xs font-medium"
          />
        </div>

        {/* To Date */}
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-xs font-semibold">Due To</span>
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="input input-bordered input-sm rounded-xl text-xs font-medium"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-1 border-t border-base-200">
        <div className="text-xs text-base-content/50">
          {hasActiveFilters ? (
            <span className="text-primary font-medium">Filters active</span>
          ) : (
            <span>Showing all installments</span>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-ghost btn-sm rounded-xl gap-1.5 text-xs font-medium"
            >
              <X size={13} />
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={handleApply}
            className="btn btn-primary btn-sm rounded-xl gap-1.5 text-xs font-bold shadow-xs"
          >
            <Filter size={13} />
            Apply Search & Filters
          </button>
        </div>
      </div>

    </div>
  );
}
