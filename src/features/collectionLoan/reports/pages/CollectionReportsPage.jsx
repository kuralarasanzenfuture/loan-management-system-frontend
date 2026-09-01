import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FileBarChart2, IndianRupee, Receipt, Users, ShieldOff } from "lucide-react";
import usePermissions from "../../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../../constants/permissions.js";
import {
  fetchCollectionReports,
  clearCollectionReports,
} from "../../../../redux/installments/installmentSlice.js";
import CollectionReportFilters from "../components/CollectionReportFilters.jsx";
import CollectionReportTable from "../components/CollectionReportTable.jsx";
import Pagination from "../../../../common/components/Pagination/Pagination.jsx";
import usePagination from "../../../../common/hooks/usePagination.js";
import {
  formatCurrency,
  exportToCsv,
} from "../../utils/collectionReportHelpers.js";

export default function CollectionReportsPage() {
  const dispatch = useDispatch();
  const { can } = usePermissions();
  const canView = can(PERMISSIONS.COLLECTION_REPORT_VIEW);

  const {
    collectionReports = [],
    loading,
    error,
  } = useSelector((state) => state.installments);

  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    if (canView) {
      dispatch(fetchCollectionReports(activeFilters));
    }
    return () => dispatch(clearCollectionReports());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, canView]);

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    dispatch(fetchCollectionReports(filters));
  };

  const reportsList = useMemo(
    () => (Array.isArray(collectionReports) ? collectionReports : []),
    [collectionReports],
  );

  const handleExport = () => {
    const label = activeFilters.date
      ? activeFilters.date
      : `${activeFilters.from_date || "all"}_to_${activeFilters.to_date || "all"}`;
    exportToCsv(reportsList, `collection-report-${label}.csv`);
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
        (sum, r) => sum + (Number(r.paid_amount) || 0),
        0,
      ),
    [reportsList],
  );

  const uniqueCustomers = useMemo(
    () => new Set(reportsList.map((r) => r.customer_id).filter(Boolean)).size,
    [reportsList],
  );

  const filterSummaryLabel = activeFilters.date
    ? `for ${activeFilters.date}`
    : activeFilters.from_date || activeFilters.to_date
      ? `from ${activeFilters.from_date || "…"} to ${activeFilters.to_date || "…"}`
      : "";

  return (
    <div className="space-y-6">
      {!canView ? (
        <div className="flex flex-col items-center justify-center py-24 text-base-content/40 gap-3">
          <ShieldOff size={40} />
          <p className="text-sm font-medium">You don't have permission to view Collection Reports.</p>
        </div>
      ) : (
        <>
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <FileBarChart2 size={20} className="text-primary" />
          Collection Reports
        </h1>
        <p className="text-sm text-base-content/50 mt-1">
          All recorded repayments {filterSummaryLabel}.
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-success/10 text-success shrink-0">
            <IndianRupee size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Total Collected</div>
            <div className="text-xl font-semibold leading-tight text-success">
              {formatCurrency(totalCollected)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
            <Receipt size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">
              Payments Recorded
            </div>
            <div className="text-xl font-semibold leading-tight">
              {reportsList.length}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-info/10 text-info shrink-0">
            <Users size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Unique Customers</div>
            <div className="text-xl font-semibold leading-tight">
              {uniqueCustomers}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <CollectionReportFilters
        onApply={handleApplyFilters}
        onExport={handleExport}
        hasResults={reportsList.length > 0}
      />

      {/* Table + Pagination */}
      <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden">
        <CollectionReportTable rows={pagedRows} loading={loading} />
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
