import React, { useState } from "react";
import { Search, X, Download, Filter } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
  { value: "overdue", label: "Overdue" },
];

/**
 * CustomerSummaryFilters
 * Props:
 * - onSearch (fn) : called with the raw search string (client-side filter)
 * - onFilterChange (fn) : called with { status?, from_date?, to_date? } for server queries
 * - onExport (fn) : triggers CSV download
 * - hasResults (bool)
 */
export default function CustomerSummaryFilters({
  onSearch,
  onFilterChange,
  onExport,
  hasResults,
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onSearch?.(val);
  };

  const handleSearchClear = () => {
    setQuery("");
    onSearch?.("");
  };

  const handleApplyFilters = () => {
    const filters = {};
    if (status) filters.status = status;
    if (fromDate) filters.from_date = fromDate;
    if (toDate) filters.to_date = toDate;
    onFilterChange?.(filters);
  };

  const handleResetAll = () => {
    setQuery("");
    setStatus("");
    setFromDate("");
    setToDate("");
    onSearch?.("");
    onFilterChange?.({});
  };

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Search Input */}
        <label className="input input-sm input-bordered flex items-center gap-2 w-full sm:w-72 bg-base-100">
          <Search size={14} className="text-base-content/40 shrink-0" />
          <input
            type="text"
            className="grow text-xs"
            placeholder="Search customer name or mobile…"
            value={query}
            onChange={handleSearchChange}
          />
          {query && (
            <button
              type="button"
              onClick={handleSearchClear}
              className="text-base-content/30 hover:text-base-content"
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </label>

        {/* Action buttons (Export) */}
        {hasResults && (
          <button
            type="button"
            onClick={onExport}
            className="btn btn-outline btn-sm gap-1.5 border-base-300 ml-auto"
          >
            <Download size={13} />
            Export CSV
          </button>
        )}
      </div>

      {/* Advanced Filters: Status & Date Range */}
      <div className="flex items-end gap-3 flex-wrap pt-2 border-t border-base-200">
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-xs font-semibold">Loan Status</span>
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="select select-bordered select-sm rounded-lg text-xs"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-xs font-semibold">From Date</span>
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="input input-bordered input-sm rounded-lg text-xs"
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
            className="input input-bordered input-sm rounded-lg text-xs"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {(status || fromDate || toDate || query) && (
            <button
              type="button"
              onClick={handleResetAll}
              className="btn btn-ghost btn-sm rounded-lg gap-1.5 text-xs"
            >
              <X size={13} />
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={handleApplyFilters}
            className="btn btn-primary btn-sm rounded-lg gap-1.5 text-xs"
          >
            <Filter size={13} />
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
