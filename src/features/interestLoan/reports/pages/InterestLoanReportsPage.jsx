import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FileBarChart2,
  TrendingUp,
  Coins,
  CreditCard,
  RotateCcw,
  Download,
  Printer,
  ShieldOff,
} from "lucide-react";
import InterestLoanModuleNav from "../../loan/components/InterestLoanModuleNav.jsx";
import InterestLoanReportKPIs from "../components/InterestLoanReportKPIs.jsx";
import InterestLoanReportCharts from "../components/InterestLoanReportCharts.jsx";
import InterestLoanReportFilters from "../components/InterestLoanReportFilters.jsx";
import InterestLoanLoansReportTable from "../components/InterestLoanLoansReportTable.jsx";
import InterestLoanCollectionsReportTable from "../components/InterestLoanCollectionsReportTable.jsx";
import InterestLoanPaymentsReportTable from "../components/InterestLoanPaymentsReportTable.jsx";
import {
  fetchInterestLoanReportOverview,
  fetchInterestLoanLoansReport,
  fetchInterestLoanCollectionsReport,
  fetchInterestLoanPaymentsReport,
  setActiveSubTab,
  setFilters,
  resetFilters,
} from "../../../../redux/interestLoan/reports/interestLoanReportSlice.js";
import usePermissions from "../../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../../constants/permissions.js";

export default function InterestLoanReportsPage() {
  const dispatch = useDispatch();
  const { can } = usePermissions();
  const canView =
    can(PERMISSIONS.INTEREST_ONLY_LOAN_VIEW) || can(PERMISSIONS.LOAN_REPORT_VIEW);

  const {
    overview,
    overviewLoading,
    overviewError,
    loansReport,
    loansLoading,
    collectionsReport,
    collectionsLoading,
    paymentsReport,
    paymentsLoading,
    activeSubTab,
    filters,
  } = useSelector((state) => state.interestLoanReports);

  // Load data based on active tab and filters
  const loadActiveData = useCallback(() => {
    if (!canView) return;

    if (activeSubTab === "overview") {
      dispatch(fetchInterestLoanReportOverview(filters));
    } else if (activeSubTab === "loans") {
      dispatch(
        fetchInterestLoanLoansReport({
          ...filters,
          page: loansReport.pagination?.page || 1,
          limit: loansReport.pagination?.limit || 15,
        })
      );
    } else if (activeSubTab === "collections") {
      dispatch(fetchInterestLoanCollectionsReport(filters));
    } else if (activeSubTab === "payments") {
      dispatch(
        fetchInterestLoanPaymentsReport({
          ...filters,
          page: paymentsReport.pagination?.page || 1,
          limit: paymentsReport.pagination?.limit || 15,
        })
      );
    }
  }, [dispatch, canView, activeSubTab, filters, loansReport.pagination?.page, loansReport.pagination?.limit, paymentsReport.pagination?.page, paymentsReport.pagination?.limit]);

  useEffect(() => {
    loadActiveData();
  }, [loadActiveData]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  // Reset filters
  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  // Pagination changes
  const handleLoanPageChange = (newPage) => {
    dispatch(
      fetchInterestLoanLoansReport({
        ...filters,
        page: newPage,
        limit: loansReport.pagination?.limit || 15,
      })
    );
  };

  const handlePaymentPageChange = (newPage) => {
    dispatch(
      fetchInterestLoanPaymentsReport({
        ...filters,
        page: newPage,
        limit: paymentsReport.pagination?.limit || 15,
      })
    );
  };

  // Export CSV based on current active tab
  const handleExportCSV = () => {
    let rows = [];
    let filename = "anytime-interest-report.csv";

    if (activeSubTab === "overview") {
      filename = "anytime-interest-portfolio-summary.csv";
      rows = [
        ["Metric", "Value"],
        ["Total Loans", overview?.summary?.total_loans ?? 0],
        ["Active Loans", overview?.summary?.active_loans ?? 0],
        ["Completed Loans", overview?.summary?.completed_loans ?? 0],
        ["Total Principal Disbursed", overview?.summary?.total_principal_disbursed ?? 0],
        ["Total Outstanding Principal", overview?.summary?.total_outstanding_principal ?? 0],
        ["Total Principal Collected", overview?.summary?.total_principal_collected ?? 0],
        ["Total Interest Accrued", overview?.summary?.total_interest_accrued ?? 0],
        ["Total Interest Collected", overview?.summary?.total_interest_collected ?? 0],
        ["Total Outstanding Interest", overview?.summary?.total_outstanding_interest ?? 0],
        ["Collection Rate (%)", overview?.summary?.collection_rate ?? 0],
        ["Total Overdue Amount", overview?.summary?.total_overdue_amount ?? 0],
      ];
    } else if (activeSubTab === "loans") {
      filename = "anytime-interest-loans-report.csv";
      rows = [
        [
          "Loan No",
          "Customer Name",
          "Mobile",
          "Plan",
          "Frequency",
          "Principal Amount",
          "Outstanding Principal",
          "Interest Rate (%)",
          "Interest Paid",
          "Principal Paid",
          "Status",
          "Start Date",
        ],
        ...loansReport.data.map((l) => [
          l.loan_no,
          l.customer_name || l.customer_no,
          l.customer_mobile || "",
          l.plan_name || "",
          l.interest_frequency || "",
          l.principal_amount,
          l.outstanding_principal,
          l.interest_rate,
          l.total_interest_paid,
          l.total_principal_paid,
          l.status,
          l.start_date || "",
        ]),
      ];
    } else if (activeSubTab === "collections") {
      filename = "anytime-interest-collections-dues.csv";
      const records = [
        ...(collectionsReport.overdue || []),
        ...(collectionsReport.today || []),
      ];
      rows = [
        [
          "Cycle No",
          "Loan No",
          "Customer Name",
          "Mobile",
          "Due Date",
          "Due Amount",
          "Paid Amount",
          "Outstanding Due",
          "Status",
          "Days Overdue",
        ],
        ...records.map((r) => [
          r.period_no ?? 1,
          r.loan_no || r.loan_id,
          r.customer_name || "",
          r.customer_mobile || "",
          r.scheduled_date || r.due_date || "",
          r.interest_amount || r.due_amount || 0,
          r.paid_interest_amount || r.collected_amount || 0,
          r.outstanding_interest_amount || r.outstanding_amount || 0,
          r.status || "",
          r.days_overdue || 0,
        ]),
      ];
    } else if (activeSubTab === "payments") {
      filename = "anytime-interest-payments-ledger.csv";
      rows = [
        [
          "Payment No",
          "Date",
          "Loan No",
          "Customer Name",
          "Mobile",
          "Mode",
          "Total Paid",
          "Interest Allocated",
          "Principal Allocated",
          "Outstanding Principal After",
        ],
        ...paymentsReport.data.map((p) => [
          p.payment_no || p.id,
          p.payment_date || "",
          p.loan_no || p.loan_id,
          p.customer_name || "",
          p.customer_mobile || "",
          p.payment_mode || "",
          p.payment_amount,
          p.interest_amount,
          p.principal_amount,
          p.outstanding_principal_after,
        ]),
      ];
    }

    if (rows.length === 0) return;

    const csvContent = rows
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {!canView ? (
        <div className="flex flex-col items-center justify-center py-24 text-base-content/40 gap-3">
          <ShieldOff size={40} />
          <p className="text-sm font-medium">
            You don't have permission to view Anytime Interest Loan Reports.
          </p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2 text-base-content">
                <FileBarChart2 size={22} className="text-primary" />
                Anytime Interest Loan Reports
              </h1>
              <p className="text-xs text-base-content/60 mt-0.5">
                Comprehensive portfolio analytics, collection trends, dues, and payment ledgers
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadActiveData}
                className="btn btn-sm btn-ghost border border-base-300 hover:bg-base-200 rounded-xl gap-1.5 text-xs normal-case"
                title="Refresh Report Data"
              >
                <RotateCcw size={14} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Module Navigation Tabs (Loans | Payments | Collections | Reports) */}
          <InterestLoanModuleNav activeTab="reports" />

          {/* Subtabs Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-base-300 pb-2">
            {[
              {
                id: "overview",
                label: "Overview & Analytics",
                icon: TrendingUp,
              },
              {
                id: "loans",
                label: "Loan Portfolio Report",
                icon: FileBarChart2,
                count: loansReport.pagination?.total,
              },
              {
                id: "collections",
                label: "Collections & Dues Ledger",
                icon: Coins,
                count:
                  (collectionsReport.overdue?.length || 0) +
                  (collectionsReport.today?.length || 0),
              },
              {
                id: "payments",
                label: "Payments Receipts Ledger",
                icon: CreditCard,
                count: paymentsReport.pagination?.total,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => dispatch(setActiveSubTab(tab.id))}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs transition-all select-none whitespace-nowrap font-medium ${
                    isActive
                      ? "bg-primary text-primary-content font-bold shadow-xs"
                      : "text-base-content/70 hover:text-base-content hover:bg-base-200"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`badge badge-xs ${
                        isActive
                          ? "bg-primary-content text-primary font-bold"
                          : "badge-ghost"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Global Filter Bar */}
          <InterestLoanReportFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            onExportCSV={handleExportCSV}
            onPrint={handlePrint}
            activeTab={activeSubTab}
          />

          {/* Tab Content Display */}
          {activeSubTab === "overview" && (
            <div className="space-y-6">
              <InterestLoanReportKPIs
                summary={overview?.summary}
                loading={overviewLoading}
              />

              <InterestLoanReportCharts
                monthlyTrend={overview?.monthly_trend}
                statusBreakdown={overview?.status_breakdown}
                paymentModes={overview?.payment_modes}
                loading={overviewLoading}
              />
            </div>
          )}

          {activeSubTab === "loans" && (
            <InterestLoanLoansReportTable
              loans={loansReport.data}
              pagination={loansReport.pagination}
              onPageChange={handleLoanPageChange}
              loading={loansLoading}
            />
          )}

          {activeSubTab === "collections" && (
            <InterestLoanCollectionsReportTable
              todayCollections={collectionsReport.today}
              overdueCollections={collectionsReport.overdue}
              todaySummary={collectionsReport.todaySummary}
              overdueSummary={collectionsReport.overdueSummary}
              loading={collectionsLoading}
            />
          )}

          {activeSubTab === "payments" && (
            <InterestLoanPaymentsReportTable
              payments={paymentsReport.data}
              pagination={paymentsReport.pagination}
              onPageChange={handlePaymentPageChange}
              loading={paymentsLoading}
            />
          )}
        </>
      )}
    </div>
  );
}
