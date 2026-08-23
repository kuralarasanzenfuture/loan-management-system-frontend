import React, { useState } from "react";
import { Search, X, Download } from "lucide-react";

/**
 * CustomerSummaryFilters
 * Props:
 * - onSearch (fn) : called with the raw search string (client-side filter,
 *                    since the endpoint has no documented search param)
 * - onExport (fn)
 * - hasResults (bool)
 */
export default function CustomerSummaryFilters({
  onSearch,
  onExport,
  hasResults,
}) {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  const handleReset = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <label className="input input-sm input-bordered flex items-center gap-2 w-full max-w-xs bg-base-100">
        <Search size={14} className="text-base-content/40 shrink-0" />
        <input
          type="text"
          className="grow"
          placeholder="Search customer name or mobile…"
          value={query}
          onChange={handleChange}
        />
        {query && (
          <button
            type="button"
            onClick={handleReset}
            className="text-base-content/30 hover:text-base-content"
          >
            <X size={13} />
          </button>
        )}
      </label>

      {hasResults && (
        <button
          type="button"
          onClick={onExport}
          className="btn btn-outline btn-sm gap-1.5 border-base-300"
        >
          <Download size={13} />
          Export CSV
        </button>
      )}
    </div>
  );
}
