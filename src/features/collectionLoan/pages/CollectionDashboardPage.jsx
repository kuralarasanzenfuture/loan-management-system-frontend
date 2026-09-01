import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  AlertTriangle,
  TrendingUp,
  Search,
  RefreshCw,
  IndianRupee,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Layers,
} from "lucide-react";
import {
  fetchTodayCollections,
  fetchOverdueInstallmentsGlobal,
  payInstallmentAction,
  applyPenaltyAction,
  clearInstallmentError,
  clearCollectionDashboard,
} from "../../../redux/installments/installmentSlice.js";
import CollectionTable from "../components/CollectionTable.jsx";
import PayInstallmentModal from "../components/PayInstallmentModal.jsx";
import Pagination from "../../../common/components/Pagination/Pagination.jsx";
import usePagination from "../../../common/hooks/usePagination.js";
import { formatCurrency } from "../utils/collectionHelpers.js";
import PaymentSuccessModal from "../components/PaymentSuccessModal.jsx";
import usePermissions from "../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../constants/permissions.js";

const TABS = [
  { key: "today", label: "Today's Due", icon: Calendar },
  { key: "overdue", label: "Overdue", icon: AlertTriangle },
];

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending / Due" },
  { key: "partial", label: "Partial" },
  { key: "paid", label: "Paid" },
];

export default function CollectionDashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ── Global RBAC/PBAC Permissions ──────────────────────────────────────────────
  const { can } = usePermissions();
  const canView = can(PERMISSIONS.DUE_COLLECTION_VIEW) || can(PERMISSIONS.COLLECTION_VIEW);
  const canCollect =
    can(PERMISSIONS.DUE_COLLECTION_CREATE) ||
    can(PERMISSIONS.LOAN_COLLECTION_CREATE) ||
    can(PERMISSIONS.COLLECTION_CREATE) ||
    canView;

  const {
    todayCollections = [],
    todaySummary,
    overdueGlobal = [],
    overdueGlobalSummary,
    loading,
    error,
  } = useSelector((state) => state.installments);

  const [activeTab, setActiveTab] = useState("today");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Pay Modal state
  const [payTarget, setPayTarget] = useState(null);
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState("");
  const [paySuccessData, setPaySuccessData] = useState(null);

  const loadData = () => {
    dispatch(fetchTodayCollections(selectedDate));
    dispatch(fetchOverdueInstallmentsGlobal());
  };

  useEffect(() => {
    loadData();
    return () => dispatch(clearCollectionDashboard());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    dispatch(fetchTodayCollections(newDate));
  };

  const handleShiftDate = (days) => {
    const d = new Date(selectedDate || new Date());
    d.setDate(d.getDate() + days);
    const dateStr = d.toISOString().slice(0, 10);
    handleDateChange(dateStr);
  };

  const handleRefresh = () => {
    if (activeTab === "today") {
      dispatch(fetchTodayCollections(selectedDate));
    } else {
      dispatch(fetchOverdueInstallmentsGlobal());
    }
  };

  const handleOpenPay = (installment) => {
    dispatch(clearInstallmentError());
    setPaySuccessMsg("");
    setPayTarget(installment);
  };

  // const handlePaySubmit = async ({ id, formData, penaltyAmount }) => {
  //   setPaySubmitting(true);
  //   try {
  //     // If there is an overdue penalty, ensure it is applied first so backend total_due matches
  //     if (penaltyAmount && Number(penaltyAmount) > 0) {
  //       try {
  //         await dispatch(
  //           applyPenaltyAction({
  //             id,
  //             formData: { penalty_amount: Number(penaltyAmount) },
  //           }),
  //         );
  //       } catch (penErr) {
  //         console.warn("Penalty application notice:", penErr);
  //       }
  //     }

  //     const action = await dispatch(payInstallmentAction({ id, formData }));
  //     if (payInstallmentAction.fulfilled.match(action)) {
  //       setPayTarget(null);
  //       setPaySuccessMsg(
  //         `Payment of ${formatCurrency(formData.paid_amount || formData.payment_amount)} recorded successfully!`,
  //       );
  //       setTimeout(() => setPaySuccessMsg(""), 5000);
  //       // Refresh collections
  //       loadData();
  //     }
  //   } finally {
  //     setPaySubmitting(false);
  //   }
  // };

  const handlePaySubmit = async ({ id, formData, penaltyAmount }) => {
    setPaySubmitting(true);
    try {
      // If there is an overdue penalty, ensure it is applied first so backend total_due matches
      if (penaltyAmount && Number(penaltyAmount) > 0) {
        try {
          await dispatch(
            applyPenaltyAction({
              id,
              formData: { penalty_amount: Number(penaltyAmount) },
            }),
          );
        } catch (penErr) {
          console.warn("Penalty application notice:", penErr);
        }
      }

      const action = await dispatch(payInstallmentAction({ id, formData }));
      if (payInstallmentAction.fulfilled.match(action)) {
        setPayTarget(null);

        // `action.payload` is whatever your payInstallmentAction thunk
        // resolves with — adjust these field reads to match its actual
        // shape (e.g. action.payload.data?.pending_amount instead of
        // action.payload.pending_amount, if your API wraps responses in
        // { data: ... }).
        const updated = action.payload?.data ?? action.payload ?? {};

        setPaySuccessData({
          amount: Number(formData.paid_amount || formData.payment_amount || 0),
          installmentNo: formData.installment_no ?? updated.installment_no,
          paymentDate:
            formData.payment_date || new Date().toISOString().slice(0, 10),
          paymentMode: formData.payment_mode,
          transactionReference: formData.transaction_reference,
          penaltyAmount: Number(penaltyAmount || 0),
          remainingBalance: updated.pending_amount,
          status: updated.status,
        });

        // Refresh collections
        loadData();
      }
    } finally {
      setPaySubmitting(false);
    }
  };

  const activeList = activeTab === "today" ? todayCollections : overdueGlobal;

  const filteredList = useMemo(() => {
    let list = activeList || [];

    // Filter by status (mainly on today tab)
    if (activeTab === "today" && statusFilter !== "all") {
      list = list.filter((inst) => {
        const bal = Number(inst.balance_amount ?? inst.total_due ?? 0);
        const st =
          inst.status ||
          (bal <= 0
            ? "paid"
            : Number(inst.paid_amount || 0) > 0
              ? "partial"
              : "pending");
        if (statusFilter === "pending") return st === "pending" || st === "overdue";
        if (statusFilter === "partial") return st === "partial";
        if (statusFilter === "paid") return st === "paid";
        return true;
      });
    }

    if (!search.trim()) return list;

    const q = search.toLowerCase();
    return list.filter((inst) => {
      const name = (
        inst.customer_name ||
        `${inst.first_name || ""} ${inst.last_name || ""}` ||
        ""
      ).toLowerCase();
      const loanNo = (inst.loan_no || "").toLowerCase();
      const mobile = inst.customer_mobile || inst.mobile || "";
      const custNo = (inst.customer_no || "").toLowerCase();
      return (
        name.includes(q) ||
        loanNo.includes(q) ||
        mobile.includes(q) ||
        custNo.includes(q) ||
        String(inst.loan_id).includes(q)
      );
    });
  }, [activeList, activeTab, statusFilter, search]);

  const {
    pagedData: pagedList,
    currentPage,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
    reset: resetPage,
  } = usePagination({ data: filteredList, initialSize: 15 });

  useEffect(() => {
    resetPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, statusFilter, search]);

  const isToday = selectedDate === new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <IndianRupee size={22} className="text-primary" />
            Collection Dashboard
          </h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            Daily worklist of installments due and overdue across all loans.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/loan-collections")}
            className="btn btn-ghost btn-sm gap-1.5 border border-base-300"
          >
            <Layers size={14} />
            Per-Loan View
          </button>
          <button
            onClick={handleRefresh}
            className="btn btn-outline btn-sm gap-1.5 border-base-300"
            title="Refresh list"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {paySuccessMsg && (
        <div className="alert alert-success text-sm py-2 shadow-sm animate-fade-in">
          <span>{paySuccessMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error text-sm py-2">
          <span>
            {typeof error === "string" ? error : "Something went wrong."}
          </span>
        </div>
      )}

      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-xs">
          <div className="text-xs text-base-content/50 flex items-center gap-1.5">
            <Calendar size={13} className="text-primary" />{" "}
            {isToday ? "Today's Due" : "Due on Selected Date"}
          </div>
          <div className="text-xl font-bold leading-tight mt-1 text-base-content">
            {formatCurrency(todaySummary?.total_due)}
          </div>
          <div className="text-[11px] text-base-content/40 mt-1">
            {todaySummary?.total_installments ?? todayCollections.length}{" "}
            installment(s)
          </div>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-xs">
          <div className="text-xs text-base-content/50 flex items-center gap-1.5">
            <AlertTriangle size={13} className="text-error" /> Total Overdue
          </div>
          <div className="text-xl font-bold leading-tight text-error mt-1">
            {formatCurrency(overdueGlobalSummary?.total_due)}
          </div>
          <div className="text-[11px] text-base-content/40 mt-1">
            {overdueGlobalSummary?.total_installments ?? overdueGlobal.length}{" "}
            installment(s) overdue
          </div>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-xs">
          <div className="text-xs text-base-content/50 flex items-center gap-1.5">
            <TrendingUp size={13} className="text-success" /> Collected Today
          </div>
          <div className="text-xl font-bold leading-tight text-success mt-1">
            {formatCurrency(todaySummary?.collected_today)}
          </div>
          <div className="text-[11px] text-base-content/40 mt-1">
            {todaySummary?.total_balance != null
              ? `Balance to collect: ${formatCurrency(todaySummary.total_balance)}`
              : "Cross-loan payments"}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-base-300 flex-wrap gap-2">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const count =
              tab.key === "today"
                ? todayCollections.length
                : overdueGlobal.length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-base-content/40 hover:text-base-content/70"
                }`}
              >
                <Icon size={14} />
                {tab.label}
                <span
                  className={`badge badge-xs font-bold ${
                    isActive ? "badge-primary" : "badge-ghost"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Date Navigator for Today Tab */}
        {activeTab === "today" && (
          <div className="flex items-center gap-1 pb-1">
            <button
              onClick={() => handleShiftDate(-1)}
              className="btn btn-ghost btn-xs btn-square rounded-lg border border-base-300"
              title="Previous Day"
            >
              <ChevronLeft size={14} />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="input input-bordered input-xs rounded-lg bg-base-100 font-medium"
            />
            <button
              onClick={() => handleShiftDate(1)}
              className="btn btn-ghost btn-xs btn-square rounded-lg border border-base-300"
              title="Next Day"
            >
              <ChevronRight size={14} />
            </button>
            {!isToday && (
              <button
                onClick={() =>
                  handleDateChange(new Date().toISOString().slice(0, 10))
                }
                className="btn btn-ghost btn-xs text-[11px] rounded-lg text-primary"
              >
                Today
              </button>
            )}
          </div>
        )}
      </div>

      {/* Toolbar & Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <label className="input input-sm input-bordered flex items-center gap-2 w-full sm:w-72 bg-base-100">
          <Search size={14} className="text-base-content/40 shrink-0" />
          <input
            type="text"
            className="grow"
            placeholder="Search customer, loan no, mobile…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        {activeTab === "today" && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-base-content/50 flex items-center gap-1 mr-1">
              <SlidersHorizontal size={12} /> Status:
            </span>
            {STATUS_FILTERS.map((sf) => (
              <button
                key={sf.key}
                onClick={() => setStatusFilter(sf.key)}
                className={`btn btn-xs rounded-lg ${
                  statusFilter === sf.key
                    ? "btn-neutral"
                    : "btn-ghost border border-base-300 text-base-content/70"
                }`}
              >
                {sf.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table + Pagination */}
      <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden shadow-xs">
        <CollectionTable
          installments={pagedList}
          loading={loading}
          showDaysOverdue={activeTab === "overdue"}
          canCollect={canCollect}
          onPay={(inst) => {
            if (!canCollect) return;
            handleOpenPay(inst);
          }}
          emptyMessage={
            activeTab === "today"
              ? isToday
                ? "No installments due today."
                : `No installments due on ${selectedDate}.`
              : "No overdue installments — everything's on track."
          }
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

      {/* Pay Modal for Direct Payment Recording */}
      <PayInstallmentModal
        open={Boolean(payTarget)}
        installment={payTarget}
        loading={paySubmitting}
        error={payTarget ? error : null}
        onClose={() => setPayTarget(null)}
        onSubmit={handlePaySubmit}
      />

      <PaymentSuccessModal
        open={Boolean(paySuccessData)}
        data={paySuccessData}
        onClose={() => setPaySuccessData(null)}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
