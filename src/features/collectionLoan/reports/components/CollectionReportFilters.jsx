import React, { useState } from "react";
import { Search, Calendar, X, Download } from "lucide-react";

const DATE_MODES = [
  { value: "all", label: "All Records" },
  { value: "today", label: "Today" },
  { value: "month", label: "This Month" },
  { value: "range", label: "Date Range" },
];

/**
 * CollectionReportFilters
 * Builds filter params for collection reports:
 * { date } OR { from_date, to_date }, plus optional { customer_id, loan_id }.
 */
export default function CollectionReportFilters({
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
    }
    // "all" sends no date restrictions to fetch all customer records
    if (customerId) filters.customer_id = customerId;
    if (loanId) filters.loan_id = loanId;
    return filters;
  };

  const handleModeChange = (mode) => {
    setDateMode(mode);
    onApply(buildFilters(mode));
  };

  const handleApply = () => onApply(buildFilters());

  const handleReset = () => {
    setDateMode("all");
    setDate(today);
    setFromDate(startOfMonth);
    setToDate(today);
    setCustomerId("");
    setLoanId("");
    onApply({});
  };

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-4 space-y-4">
      {/* Date mode toggle */}
      <div className="flex items-center gap-1.5 bg-base-200/50 border border-base-300 rounded-xl p-1 w-fit flex-wrap">
        {DATE_MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => handleModeChange(m.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              dateMode === m.value
                ? "bg-primary text-primary-content shadow-sm"
                : "text-base-content/60 hover:text-base-content hover:bg-base-100"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-3 flex-wrap">
        {/* Date inputs */}
        {dateMode === "today" && (
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text text-xs font-semibold">Date</span>
            </label>
            <label className="input input-sm input-bordered flex items-center gap-2 rounded-lg bg-base-100">
              <Calendar size={13} className="text-base-content/40" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="grow"
              />
            </label>
          </div>
        )}

        {dateMode === "month" && (
          <div className="text-xs text-base-content/60 self-center pb-1">
            Period: <span className="font-semibold text-base-content">{fromDate}</span> to <span className="font-semibold text-base-content">{toDate}</span>
          </div>
        )}

        {dateMode === "range" && (
          <>
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">From</span>
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="input input-bordered input-sm rounded-lg"
              />
            </div>
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold">To</span>
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="input input-bordered input-sm rounded-lg"
              />
            </div>
          </>
        )}

        {/* Customer ID */}
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-xs font-semibold">
              Customer ID
            </span>
          </label>
          <input
            type="number"
            min="1"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="Optional"
            className="input input-bordered input-sm rounded-lg w-28"
          />
        </div>

        {/* Loan ID */}
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-xs font-semibold">Loan ID</span>
          </label>
          <input
            type="number"
            min="1"
            value={loanId}
            onChange={(e) => setLoanId(e.target.value)}
            placeholder="Optional"
            className="input input-bordered input-sm rounded-lg w-28"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-ghost btn-sm rounded-lg gap-1.5"
          >
            <X size={13} />
            Reset
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="btn btn-primary btn-sm rounded-lg gap-1.5"
          >
            <Search size={13} />
            Apply Filters
          </button>
          {hasResults && (
            <button
              type="button"
              onClick={onExport}
              className="btn btn-outline btn-sm rounded-lg gap-1.5 border-base-300"
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
