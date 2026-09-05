import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Coins,
  IndianRupee,
  Receipt,
  Users,
  ShieldOff,
  Banknote,
  Percent,
} from "lucide-react";
import usePermissions from "../../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../../constants/permissions.js";
import {
  fetchInterestCollectionReports,
  clearInterestCollectionReports,
} from "../../../../redux/interestOnlyPayment/interestOnlyPaymentSlice.js";
import InterestCollectionReportFilters from "../components/InterestCollectionReportFilters.jsx";
import InterestCollectionReportTable from "../components/InterestCollectionReportTable.jsx";
import Pagination from "../../../../common/components/Pagination/Pagination.jsx";
import usePagination from "../../../../common/hooks/usePagination.js";
import {
  formatCurrency,
  exportInterestCollectionToCsv,
} from "../../utils/interestReportHelpers.js";

export default function InterestCollectionReportsPage() {
  const dispatch = useDispatch();
  const { can } = usePermissions();

  const canView = can([
    PERMISSIONS.INTEREST_COLLECTION_REPORT_VIEW,
    PERMISSIONS.COLLECTION_REPORT_VIEW,
    PERMISSIONS.INTEREST_COLLECTION_VIEW,
    PERMISSIONS.INTEREST_ONLY_LOAN_VIEW,
  ]);

  const {
    collectionReports = [],
    collectionReportsSummary = null,
    collectionReportsLoading = false,
    collectionReportsError = null,
  } = useSelector((state) => state.interestOnlyPayments);

  const [activeFilters, setActiveFilters] = useState({ all: "true" });

  useEffect(() => {
    if (canView) {
      dispatch(fetchInterestCollectionReports(activeFilters));
    }
    return () => dispatch(clearInterestCollectionReports());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, canView]);

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    dispatch(fetchInterestCollectionReports(filters));
  };

  const reportsList = useMemo(() => {
    let list = Array.isArray(collectionReports) ? collectionReports : [];

    const searchLower = activeFilters.search?.toLowerCase()?.trim();
    const custNameLower = activeFilters.customer_name?.toLowerCase()?.trim();
    const phoneTrim = (activeFilters.phone || activeFilters.mobile)?.trim();
    const loanNoLower = activeFilters.loan_no?.toLowerCase()?.trim();

    if (searchLower || custNameLower || phoneTrim || loanNoLower) {
      list = list.filter((r) => {
        const fullName = `${r.first_name || ""} ${r.last_name || ""}`.toLowerCase();
        const mobile = (r.mobile || "").toString();
        const loanNo = (r.loan_no || "").toLowerCase();

        if (searchLower) {
          const matchesSearch =
            fullName.includes(searchLower) ||
            mobile.includes(searchLower) ||
            loanNo.includes(searchLower) ||
            (r.transaction_reference && r.transaction_reference.toLowerCase().includes(searchLower));
          if (!matchesSearch) return false;
        }

        if (custNameLower && !fullName.includes(custNameLower)) return false;
        if (phoneTrim && !mobile.includes(phoneTrim)) return false;
        if (loanNoLower && !loanNo.includes(loanNoLower)) return false;

        return true;
      });
    }

    return list;
  }, [collectionReports, activeFilters]);

  const handleExport = () => {
    const label = activeFilters.date
      ? activeFilters.date
      : `${activeFilters.from_date || "all"}_to_${activeFilters.to_date || "all"}`;
    exportInterestCollectionToCsv(reportsList, `interest-collection-report-${label}.csv`);
  };

  const {
    pagedData: pagedRows,
    currentPage,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
  } = usePagination({ data: reportsList, initialSize: 20 });

  const totalCollected = useMemo(
    () =>
      reportsList.reduce(
        (sum, r) => sum + (Number(r.payment_amount) || 0),
        0
      ),
    [reportsList]
  );

  const totalInterestCollected = useMemo(
    () =>
      reportsList.reduce(
        (sum, r) => sum + (Number(r.interest_amount) || 0),
        0
      ),
    [reportsList]
  );

  const totalPrincipalCollected = useMemo(
    () =>
      reportsList.reduce(
        (sum, r) => sum + (Number(r.principal_amount) || 0),
        0
      ),
    [reportsList]
  );

  const uniqueCustomers = useMemo(
    () => new Set(reportsList.map((r) => r.customer_id).filter(Boolean)).size,
    [reportsList]
  );

  const filterSummaryLabel = useMemo(() => {
    const parts = [];
    if (activeFilters.date && activeFilters.date !== "all") {
      parts.push(`for ${activeFilters.date}`);
    } else if (activeFilters.from_date || activeFilters.to_date) {
      parts.push(`from ${activeFilters.from_date || "start"} to ${activeFilters.to_date || "today"}`);
    }
    if (activeFilters.search) {
      parts.push(`matching "${activeFilters.search}"`);
    }
    if (activeFilters.customer_name) {
      parts.push(`customer "${activeFilters.customer_name}"`);
    }
    if (activeFilters.phone) {
      parts.push(`phone "${activeFilters.phone}"`);
    }
    if (activeFilters.loan_no) {
      parts.push(`loan "${activeFilters.loan_no}"`);
    }
    if (activeFilters.payment_mode && activeFilters.payment_mode !== "all") {
      parts.push(`mode "${activeFilters.payment_mode}"`);
    }
    return parts.length ? parts.join(", ") : "across all recorded transactions";
  }, [activeFilters]);

  return (
    <div className="space-y-6">
      {!canView ? (
        <div className="flex flex-col items-center justify-center py-24 text-base-content/40 gap-3">
          <ShieldOff size={40} />
          <p className="text-sm font-medium">
            You don't have permission to view Interest Collection Reports.
          </p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Coins size={20} className="text-primary" />
              Interest Collection Reports
            </h1>
            <p className="text-sm text-base-content/50 mt-1">
              All recorded interest-only repayments and principal collections {filterSummaryLabel}.
            </p>
          </div>

          {collectionReportsError && (
            <div className="alert alert-error text-sm py-2">
              <span>
                {typeof collectionReportsError === "string"
                  ? collectionReportsError
                  : "Something went wrong loading reports."}
              </span>
            </div>
          )}

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Collected */}
            <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-xs">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-success/10 text-success shrink-0">
                <IndianRupee size={18} />
              </span>
              <div className="min-w-0">
                <div className="text-xs text-base-content/50">
                  Total Collected
                </div>
                <div className="text-xl font-semibold leading-tight text-success truncate">
                  {formatCurrency(totalCollected)}
                </div>
              </div>
            </div>

            {/* Interest Collected */}
            <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-xs">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
                <Percent size={18} />
              </span>
              <div className="min-w-0">
                <div className="text-xs text-base-content/50">
                  Interest Portion
                </div>
                <div className="text-xl font-semibold leading-tight text-primary truncate">
                  {formatCurrency(totalInterestCollected)}
                </div>
              </div>
            </div>

            {/* Principal Collected */}
            <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-xs">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-info/10 text-info shrink-0">
                <Banknote size={18} />
              </span>
              <div className="min-w-0">
                <div className="text-xs text-base-content/50">
                  Principal Portion
                </div>
                <div className="text-xl font-semibold leading-tight text-info truncate">
                  {formatCurrency(totalPrincipalCollected)}
                </div>
              </div>
            </div>

            {/* Payments Recorded */}
            <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-xs">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/10 text-secondary shrink-0">
                <Receipt size={18} />
              </span>
              <div className="min-w-0">
                <div className="text-xs text-base-content/50">
                  Transactions
                </div>
                <div className="text-xl font-semibold leading-tight">
                  {reportsList.length}
                </div>
              </div>
            </div>

            {/* Unique Borrowers */}
            <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-xs">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 text-accent shrink-0">
                <Users size={18} />
              </span>
              <div className="min-w-0">
                <div className="text-xs text-base-content/50">
                  Borrowers
                </div>
                <div className="text-xl font-semibold leading-tight">
                  {uniqueCustomers}
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <InterestCollectionReportFilters
            onApply={handleApplyFilters}
            onExport={handleExport}
            hasResults={reportsList.length > 0}
          />

          {/* Table + Pagination */}
          <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden shadow-xs">
            <InterestCollectionReportTable
              rows={pagedRows}
              loading={collectionReportsLoading}
            />
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
