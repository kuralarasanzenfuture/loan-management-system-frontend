import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  AlertTriangle,
  RefreshCw,
  Coins,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import {
  fetchTodayCollections,
  fetchOverdueCollections,
  fetchCollectionsOverview,
  triggerSyncDuePeriods,
} from "../../../../redux/interestLoan/period/interestPeriodSlice.js";
import { fetchCompanyDetails } from "../../../../redux/companyDetails/companyDetailsSlice.js";
import usePermissions from "../../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../../constants/permissions.js";
import InterestLoanCollectionSummaryCards from "../components/InterestLoanCollectionSummaryCards.jsx";
import InterestLoanCollectionTable from "../components/InterestLoanCollectionTable.jsx";
import InterestLoanPaymentFormModal from "../../payment/components/InterestLoanPaymentFormModal.jsx";
import InterestLoanPaymentReceiptModal from "../../payment/components/InterestLoanPaymentReceiptModal.jsx";

export default function InterestLoanCollectionPage() {
  const dispatch = useDispatch();
  const { can } = usePermissions();

  const canView = can([
    PERMISSIONS.INTEREST_ONLY_LOAN_VIEW,
    PERMISSIONS.INTEREST_COLLECTION_VIEW,
  ]);
  const canCollect = can([
    PERMISSIONS.INTEREST_ONLY_LOAN_PAY,
    PERMISSIONS.INTEREST_ONLY_PAYMENT_CREATE,
    PERMISSIONS.INTEREST_COLLECTION_COLLECT,
    PERMISSIONS.INTEREST_COLLECTION_CREATE,
  ]);

  const {
    todayCollections = [],
    todaySummary = {},
    todayLoading = false,
    overdueCollections = [],
    overdueSummary = {},
    overdueLoading = false,
    collectionsOverview = null,
    syncing = false,
  } = useSelector((state) => state.interestPeriods || {});

  const [activeTab, setActiveTab] = useState("today"); // "today" | "overdue"
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [frequencyFilter, setFrequencyFilter] = useState("all");
  const [dueScope, setDueScope] = useState("date_only");
  const [agingBucket, setAgingBucket] = useState("all");
  const [minDaysOverdue, setMinDaysOverdue] = useState("");
  const [page, setPage] = useState(1);

  // Payment modal state
  const [collectTargetLoan, setCollectTargetLoan] = useState(null);
  const [collectTargetPeriod, setCollectTargetPeriod] = useState(null);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);

  // Receipt modal state
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState(null);

  const loadData = () => {
    dispatch(
      fetchTodayCollections({
        date: selectedDate,
        status: statusFilter,
        search,
        frequency: frequencyFilter !== "all" ? frequencyFilter : undefined,
        due_scope: dueScope,
      })
    );
    dispatch(
      fetchOverdueCollections({
        min_days_overdue: minDaysOverdue || undefined,
        aging_bucket: agingBucket !== "all" ? agingBucket : undefined,
        search,
        frequency: frequencyFilter !== "all" ? frequencyFilter : undefined,
      })
    );
    dispatch(
      fetchCollectionsOverview({
        date: selectedDate,
        frequency: frequencyFilter !== "all" ? frequencyFilter : undefined,
      })
    );
  };

  useEffect(() => {
    loadData();
    dispatch(fetchCompanyDetails());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    selectedDate,
    statusFilter,
    minDaysOverdue,
    frequencyFilter,
    dueScope,
    agingBucket,
  ]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Date stepper
  const handleShiftDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
    setPage(1);
  };

  const handleSetToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setPage(1);
  };

  const isSelectedToday =
    selectedDate === new Date().toISOString().split("T")[0];

  const handleSyncDue = async () => {
    await dispatch(triggerSyncDuePeriods(null));
    loadData();
  };

  const handleOpenCollect = (period) => {
    // Formulate loan payload for the modal
    const loanPayload = {
      id: period.loan_id,
      loan_no: period.loan_no,
      customer_id: period.customer_id,
      customer_name: period.customer_name,
      customer_no: period.customer_no,
      customer_mobile: period.customer_mobile,
      mobile: period.customer_mobile,
      interest_rate: period.interest_rate,
      interest_frequency: period.interest_frequency,
      principal_amount: period.loan_principal,
      outstanding_principal: period.outstanding_principal,
      outstanding_interest: period.outstanding_interest_amount,
    };

    setCollectTargetLoan(loanPayload);
    setCollectTargetPeriod(period);
    setIsCollectModalOpen(true);
  };

  const handlePaymentSuccess = (receiptData) => {
    setIsCollectModalOpen(false);
    loadData();
    if (receiptData) {
      setSelectedReceiptPayment(receiptData);
    }
  };

  const currentItems = activeTab === "today" ? todayCollections : overdueCollections;
  const currentLoading = activeTab === "today" ? todayLoading : overdueLoading;

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-base-200">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary shrink-0">
            <Coins size={24} />
          </span>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black tracking-tight text-base-content">
                Anytime Interest Collections
              </h1>
              <span className="badge badge-sm badge-info badge-outline font-semibold gap-1">
                <ShieldCheck size={12} />
                Live Ledger
              </span>
            </div>
            <p className="text-xs text-base-content/50 mt-0.5 font-medium">
              Manage daily scheduled interest dues and overdue collections across active anytime loans
            </p>
          </div>
        </div>

        {/* Date Navigation & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Date Stepper */}
          <div className="inline-flex items-center bg-base-100 border border-base-300 rounded-xl p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => handleShiftDate(-1)}
              className="btn btn-ghost btn-xs btn-square rounded-lg"
              title="Previous Day"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={handleSetToday}
              className={`btn btn-xs px-2.5 rounded-lg font-bold text-[11px] ${isSelectedToday
                  ? "btn-primary text-white"
                  : "btn-ghost text-base-content/70"
                }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleShiftDate(1)}
              className="btn btn-ghost btn-xs btn-square rounded-lg"
              title="Next Day"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Date Picker Input */}
          <input
            type="date"
            className="input input-bordered input-sm rounded-xl text-xs font-semibold tabular-nums shadow-2xs"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setPage(1);
            }}
          />

          {/* Sync Due Statuses */}
          <button
            type="button"
            onClick={handleSyncDue}
            disabled={syncing}
            className="btn btn-sm bg-base-100 hover:bg-base-200 border border-base-300 text-primary hover:border-primary/50 text-xs font-semibold rounded-xl gap-1.5 shadow-2xs h-9 transition-all"
            title="Advance past scheduled dates to 'Due' status"
          >
            <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
            <span>{syncing ? "Syncing..." : "Sync Due Statuses"}</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <InterestLoanCollectionSummaryCards
        todaySummary={todaySummary}
        overdueSummary={overdueSummary}
        upcomingSummary={collectionsOverview?.summary?.upcoming_7_days || {}}
        loading={todayLoading || overdueLoading}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeAgingBucket={agingBucket}
        onSelectAgingBucket={(bucket) => {
          setActiveTab("overdue");
          setAgingBucket(bucket);
          setPage(1);
        }}
      />

      {/* Main Tabs and Content */}
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-base-300">
          <button
            type="button"
            onClick={() => {
              setActiveTab("today");
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all -mb-px ${activeTab === "today"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-base-content/50 hover:text-base-content/80 hover:border-base-content/20"
              }`}
          >
            <Calendar size={14} />
            <span>Scheduled Dues</span>
            <span
              className={`badge badge-xs px-1.5 py-0.5 font-bold ${activeTab === "today"
                  ? "badge-primary text-primary-content"
                  : "badge-ghost"
                }`}
            >
              {todayCollections.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("overdue");
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all -mb-px ${activeTab === "overdue"
                ? "border-error text-error font-bold"
                : "border-transparent text-base-content/50 hover:text-base-content/80 hover:border-base-content/20"
              }`}
          >
            <AlertTriangle size={14} className={overdueCollections.length > 0 ? "text-error" : ""} />
            <span>Overdue Interest</span>
            <span
              className={`badge badge-xs px-1.5 py-0.5 font-bold ${activeTab === "overdue"
                  ? "badge-error text-white"
                  : "badge-ghost"
                }`}
            >
              {overdueCollections.length}
            </span>
          </button>
        </div>

        {/* Collection Table */}
        <InterestLoanCollectionTable
          items={currentItems}
          activeTab={activeTab}
          loading={currentLoading}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
          frequencyFilter={frequencyFilter}
          onFrequencyFilterChange={(val) => {
            setFrequencyFilter(val);
            setPage(1);
          }}
          dueScope={dueScope}
          onDueScopeChange={(val) => {
            setDueScope(val);
            setPage(1);
          }}
          agingBucket={agingBucket}
          onAgingBucketChange={(val) => {
            setAgingBucket(val);
            setPage(1);
          }}
          minDaysOverdue={minDaysOverdue}
          onMinDaysOverdueChange={(val) => {
            setMinDaysOverdue(val);
            setPage(1);
          }}
          onRefresh={loadData}
          onCollect={handleOpenCollect}
          canCollect={canCollect}
          page={page}
          onPageChange={setPage}
          itemsPerPage={10}
        />
      </div>

      {/* Collect Payment Modal */}
      {isCollectModalOpen && (
        <InterestLoanPaymentFormModal
          open={isCollectModalOpen}
          preselectedLoan={collectTargetLoan}
          preselectedPeriod={collectTargetPeriod}
          onClose={() => {
            setIsCollectModalOpen(false);
            setCollectTargetLoan(null);
            setCollectTargetPeriod(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Payment Receipt Modal */}
      {selectedReceiptPayment && (
        <InterestLoanPaymentReceiptModal
          open={Boolean(selectedReceiptPayment)}
          payment={selectedReceiptPayment}
          loan={collectTargetLoan}
          onClose={() => setSelectedReceiptPayment(null)}
        />
      )}
    </div>
  );
}
