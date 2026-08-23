import React, { useState } from "react";
import { Search, X, Download } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

/**
 * InstallmentReportFilters
 * Props:
 * - onApply (fn) : called with { status?, from_date?, to_date? }
 * - onExport (fn)
 * - hasResults (bool)
 */
export default function InstallmentReportFilters({
  onApply,
  onExport,
  hasResults,
}) {
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const buildFilters = () => {
    const filters = {};
    if (status) filters.status = status;
    if (fromDate) filters.from_date = fromDate;
    if (toDate) filters.to_date = toDate;
    return filters;
  };

  const handleApply = () => onApply(buildFilters());

  const handleReset = () => {
    setStatus("");
    setFromDate("");
    setToDate("");
    onApply({});
  };

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
      <div className="flex items-end gap-3 flex-wrap">
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-xs font-semibold">Status</span>
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="select select-bordered select-sm rounded-lg"
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
            className="input input-bordered input-sm rounded-lg"
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
            className="input input-bordered input-sm rounded-lg"
          />
        </div>

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
            Apply
          </button>
          {hasResults && (
            <button
              type="button"
              onClick={onExport}
              className="btn btn-outline btn-sm rounded-lg gap-1.5 border-base-300"
            >
              <Download size={13} />
              Export
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
