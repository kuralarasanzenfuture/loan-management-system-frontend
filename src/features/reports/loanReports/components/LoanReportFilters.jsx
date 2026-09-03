import React, { useState } from "react";
import { Search, X, Download, Filter, Hash } from "lucide-react";

const QUICK_RANGES = [
  {
    label: "All Time",
    getRange: () => ({
      from: "",
      to: "",
      all: "true",
    }),
  },
  {
    label: "This Month",
    getRange: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        from: from.toISOString().slice(0, 10),
        to: now.toISOString().slice(0, 10),
      };
    },
  },
  {
    label: "This Year",
    getRange: () => {
      const now = new Date();
      return {
        from: `${now.getFullYear()}-01-01`,
        to: now.toISOString().slice(0, 10),
      };
    },
  },
  {
    label: "Last 90 Days",
    getRange: () => {
      const now = new Date();
      const from = new Date(now);
      from.setDate(from.getDate() - 90);
      return {
        from: from.toISOString().slice(0, 10),
        to: now.toISOString().slice(0, 10),
      };
    },
  },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
];

/**
 * LoanReportFilters
 * Builds filter parameters for loan portfolio reports:
 * - from / to
 * - status
 * - loan_no
 */
export default function LoanReportFilters({ onApply, onExport, hasResults }) {
  const now = new Date();
  const defaultFrom = `${now.getFullYear()}-01-01`;
  const defaultTo = now.toISOString().slice(0, 10);

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [status, setStatus] = useState("");
  const [loanNumber, setLoanNumber] = useState("");

  const buildFilters = (overrides = {}) => {
    const filters = {
      from,
      to,
      ...overrides,
    };
    if (status) filters.status = status;
    if (loanNumber.trim()) filters.loan_no = loanNumber.trim();
    return filters;
  };

  const applyRange = (range) => {
    setFrom(range.from || "");
    setTo(range.to || "");
    onApply(buildFilters({ from: range.from || "", to: range.to || "", all: range.all }));
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
    setFrom(defaultFrom);
    setTo(defaultTo);
    setStatus("");
    setLoanNumber("");
    onApply({ from: defaultFrom, to: defaultTo });
  };

  const hasActiveFilters = Boolean(
    status ||
    loanNumber ||
    from !== defaultFrom ||
    to !== defaultTo
  );

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-4 space-y-3.5 shadow-xs">
      
      {/* Quick Date Range Buttons & Export */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {QUICK_RANGES.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => applyRange(r.getRange())}
              className="btn btn-ghost btn-xs rounded-lg bg-base-200/60 font-semibold"
            >
              {r.label}
            </button>
          ))}
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

      {/* Filter Inputs: Loan Number, Status, From Date, To Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-base-200">
        
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

        {/* Status */}
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
            value={from}
            onChange={(e) => setFrom(e.target.value)}
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
            value={to}
            onChange={(e) => setTo(e.target.value)}
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
            <span>Showing year-to-date performance</span>
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
            Apply Filters
          </button>
        </div>
      </div>

    </div>
  );
}
