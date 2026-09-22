import React from "react";
import {
  Calendar,
  Search,
  Filter,
  RotateCcw,
  Download,
  Printer,
  ChevronDown,
} from "lucide-react";
import dayjs from "dayjs";

export default function InterestLoanReportFilters({
  filters = {},
  onFilterChange = () => {},
  onReset = () => {},
  onExportCSV = () => {},
  onPrint = () => {},
  activeTab = "overview",
}) {
  const handlePreset = (preset) => {
    const today = dayjs();
    let from_date = "";
    let to_date = today.format("YYYY-MM-DD");

    if (preset === "today") {
      from_date = today.format("YYYY-MM-DD");
    } else if (preset === "this_month") {
      from_date = today.startOf("month").format("YYYY-MM-DD");
    } else if (preset === "last_month") {
      from_date = today.subtract(1, "month").startOf("month").format("YYYY-MM-DD");
      to_date = today.subtract(1, "month").endOf("month").format("YYYY-MM-DD");
    } else if (preset === "this_quarter") {
      const quarterStartMonth = Math.floor(today.month() / 3) * 3;
      from_date = today.month(quarterStartMonth).startOf("month").format("YYYY-MM-DD");
    } else if (preset === "this_year") {
      from_date = today.startOf("year").format("YYYY-MM-DD");
    } else if (preset === "all") {
      from_date = "";
      to_date = "";
    }

    onFilterChange({ from_date, to_date });
  };

  return (
    <div className="bg-base-100 border border-base-300 rounded-2xl p-4 shadow-2xs space-y-3">
      {/* 1. Quick Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-xs font-semibold text-base-content/50 mr-1 flex items-center gap-1">
            <Calendar size={13} />
            Presets:
          </span>
          {[
            { id: "all", label: "All Time" },
            { id: "today", label: "Today" },
            { id: "this_month", label: "This Month" },
            { id: "last_month", label: "Last Month" },
            { id: "this_quarter", label: "This Quarter" },
            { id: "this_year", label: "This Year" },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePreset(p.id)}
              className="btn btn-xs btn-ghost hover:bg-base-200 border border-base-300 rounded-lg text-xs font-medium normal-case"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Export & Print actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* <button
            type="button"
            onClick={onPrint}
            className="btn btn-xs sm:btn-sm btn-ghost border border-base-300 hover:bg-base-200 rounded-xl gap-1.5 text-xs normal-case"
            title="Print Report"
          >
            <Printer size={14} />
            <span className="hidden sm:inline">Print</span>
          </button> */}

          <button
            type="button"
            onClick={onExportCSV}
            className="btn btn-xs sm:btn-sm btn-primary rounded-xl gap-1.5 text-xs font-semibold normal-case shadow-2xs"
            title="Download CSV"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="divider my-0 opacity-40" />

      {/* 2. Detailed Filter Inputs Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {/* From Date */}
        <div>
          <label className="text-[11px] font-semibold text-base-content/60 block mb-1">
            From Date
          </label>
          <input
            type="date"
            value={filters.from_date || ""}
            onChange={(e) => onFilterChange({ from_date: e.target.value })}
            className="input input-sm input-bordered w-full rounded-xl text-xs bg-base-200/50"
          />
        </div>

        {/* To Date */}
        <div>
          <label className="text-[11px] font-semibold text-base-content/60 block mb-1">
            To Date
          </label>
          <input
            type="date"
            value={filters.to_date || ""}
            onChange={(e) => onFilterChange({ to_date: e.target.value })}
            className="input input-sm input-bordered w-full rounded-xl text-xs bg-base-200/50"
          />
        </div>

        {/* Status Filter (Relevant for overview and loans) */}
        {activeTab !== "payments" && (
          <div>
            <label className="text-[11px] font-semibold text-base-content/60 block mb-1">
              Loan Status
            </label>
            <select
              value={filters.status || ""}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              className="select select-sm select-bordered w-full rounded-xl text-xs bg-base-200/50"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}

        {/* Frequency Filter */}
        {activeTab !== "payments" && (
          <div>
            <label className="text-[11px] font-semibold text-base-content/60 block mb-1">
              Interest Frequency
            </label>
            <select
              value={filters.interest_frequency || ""}
              onChange={(e) => onFilterChange({ interest_frequency: e.target.value })}
              className="select select-sm select-bordered w-full rounded-xl text-xs bg-base-200/50"
            >
              <option value="">All Frequencies</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        )}

        {/* Payment Mode Filter (For Payments Tab) */}
        {activeTab === "payments" && (
          <div>
            <label className="text-[11px] font-semibold text-base-content/60 block mb-1">
              Payment Mode
            </label>
            <select
              value={filters.payment_mode || ""}
              onChange={(e) => onFilterChange({ payment_mode: e.target.value })}
              className="select select-sm select-bordered w-full rounded-xl text-xs bg-base-200/50"
            >
              <option value="">All Modes</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="cheque">Cheque</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}

        {/* Search Bar & Reset */}
        <div className="flex items-end gap-2">
          <div className="relative grow">
            <label className="text-[11px] font-semibold text-base-content/60 block mb-1">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Loan #, customer, mobile..."
                value={filters.search || ""}
                onChange={(e) => onFilterChange({ search: e.target.value })}
                className="input input-sm input-bordered w-full pr-8 rounded-xl text-xs bg-base-200/50"
              />
              <Search
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="btn btn-sm btn-ghost border border-base-300 hover:bg-base-200 rounded-xl px-2.5 shrink-0"
            title="Reset Filters"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
