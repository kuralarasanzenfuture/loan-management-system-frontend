import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FileBarChart2,
  Receipt,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  ShieldOff,
} from "lucide-react";
import {
  fetchLoanInstallmentsReport,
  clearInstallmentReports,
} from "../../../../redux/loanReports/loanReportsSlice.js";
import InstallmentReportFilters from "../components/InstallmentReportFilters.jsx";
import InstallmentReportTable from "../components/InstallmentReportTable.jsx";
import Pagination from "../../../../common/components/Pagination/Pagination.jsx";
import usePagination from "../../../../common/hooks/usePagination.js";
import {
  formatCurrency,
  exportToCsv,
} from "../utils/installmentReportHelpers.js";
import usePermissions from "../../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../../constants/permissions.js";

export default function InstallmentReportsPage() {
  const dispatch = useDispatch();
  const { can } = usePermissions();
  const canView = can(PERMISSIONS.LOAN_INSTALLMENT_REPORT_VIEW);

  const {
    installmentReports,
    installmentReportsCount,
    installmentReportsLoading: loading,
    installmentReportsError: error,
  } = useSelector((state) => state.loanReports);

  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    if (canView) {
      dispatch(fetchLoanInstallmentsReport({}));
    }
    return () => dispatch(clearInstallmentReports());
  }, [dispatch, canView]);

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    dispatch(fetchLoanInstallmentsReport(filters));
  };

  const safeReports = useMemo(
    () => (Array.isArray(installmentReports) ? installmentReports : []),
    [installmentReports],
  );

  const filteredRows = useMemo(() => {
    let list = safeReports;
    const searchLower = activeFilters.search?.toLowerCase()?.trim();
    const custNameLower = activeFilters.customer_name?.toLowerCase()?.trim();
    const phoneTrim = (activeFilters.phone || activeFilters.mobile)?.trim();
    const loanNoLower = activeFilters.loan_no?.toLowerCase()?.trim();
    const instNo = activeFilters.installment_no ? String(activeFilters.installment_no) : "";
    const statusFilter = activeFilters.status?.toLowerCase()?.trim();

    if (searchLower || custNameLower || phoneTrim || loanNoLower || instNo || statusFilter) {
      list = list.filter((r) => {
        const fullName = `${r.first_name || ""} ${r.last_name || ""}`.toLowerCase();
        const mobile = (r.mobile || "").toString();
        const loanNo = (r.loan_no || "").toLowerCase();
        const rInstNo = String(r.installment_no ?? "");
        const rStatus = (r.status || "").toLowerCase();

        if (searchLower) {
          const match =
            fullName.includes(searchLower) ||
            mobile.includes(searchLower) ||
            loanNo.includes(searchLower) ||
            rInstNo === searchLower;
          if (!match) return false;
        }

        if (custNameLower && !fullName.includes(custNameLower)) return false;
        if (phoneTrim && !mobile.includes(phoneTrim)) return false;
        if (loanNoLower && !loanNo.includes(loanNoLower)) return false;
        if (instNo && rInstNo !== instNo) return false;
        if (statusFilter && rStatus !== statusFilter) return false;

        return true;
      });
    }

    return list;
  }, [safeReports, activeFilters]);

  const handleExport = () => {
    exportToCsv(
      filteredRows,
      `installment-report-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  const {
    pagedData: pagedRows,
    currentPage,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
  } = usePagination({ data: filteredRows, initialSize: 20 });

  const totals = useMemo(() => {
    return filteredRows.reduce(
      (acc, r) => {
        acc.totalDue += Number(r.total_due) || 0;
        acc.totalPaid += Number(r.paid_amount) || 0;
        acc.totalBalance += Number(r.balance_amount) || 0;
        if (r.status === "paid") acc.paidCount += 1;
        if (r.status === "overdue") acc.overdueCount += 1;
        return acc;
      },
      {
        totalDue: 0,
        totalPaid: 0,
        totalBalance: 0,
        paidCount: 0,
        overdueCount: 0,
      },
    );
  }, [filteredRows]);

  return (
    <div className="space-y-6">
      {!canView ? (
        <div className="flex flex-col items-center justify-center py-24 text-base-content/40 gap-3">
          <ShieldOff size={40} />
          <p className="text-sm font-medium">You don't have permission to view Installment Reports.</p>
        </div>
      ) : (
        <>
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <FileBarChart2 size={20} className="text-primary" />
          Installment Reports
        </h1>
        <p className="text-sm text-base-content/50 mt-1">
          Installment-level breakdown across all loans, filterable by status and
          date.
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary shrink-0">
            <Receipt size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">
              Total Installments
            </div>
            <div className="text-xl font-bold leading-tight">
              {Object.keys(activeFilters).length > 0
                ? filteredRows.length
                : (installmentReportsCount || safeReports.length)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-info/10 text-info shrink-0">
            <IndianRupee size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Total Due</div>
            <div className="text-lg font-bold leading-tight">
              {formatCurrency(totals.totalDue)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-success/20 bg-success/5 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-success/10 text-success shrink-0">
            <CheckCircle2 size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Paid</div>
            <div className="text-lg font-bold leading-tight text-success">
              {formatCurrency(totals.totalPaid)}
            </div>
            <div className="text-[10px] text-base-content/40">
              {totals.paidCount} installments
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-error/20 bg-error/5 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-error/10 text-error shrink-0">
            <AlertTriangle size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Outstanding</div>
            <div className="text-lg font-bold leading-tight text-error">
              {formatCurrency(totals.totalBalance)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-warning/20 bg-warning/5 px-5 py-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-warning/10 text-warning shrink-0">
            <AlertTriangle size={18} />
          </span>
          <div>
            <div className="text-xs text-base-content/50">Overdue Count</div>
            <div className="text-lg font-bold leading-tight text-warning">
              {totals.overdueCount}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <InstallmentReportFilters
        onApply={handleApplyFilters}
        onExport={handleExport}
        hasResults={filteredRows.length > 0}
      />

      {/* Table + Pagination */}
      <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden">
        <InstallmentReportTable rows={pagedRows} loading={loading} />
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
