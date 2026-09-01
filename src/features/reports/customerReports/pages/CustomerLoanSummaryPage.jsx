import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Users, Landmark, IndianRupee, AlertTriangle, ShieldOff } from "lucide-react";
import usePermissions from "../../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../../constants/permissions.js";
import {
  fetchCustomerLoanSummary,
  clearSummary,
} from "../../../../redux/loanReports/loanReportsSlice.js";
import CustomerSummaryFilters from "../components/CustomerSummaryFilters.jsx";
import CustomerSummaryTable from "../components/CustomerSummaryTable.jsx";
import Pagination from "../../../../common/components/Pagination/Pagination.jsx";
import usePagination from "../../../../common/hooks/usePagination.js";
import {
  formatCurrency,
  exportToCsv,
} from "../utils/customerSummaryHelpers.js";

export default function CustomerLoanSummaryPage() {
  const dispatch = useDispatch();
  const { can } = usePermissions();
  const canView = can(PERMISSIONS.CUSTOMER_REPORT_VIEW);

  const {
    customerSummaries = [],
    customerSummaryCount = 0,
    customerSummaryTotals = null,
    customerSummaryLoading: loading,
    customerSummaryError: error,
  } = useSelector((state) => state.loanReports);

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});

  const loadData = useCallback(
    (filters = {}) => {
      if (canView) {
        dispatch(fetchCustomerLoanSummary({ limit: 10000, ...filters }));
      }
    },
    [dispatch, canView],
  );

  useEffect(() => {
    loadData();
    return () => dispatch(clearSummary());
  }, [loadData, dispatch]);

  const safeSummaries = useMemo(() => {
    return Array.isArray(customerSummaries) ? customerSummaries : [];
  }, [customerSummaries]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return safeSummaries;
    const q = search.toLowerCase().trim();
    return safeSummaries.filter(
      (r) =>
        (r.name && r.name.toLowerCase().includes(q)) ||
        `${r.first_name || ""} ${r.last_name || ""}`.toLowerCase().includes(q) ||
        (r.mobile && String(r.mobile).includes(q)) ||
        (r.customer_no && String(r.customer_no).toLowerCase().includes(q)),
    );
  }, [safeSummaries, search]);

  const {
    pagedData: pagedRows,
    currentPage,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
    reset: resetPage,
  } = usePagination({ data: filteredRows, initialSize: 20 });

  const handleSearch = (query) => {
    setSearch(query);
    resetPage();
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
    loadData(filters);
    resetPage();
  };

  const handleExport = () => {
    exportToCsv(
      filteredRows,
      `customer-loan-summary-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  const totals = useMemo(() => {
    if (customerSummaryTotals) {
      return {
        totalLoanAmount: Number(
          customerSummaryTotals.total_amount ??
            customerSummaryTotals.total_loan ??
            0,
        ),
        totalPaid: Number(customerSummaryTotals.total_paid || 0),
        totalPending: Number(customerSummaryTotals.total_pending || 0),
      };
    }
    return safeSummaries.reduce(
      (acc, r) => {
        acc.totalLoanAmount +=
          Number(r.total_loan ?? r.total_amount) || 0;
        acc.totalPaid += Number(r.total_paid) || 0;
        acc.totalPending += Number(r.total_pending) || 0;
        return acc;
      },
      { totalLoanAmount: 0, totalPaid: 0, totalPending: 0 },
    );
  }, [safeSummaries, customerSummaryTotals]);

  return (
    <div className="space-y-6">
      {!canView ? (
        <div className="flex flex-col items-center justify-center py-24 text-base-content/40 gap-3">
          <ShieldOff size={40} />
          <p className="text-sm font-medium">You don't have permission to view Customer Reports.</p>
        </div>
      ) : (
        <>
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Users size={20} className="text-primary" />
          Customer Loan Summary
        </h1>
        <p className="text-sm text-base-content/50 mt-1">
          Aggregated loan exposure and recovery status per customer.
        </p>
      </div>

      {error && (
        <div className="alert alert-error text-sm py-2">
          <span>
            {typeof error === "string" ? error : "Something went wrong."}
          </span>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
            <Users size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Total Customers</div>
            <div className="text-xl font-bold leading-tight">
              {customerSummaryCount || safeSummaries.length}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-info/10 text-info shrink-0">
            <Landmark size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">
              Total Loan Amount
            </div>
            <div className="text-lg font-bold leading-tight">
              {formatCurrency(totals.totalLoanAmount)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-success/20 bg-success/5 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-success/10 text-success shrink-0">
            <IndianRupee size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Total Paid</div>
            <div className="text-lg font-bold leading-tight text-success">
              {formatCurrency(totals.totalPaid)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-error/20 bg-error/5 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-error/10 text-error shrink-0">
            <AlertTriangle size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Total Pending</div>
            <div className="text-lg font-bold leading-tight text-error">
              {formatCurrency(totals.totalPending)}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <CustomerSummaryFilters
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onExport={handleExport}
        hasResults={filteredRows.length > 0}
      />

      {/* Table + Pagination */}
      <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden">
        <CustomerSummaryTable rows={pagedRows} loading={loading} />
        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>
        </>
      )}
    </div>
  );
}
