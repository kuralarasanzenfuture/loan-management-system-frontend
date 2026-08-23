import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FileBarChart2,
  Landmark,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  fetchLoanReports,
  clearLoanReports,
} from "../../../../redux/loanReports/loanReportsSlice.js";
import LoanReportFilters from "../components/LoanReportFilters.jsx";
import LoanStatusBreakdownChart from "../components/LoanStatusBreakdownChart.jsx";
import CollectionTrendChart from "../components/CollectionTrendChart.jsx";
import { formatCurrency } from "../utils/loanReportHelpers.js";

export default function LoanReportsPage() {
  const dispatch = useDispatch();
  const {
    loanReportsSummary: summary,
    loanReportsCharts: charts,
    loanReportsLoading: loading,
    loanReportsError: error,
  } = useSelector((state) => state.loanReports);

  const now = new Date();
  const defaultParams = {
    from: `${now.getFullYear()}-01-01`,
    to: now.toISOString().slice(0, 10),
  };

  useEffect(() => {
    dispatch(fetchLoanReports(defaultParams));
    return () => dispatch(clearLoanReports());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleApplyFilters = (params) => {
    dispatch(fetchLoanReports(params));
  };

  const handleExport = () => {
    if (!summary) return;
    const rows = [
      ["Metric", "Value"],
      ["Total Loans", summary.total_loans],
      ["Total Disbursed", summary.total_disbursed],
      ["Total Expected", summary.total_expected],
      ["Total Collected", summary.total_collected],
      ["Total Outstanding", summary.total_outstanding],
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "loan-reports-summary.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const collectionRate =
    summary?.total_expected > 0
      ? Math.round(
          (Number(summary.total_collected) / Number(summary.total_expected)) *
            100,
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <FileBarChart2 size={20} className="text-primary" />
          Loan Reports
        </h1>
        <p className="text-sm text-base-content/50 mt-1">
          Portfolio performance, collections, and outstanding balances.
        </p>
      </div>

      {error && (
        <div className="alert alert-error text-sm py-2">
          <span>
            {typeof error === "string" ? error : "Something went wrong."}
          </span>
        </div>
      )}

      {/* Filters */}
      <LoanReportFilters
        onApply={handleApplyFilters}
        onExport={handleExport}
        hasResults={Boolean(summary)}
      />

      {loading && !summary ? (
        <div className="flex flex-col items-center justify-center py-24 text-base-content/40 gap-2">
          <span className="loading loading-spinner loading-md" />
          <p className="text-sm">Loading reports…</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
              <div className="flex items-center gap-2 text-xs text-base-content/50 mb-1">
                <Landmark size={13} /> Total Loans
              </div>
              <div className="text-xl font-bold leading-tight">
                {summary?.total_loans ?? 0}
              </div>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
              <div className="flex items-center gap-2 text-xs text-base-content/50 mb-1">
                <IndianRupee size={13} /> Disbursed
              </div>
              <div className="text-lg font-bold leading-tight">
                {formatCurrency(summary?.total_disbursed)}
              </div>
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
              <div className="flex items-center gap-2 text-xs text-base-content/50 mb-1">
                <TrendingUp size={13} /> Expected
              </div>
              <div className="text-lg font-bold leading-tight">
                {formatCurrency(summary?.total_expected)}
              </div>
            </div>

            <div className="rounded-2xl border border-success/20 bg-success/5 px-5 py-4">
              <div className="flex items-center gap-2 text-xs text-base-content/60 mb-1">
                <IndianRupee size={13} /> Collected
              </div>
              <div className="text-lg font-bold leading-tight text-success">
                {formatCurrency(summary?.total_collected)}
              </div>
              <div className="text-[10px] text-base-content/40 mt-0.5">
                {collectionRate}% of expected
              </div>
            </div>

            <div className="rounded-2xl border border-error/20 bg-error/5 px-5 py-4">
              <div className="flex items-center gap-2 text-xs text-base-content/60 mb-1">
                <AlertTriangle size={13} /> Outstanding
              </div>
              <div className="text-lg font-bold leading-tight text-error">
                {formatCurrency(summary?.total_outstanding)}
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-base-300 bg-base-100 p-6">
              <h3 className="font-bold text-sm tracking-tight mb-1">
                Loan Status Breakdown
              </h3>
              <p className="text-[11px] text-base-content/40 mb-4">
                Distribution of loans by current status
              </p>
              <LoanStatusBreakdownChart data={charts?.status_breakdown} />
            </div>

            <div className="rounded-2xl border border-base-300 bg-base-100 p-6">
              <h3 className="font-bold text-sm tracking-tight mb-1">
                Collection Trend
              </h3>
              <p className="text-[11px] text-base-content/40 mb-4">
                Daily repayments collected in this period
              </p>
              <CollectionTrendChart data={charts?.collection_trend} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
