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
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
  { value: "overdue", label: "Overdue" },
];

/**
 * CustomerSummaryFilters
 * Supports searching customer reports by:
 * - Universal query (name, mobile, customer_no)
 * - Dedicated customer name
 * - Dedicated phone / mobile
 * - Customer ID
 * - Loan Status
 * - Date Range (from_date, to_date)
 */
export default function CustomerSummaryFilters({
  onSearch,
  onFilterChange,
  onExport,
  hasResults,
}) {
  const [query, setQuery] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const buildFilters = () => {
    const filters = {};
    if (query.trim()) filters.search = query.trim();
    if (customerName.trim()) filters.customer_name = customerName.trim();
    if (phoneNumber.trim()) filters.phone = phoneNumber.trim();
    if (customerId.trim()) filters.customer_id = customerId.trim();
    if (status) filters.status = status;
    if (fromDate) filters.from_date = fromDate;
    if (toDate) filters.to_date = toDate;
    return filters;
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onSearch?.(val);
  };

  const handleSearchClear = () => {
    setQuery("");
    onSearch?.("");
    const f = buildFilters();
    delete f.search;
    onFilterChange?.(f);
  };

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    onSearch?.(query.trim());
    onFilterChange?.(buildFilters());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleApplyFilters(e);
    }
  };

  const handleResetAll = () => {
    setQuery("");
    setCustomerName("");
    setPhoneNumber("");
    setCustomerId("");
    setStatus("");
    setFromDate("");
    setToDate("");
    onSearch?.("");
    onFilterChange?.({});
  };

  const hasActiveFilters = Boolean(
    query ||
    customerName ||
    phoneNumber ||
    customerId ||
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
            placeholder="Search by customer name, phone number, customer ID..."
            value={query}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button
              type="button"
              onClick={handleSearchClear}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-base-200">
        
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
              <Phone size={12} className="text-primary" /> Mobile / Phone
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

        {/* Customer ID */}
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-xs font-semibold flex items-center gap-1">
              <Hash size={12} className="text-primary" /> Customer ID
            </span>
          </label>
          <input
            type="number"
            min="1"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Optional"
            className="input input-bordered input-sm rounded-xl font-medium"
          />
        </div>

        {/* Loan Status */}
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-xs font-semibold">Loan Status</span>
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
            <span className="label-text text-xs font-semibold">From Date</span>
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
            <span className="label-text text-xs font-semibold">To Date</span>
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
            <span>Showing all customer loans</span>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetAll}
              className="btn btn-ghost btn-sm rounded-xl gap-1.5 text-xs font-medium"
            >
              <X size={13} />
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={handleApplyFilters}
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
