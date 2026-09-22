import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Phone,
  MessageCircle,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Download,
  Flame,
  ArrowUpDown,
  X,
  RefreshCw,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  PERIOD_STATUS_CONFIG,
  FREQUENCY_CONFIG,
} from "../../loan/utils/interestLoanHelpers.js";

export default function InterestLoanCollectionTable({
  items = [],
  activeTab = "today",
  loading = false,
  search: controlledSearch,
  onSearchChange,
  statusFilter: controlledStatusFilter,
  onStatusFilterChange,
  dueScope: controlledDueScope,
  onDueScopeChange,
  agingBucket: controlledAgingBucket,
  onAgingBucketChange,
  frequencyFilter: controlledFrequencyFilter,
  onFrequencyFilterChange,
  onCollect,
  canCollect = true,
  onRefresh,
}) {
  const [internalSearch, setInternalSearch] = useState("");
  const [internalStatusFilter, setInternalStatusFilter] = useState("all");
  const [internalDueScope, setInternalDueScope] = useState("date_only");
  const [internalAgingBucket, setInternalAgingBucket] = useState("all");
  const [internalFrequencyFilter, setInternalFrequencyFilter] = useState("all");

  const search = controlledSearch !== undefined ? controlledSearch : internalSearch;
  const statusFilter = controlledStatusFilter !== undefined ? controlledStatusFilter : internalStatusFilter;
  const dueScope = controlledDueScope !== undefined ? controlledDueScope : internalDueScope;
  const agingBucket = controlledAgingBucket !== undefined ? controlledAgingBucket : internalAgingBucket;
  const frequencyFilter = controlledFrequencyFilter !== undefined ? controlledFrequencyFilter : internalFrequencyFilter;

  const handleSearchChange = (val) => {
    if (onSearchChange) onSearchChange(val);
    setInternalSearch(val);
  };
  const handleStatusFilterChange = (val) => {
    if (onStatusFilterChange) onStatusFilterChange(val);
    setInternalStatusFilter(val);
  };
  const handleDueScopeChange = (val) => {
    if (onDueScopeChange) onDueScopeChange(val);
    setInternalDueScope(val);
  };
  const handleAgingBucketChange = (val) => {
    if (onAgingBucketChange) onAgingBucketChange(val);
    setInternalAgingBucket(val);
  };
  const handleFrequencyFilterChange = (val) => {
    if (onFrequencyFilterChange) onFrequencyFilterChange(val);
    setInternalFrequencyFilter(val);
  };

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortBy, setSortBy] = useState(
    activeTab === "overdue" ? "overdue_desc" : "balance_desc"
  );

  // Client-side quick filter & sort
  const processedItems = useMemo(() => {
    let list = Array.isArray(items) ? [...items] : [];

    // Client-side status filter
    if (activeTab === "today" && statusFilter !== "all") {
      list = list.filter((item) => {
        const st = (item.status || "pending").toLowerCase();
        const bal = Number(item.outstanding_interest_amount || 0);
        if (statusFilter === "due" || statusFilter === "pending") {
          return (st === "pending" || st === "due") && bal > 0;
        }
        if (statusFilter === "unpaid") {
          return st !== "paid" && bal > 0;
        }
        if (statusFilter === "partial") {
          return st === "partial";
        }
        if (statusFilter === "paid") {
          return st === "paid" || bal <= 0;
        }
        return true;
      });
    }

    // Client-side aging bucket filter for overdue
    if (activeTab === "overdue" && agingBucket !== "all") {
      list = list.filter((item) => {
        const days = Number(item.days_overdue || 0);
        if (agingBucket === "1-15") return days >= 1 && days <= 15;
        if (agingBucket === "16-30") return days >= 16 && days <= 30;
        if (agingBucket === "31-60") return days >= 31 && days <= 60;
        if (agingBucket === "60+") return days > 60;
        return true;
      });
    }

    // Client-side frequency filter
    if (frequencyFilter !== "all") {
      list = list.filter(
        (item) =>
          (item.interest_frequency || item.frequency || "").toLowerCase() ===
          frequencyFilter.toLowerCase()
      );
    }

    // Client-side search match
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((item) => {
        const name = (
          item.customer_name ||
          `${item.first_name || ""} ${item.last_name || ""}` ||
          ""
        ).toLowerCase();
        const loanNo = (item.loan_no || "").toLowerCase();
        const phone = (item.customer_mobile || item.mobile || "").toString();
        const custNo = (item.customer_no || "").toLowerCase();
        const plan = (item.plan_name || "").toLowerCase();
        return (
          name.includes(q) ||
          loanNo.includes(q) ||
          phone.includes(q) ||
          custNo.includes(q) ||
          plan.includes(q)
        );
      });
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "overdue_desc") {
        return (b.days_overdue || 0) - (a.days_overdue || 0);
      }
      if (sortBy === "balance_desc") {
        return (
          Number(b.outstanding_interest_amount || 0) -
          Number(a.outstanding_interest_amount || 0)
        );
      }
      if (sortBy === "balance_asc") {
        return (
          Number(a.outstanding_interest_amount || 0) -
          Number(b.outstanding_interest_amount || 0)
        );
      }
      if (sortBy === "date_asc") {
        return new Date(a.scheduled_date || 0) - new Date(b.scheduled_date || 0);
      }
      if (sortBy === "date_desc") {
        return new Date(b.scheduled_date || 0) - new Date(a.scheduled_date || 0);
      }
      if (sortBy === "customer_asc") {
        const nameA = a.customer_name || "";
        const nameB = b.customer_name || "";
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

    return list;
  }, [items, activeTab, statusFilter, agingBucket, frequencyFilter, search, sortBy]);

  // Pagination calculation
  const totalRecords = processedItems.length;
  const effectivePageSize = pageSize === "all" ? totalRecords : Number(pageSize);
  const totalPages =
    effectivePageSize > 0 ? Math.ceil(totalRecords / effectivePageSize) : 1;
  const currentPage = Math.min(Math.max(1, page), totalPages || 1);

  const paginatedItems = useMemo(() => {
    if (pageSize === "all") return processedItems;
    const start = (currentPage - 1) * effectivePageSize;
    return processedItems.slice(start, start + effectivePageSize);
  }, [processedItems, currentPage, effectivePageSize, pageSize]);

  // Handle Export to CSV
  const handleExportCSV = () => {
    if (processedItems.length === 0) return;

    const headers = [
      "No",
      "Customer Name",
      "Customer ID",
      "Mobile",
      "Loan No",
      "Frequency",
      "Plan",
      "Period No",
      "Scheduled Date",
      "Days Overdue",
      "Opening Principal",
      "Interest Due",
      "Paid Amount",
      "Balance Due",
      "Status",
    ];

    const rows = processedItems.map((item, idx) => [
      idx + 1,
      `"${(item.customer_name || `${item.first_name || ""} ${item.last_name || ""}`).replace(/"/g, '""')}"`,
      `"${item.customer_no || ""}"`,
      `"${item.customer_mobile || ""}"`,
      `"${item.loan_no || ""}"`,
      `"${item.interest_frequency || ""}"`,
      `"${(item.plan_name || "").replace(/"/g, '""')}"`,
      item.period_no || "",
      item.scheduled_date || "",
      item.days_overdue || 0,
      item.opening_principal || 0,
      item.interest_amount || 0,
      item.paid_interest_amount || 0,
      item.outstanding_interest_amount || 0,
      item.status || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Anytime_Collections_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compose WhatsApp URL
  const getWhatsAppUrl = (item) => {
    const rawMobile = (item.customer_mobile || item.mobile || "").replace(/\D/g, "");
    if (!rawMobile) return null;
    const phoneWithCountry =
      rawMobile.length === 10 ? `91${rawMobile}` : rawMobile;

    const outstanding = formatCurrency(item.outstanding_interest_amount);
    const dueDate = formatDate(item.scheduled_date);
    const name =
      item.customer_name ||
      `${item.first_name || ""} ${item.last_name || ""}`.trim() ||
      "Customer";

    const msg = `Dear ${name}, this is a gentle reminder regarding your Anytime Interest Loan (${item.loan_no}). Your scheduled interest payment of ${outstanding} was due on ${dueDate}. Kindly clear the due at the earliest. Thank you.`;

    return `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(msg)}`;
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    agingBucket !== "all" ||
    frequencyFilter !== "all" ||
    dueScope !== "date_only";

  const handleResetFilters = () => {
    handleSearchChange("");
    handleStatusFilterChange("all");
    handleAgingBucketChange("all");
    handleFrequencyFilterChange("all");
    handleDueScopeChange("date_only");
    setPage(1);
  };

  return (
    <div className="space-y-3.5">
      {/* ── PROFESSIONAL TOOLBAR & FILTER CONTROLS ── */}
      <div className="bg-base-100 p-4 rounded-2xl border border-base-300 shadow-xs space-y-3">
        {/* Top Row: Search + Quick Stats + Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[260px] max-w-lg">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40"
            />
            <input
              type="text"
              placeholder="Search customer, phone, loan no, customer ID, plan..."
              className="input input-bordered input-sm w-full pl-9 pr-8 rounded-xl text-xs"
              value={search}
              onChange={(e) => {
                handleSearchChange(e.target.value);
                setPage(1);
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  handleSearchChange("");
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Right Action Buttons: Export + Refresh */}
          <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs text-base-content/70">
              <ArrowUpDown size={13} className="text-base-content/40" />
              <select
                className="select select-bordered select-xs rounded-lg text-xs"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {activeTab === "overdue" ? (
                  <>
                    <option value="overdue_desc">Days Overdue: High → Low</option>
                    <option value="balance_desc">Due Amount: High → Low</option>
                    <option value="balance_asc">Due Amount: Low → High</option>
                    <option value="date_asc">Due Date: Earliest First</option>
                    <option value="customer_asc">Customer Name: A → Z</option>
                  </>
                ) : (
                  <>
                    <option value="balance_desc">Due Amount: High → Low</option>
                    <option value="balance_asc">Due Amount: Low → High</option>
                    <option value="date_asc">Scheduled Date: Earliest First</option>
                    <option value="customer_asc">Customer Name: A → Z</option>
                  </>
                )}
              </select>
            </div>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={processedItems.length === 0}
              className="btn btn-xs btn-outline rounded-lg text-xs font-semibold gap-1"
              title="Download filtered records as CSV"
            >
              <Download size={12} />
              <span>Export CSV</span>
            </button>

            {/* Refresh Button */}
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="btn btn-xs btn-ghost rounded-lg text-xs font-semibold gap-1 text-base-content/70 hover:text-base-content"
                title="Refresh collection data"
              >
                <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Tab-Specific Filter Chips & Frequency Selector */}
        <div className="flex items-center justify-between gap-2.5 flex-wrap pt-2 border-t border-base-200 text-xs">
          {/* Active Tab Specific Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/40 mr-1 flex items-center gap-1">
              <Filter size={11} /> Filter:
            </span>

            {activeTab === "today" ? (
              <>
                {/* Due Scope Pill (Scheduled Today vs Up to Today) */}
                <div className="join mr-2 border border-base-300 rounded-lg p-0.5 bg-base-200/50">
                  <button
                    type="button"
                    onClick={() => {
                      handleDueScopeChange("date_only");
                      setPage(1);
                    }}
                    className={`btn btn-xs rounded-md px-2.5 h-6 min-h-[24px] text-[11px] font-bold ${
                      dueScope === "date_only"
                        ? "btn-primary shadow-xs"
                        : "btn-ghost text-base-content/70 hover:bg-base-200"
                    }`}
                  >
                    Scheduled Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleDueScopeChange("up_to_date");
                      setPage(1);
                    }}
                    className={`btn btn-xs rounded-md px-2.5 h-6 min-h-[24px] text-[11px] font-bold ${
                      dueScope === "up_to_date"
                        ? "btn-primary shadow-xs"
                        : "btn-ghost text-base-content/70 hover:bg-base-200"
                    }`}
                    title="Include all pending dues up to this selected date"
                  >
                    All Dues Up To Date
                  </button>
                </div>

                {/* Status Chips */}
                {[
                  { key: "all", label: "All Records" },
                  { key: "due", label: "Due / Pending" },
                  { key: "partial", label: "Partial" },
                  { key: "paid", label: "Settled / Paid" },
                ].map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => {
                      handleStatusFilterChange(chip.key);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      statusFilter === chip.key
                        ? "bg-base-content text-base-100 shadow-xs font-bold"
                        : "bg-base-200 text-base-content/70 hover:bg-base-300"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </>
            ) : (
              /* Overdue Aging Bucket Chips */
              <>
                {[
                  { key: "all", label: "All Overdue" },
                  { key: "1-15", label: "1 - 15 Days" },
                  { key: "16-30", label: "16 - 30 Days" },
                  { key: "31-60", label: "31 - 60 Days" },
                  { key: "60+", label: "60+ Days Critical" },
                ].map((chip) => {
                  const isSelected = agingBucket === chip.key;
                  let selectedClass = "bg-error text-white font-bold shadow-xs";
                  if (chip.key === "1-15")
                    selectedClass = "bg-amber-600 text-white font-bold shadow-xs";
                  if (chip.key === "16-30")
                    selectedClass = "bg-orange-600 text-white font-bold shadow-xs";

                  return (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={() => {
                        handleAgingBucketChange(chip.key);
                        setPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                        isSelected
                          ? selectedClass
                          : "bg-base-200 text-base-content/70 hover:bg-base-300"
                      }`}
                    >
                      {chip.key === "60+" && <Flame size={11} />}
                      {chip.label}
                    </button>
                  );
                })}
              </>
            )}

            {/* Frequency Dropdown */}
            <select
              className="select select-bordered select-xs rounded-lg text-xs ml-1"
              value={frequencyFilter}
              onChange={(e) => {
                handleFrequencyFilterChange(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Frequencies</option>
              <option value="monthly">Monthly Plans</option>
              <option value="weekly">Weekly Plans</option>
              <option value="daily">Daily Plans</option>
              <option value="yearly">Yearly Plans</option>
            </select>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-xs btn-ghost text-error hover:bg-error/10 rounded-lg text-xs font-semibold gap-1 ml-1"
              >
                <X size={12} /> Clear Filters
              </button>
            )}
          </div>

          {/* Records Counter */}
          <div className="text-xs text-base-content/60 font-medium whitespace-nowrap">
            Showing <strong className="text-base-content">{processedItems.length}</strong> of{" "}
            <strong>{items.length}</strong> {activeTab === "overdue" ? "overdue" : "due"} records
          </div>
        </div>
      </div>

      {/* ── TABLE CARD ── */}
      <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-100 shadow-xs">
        <table className="table w-full">
          <thead>
            <tr className="text-[11px] font-bold uppercase tracking-wider text-base-content/60 border-b border-base-200 bg-base-200/40 select-none">
              <th className="px-3.5 py-3 text-center w-12">#</th>
              <th className="px-3.5 py-3 min-w-[200px]">Customer</th>
              <th className="px-3.5 py-3 min-w-[150px]">Loan Reference</th>
              <th className="px-3.5 py-3 min-w-[140px]">
                {activeTab === "overdue" ? "Due Date & Aging" : "Scheduled Date"}
              </th>
              <th className="px-3.5 py-3 text-right">Principal</th>
              <th className="px-3.5 py-3 text-right">Interest Due</th>
              <th className="px-3.5 py-3 text-right">Paid</th>
              <th className="px-3.5 py-3 text-right">Balance Due</th>
              <th className="px-3.5 py-3 text-center">Status</th>
              {canCollect && (
                <th className="px-3.5 py-3 text-right min-w-[130px]">Action</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200 text-xs">
            {loading ? (
              <tr>
                <td colSpan={10} className="py-20 text-center text-base-content/50">
                  <span className="loading loading-spinner loading-md text-primary mr-2" />
                  <span className="font-semibold text-xs">
                    Loading collection dues and overdue ledgers...
                  </span>
                </td>
              </tr>
            ) : paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-16 text-center text-base-content/50">
                  <div className="max-w-md mx-auto space-y-2">
                    <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-base-200 mx-auto text-base-content/40">
                      <FileText size={24} />
                    </span>
                    <p className="font-bold text-sm text-base-content">
                      No matching collections found
                    </p>
                    <p className="text-xs text-base-content/60">
                      {hasActiveFilters
                        ? "No collection items match your active search and filter criteria. Try adjusting or clearing your filters."
                        : activeTab === "today"
                        ? "No interest dues scheduled for this selected date."
                        : "Great job! There are currently no overdue interest collections pending across loans."}
                    </p>
                    {hasActiveFilters && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="btn btn-xs btn-primary rounded-lg font-bold"
                        >
                          Reset Filters
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedItems.map((item, idx) => {
                const statusCfg =
                  PERIOD_STATUS_CONFIG[item.status] ||
                  PERIOD_STATUS_CONFIG.pending;
                const freqCfg =
                  FREQUENCY_CONFIG[item.interest_frequency?.toLowerCase()] ||
                  FREQUENCY_CONFIG.monthly;
                const outstanding = Number(item.outstanding_interest_amount || 0);
                const daysOverdue = Number(item.days_overdue || 0);
                const waUrl = getWhatsAppUrl(item);

                // Overdue badge styling
                let overdueBadgeClass = "bg-error/15 text-error border-error/30";
                if (daysOverdue <= 15) {
                  overdueBadgeClass =
                    "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
                } else if (daysOverdue <= 30) {
                  overdueBadgeClass =
                    "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30";
                } else if (daysOverdue > 60) {
                  overdueBadgeClass =
                    "bg-red-600/20 text-red-700 dark:text-red-300 border-red-600/40 font-black animate-pulse";
                }

                const initials = (item.customer_name || `${item.first_name || ""} ${item.last_name || ""}`)
                  .trim()
                  .split(" ")
                  .map((p) => p[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "C";

                return (
                  <tr
                    key={`${item.loan_id}-${item.id || idx}`}
                    className="hover:bg-base-200/40 transition-colors"
                  >
                    {/* Index */}
                    <td className="px-3.5 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-base-200 text-xs font-bold text-base-content/70 font-mono">
                        {(currentPage - 1) * effectivePageSize + idx + 1}
                      </span>
                    </td>

                    {/* Customer Info with Avatar & Quick Contact */}
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 text-primary font-bold text-xs shrink-0 select-none">
                          {initials}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-base-content text-xs truncate">
                            {item.customer_name ||
                              `${item.first_name || ""} ${item.last_name || ""}`.trim() ||
                              "Valued Customer"}
                          </div>
                          <div className="text-[11px] text-base-content/50 flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="font-mono font-semibold">
                              #{item.customer_no || "—"}
                            </span>
                            {item.customer_mobile && (
                              <div className="flex items-center gap-1">
                                <a
                                  href={`tel:${item.customer_mobile}`}
                                  className="text-primary hover:underline font-mono inline-flex items-center gap-0.5"
                                  title="Click to call customer"
                                >
                                  <Phone size={10} />
                                  {item.customer_mobile}
                                </a>
                                {waUrl && (
                                  <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-emerald-600 hover:text-emerald-700 p-0.5 rounded transition-colors"
                                    title="Send WhatsApp payment reminder"
                                  >
                                    <MessageCircle size={11} />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Loan Reference & Plan */}
                    <td className="px-3.5 py-3">
                      <Link
                        to={`/interest-loans/${item.loan_id}`}
                        className="font-bold text-primary hover:underline flex items-center gap-1 group text-xs font-mono"
                      >
                        <span>{item.loan_no || `Loan #${item.loan_id}`}</span>
                        <ExternalLink size={10} className="opacity-40 group-hover:opacity-100" />
                      </Link>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className={freqCfg.badge}>{freqCfg.label}</span>
                        {item.plan_name && (
                          <span
                            className="text-[11px] text-base-content/50 truncate max-w-[130px]"
                            title={item.plan_name}
                          >
                            {item.plan_name}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Scheduled Date & Overdue Aging */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <div className="font-semibold text-base-content tabular-nums">
                        {formatDate(item.scheduled_date)}
                      </div>
                      {activeTab === "overdue" ? (
                        <div className="mt-0.5">
                          <span
                            className={`badge badge-xs font-bold gap-1 ${overdueBadgeClass}`}
                          >
                            <AlertTriangle size={10} />
                            {daysOverdue}d Overdue
                          </span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-base-content/50 font-medium">
                          Cycle #{item.period_no || "—"}
                        </div>
                      )}
                    </td>

                    {/* Opening Principal */}
                    <td className="px-3.5 py-3 text-right font-mono font-semibold tabular-nums text-base-content/70">
                      {formatCurrency(item.opening_principal)}
                    </td>

                    {/* Interest Due */}
                    <td className="px-3.5 py-3 text-right font-mono font-bold tabular-nums text-base-content">
                      {formatCurrency(item.interest_amount)}
                    </td>

                    {/* Paid Interest */}
                    <td className="px-3.5 py-3 text-right font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(item.paid_interest_amount)}
                    </td>

                    {/* Balance Due */}
                    <td className="px-3.5 py-3 text-right font-mono font-black tabular-nums text-amber-600 dark:text-amber-400 text-[13px]">
                      {formatCurrency(outstanding)}
                    </td>

                    {/* Status Badge */}
                    <td className="px-3.5 py-3 text-center">
                      <span className={statusCfg.badge}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                    </td>

                    {/* Action Button */}
                    {canCollect && (
                      <td className="px-3.5 py-3 text-right whitespace-nowrap">
                        {outstanding > 0 ? (
                          <button
                            type="button"
                            onClick={() => onCollect(item)}
                            className="btn btn-xs btn-primary inline-flex flex-row flex-nowrap items-center justify-center gap-1.5 whitespace-nowrap px-3 h-7 min-h-[28px] rounded-lg font-bold text-xs shadow-xs hover:shadow-sm hover:brightness-105 active:scale-95 transition-all"
                            title={`Collect ₹${outstanding.toLocaleString("en-IN")} interest due for ${item.loan_no}`}
                          >
                            <IndianRupee size={12} className="shrink-0" />
                            <span className="leading-none whitespace-nowrap">Pay Due</span>
                          </button>
                        ) : (
                          <span className="badge badge-sm bg-success/15 text-success border-success/30 gap-1 font-medium">
                            <CheckCircle2 size={11} />
                            Settled
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── PAGINATION CONTROLS ── */}
      {totalRecords > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 text-xs">
          {/* Left: Range and Page Size Selector */}
          <div className="flex items-center gap-3 text-base-content/60 font-medium">
            <span>
              Showing{" "}
              <strong className="text-base-content font-mono">
                {(currentPage - 1) * effectivePageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-base-content font-mono">
                {Math.min(currentPage * effectivePageSize, totalRecords)}
              </strong>{" "}
              of <strong className="text-base-content font-mono">{totalRecords}</strong> entries
            </span>

            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                className="select select-bordered select-xs rounded-lg text-xs"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(e.target.value);
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>

          {/* Right: Page Navigation Buttons */}
          {pageSize !== "all" && totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn btn-xs btn-outline rounded-lg text-xs px-2"
              >
                <ChevronLeft size={13} />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 2 + i;
                    if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                  }

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setPage(pageNum)}
                      className={`btn btn-xs rounded-lg w-7 h-6 min-h-[24px] font-mono text-xs ${
                        currentPage === pageNum
                          ? "btn-primary font-bold shadow-xs"
                          : "btn-ghost text-base-content/70"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="btn btn-xs btn-outline rounded-lg text-xs px-2"
              >
                <span>Next</span>
                <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
