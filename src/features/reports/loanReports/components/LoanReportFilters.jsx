import React, { useState } from "react";
import { Search, X, Download } from "lucide-react";

const QUICK_RANGES = [
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

/**
 * LoanReportFilters
 * Props:
 * - onApply (fn) : called with { from, to }
 * - onExport (fn)
 * - hasResults (bool)
 */
export default function LoanReportFilters({ onApply, onExport, hasResults }) {
  const now = new Date();
  const defaultFrom = `${now.getFullYear()}-01-01`;
  const defaultTo = now.toISOString().slice(0, 10);

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const applyRange = (range) => {
    setFrom(range.from);
    setTo(range.to);
    onApply(range);
  };

  const handleApply = () => onApply({ from, to });

  const handleReset = () => {
    setFrom(defaultFrom);
    setTo(defaultTo);
    onApply({ from: defaultFrom, to: defaultTo });
  };

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-4 space-y-3">
      <div className="flex items-center gap-1.5 flex-wrap">
        {QUICK_RANGES.map((r) => (
          <button
            key={r.label}
            type="button"
            onClick={() => applyRange(r.getRange())}
            className="btn btn-ghost btn-xs rounded-lg bg-base-200/50"
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-3 flex-wrap">
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-xs font-semibold">From</span>
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="input input-bordered input-sm rounded-lg"
          />
        </div>
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text text-xs font-semibold">To</span>
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
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
