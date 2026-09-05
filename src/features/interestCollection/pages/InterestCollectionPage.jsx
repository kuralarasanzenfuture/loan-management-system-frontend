import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  AlertTriangle,
  Search,
  RefreshCw,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Coins,
  CheckCircle2,
  TrendingUp,
  FileBarChart2,
} from "lucide-react";
import {
  fetchTodayInterestCollections,
  fetchOverdueInterestCollectionsGlobal,
  clearInterestCollections,
} from "../../../redux/interestOnlySchedule/interestOnlyScheduleSlice.js";
import { addInterestOnlyPayment } from "../../../redux/interestOnlyPayment/interestOnlyPaymentSlice.js";
import { fetchCompanyDetails } from "../../../redux/companyDetails/companyDetailsSlice.js";
import InterestCollectionTable from "../components/InterestCollectionTable.jsx";
import InterestOnlyPaymentModal from "../../customerInterest/components/InterestOnlyPaymentModal.jsx";
import Pagination from "../../../common/components/Pagination/Pagination.jsx";
import usePagination from "../../../common/hooks/usePagination.js";
import usePermissions from "../../../common/hooks/usePermissions.js";
import { PERMISSIONS } from "../../../constants/permissions.js";
import { formatCurrency } from "../../customerInterest/utils/interestOnlyLoanHelpers.js";
import { printInterestReceipt } from "../../customerInterest/utils/printInterestReceipt.js";

const TABS = [
  { key: "today", label: "Today's Due", icon: Calendar },
  { key: "overdue", label: "Overdue Interest", icon: AlertTriangle },
];

const STATUS_FILTERS = [
  { key: "all", label: "All Dues" },
  { key: "pending", label: "Pending / Due" },
  { key: "partial", label: "Partial" },
  { key: "paid", label: "Paid" },
];

export default function InterestCollectionPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ── Global RBAC/PBAC Permissions ──────────────────────────────────────────────
  const { can } = usePermissions();
  const company = useSelector((state) => state.companyDetails?.company);
  const canView = can([
    PERMISSIONS.INTEREST_COLLECTION_VIEW,
    PERMISSIONS.LOAN_COLLECTION_VIEW,
    PERMISSIONS.COLLECTION_VIEW,
    PERMISSIONS.INTEREST_ONLY_LOAN_VIEW,
  ]);
  const canCollect = can([
    PERMISSIONS.INTEREST_COLLECTION_CREATE,
    PERMISSIONS.INTEREST_ONLY_PAYMENT_CREATE,
    PERMISSIONS.LOAN_COLLECTION_CREATE,
    PERMISSIONS.COLLECTION_CREATE,
    PERMISSIONS.LOAN_CREATE,
  ]);

  const {
    todayCollections = [],
    todaySummary = { total_due: 0, total_collected: 0, total_balance: 0, count: 0 },
    overdueCollections = [],
    overdueSummary = { count: 0, total_overdue_amount: 0 },
    collectionLoading,
    collectionError,
  } = useSelector((state) => state.interestOnlySchedules);

  const [activeTab, setActiveTab] = useState("today");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Payment Modal state
  const [payTargetLoan, setPayTargetLoan] = useState(null);
  const [payInitialValues, setPayInitialValues] = useState(null);
  const [paySuccessMsg, setPaySuccessMsg] = useState("");

  const loadData = () => {
    dispatch(
      fetchTodayInterestCollections({
        date: selectedDate,
        status: statusFilter,
        search,
      }),
    );
    dispatch(fetchOverdueInterestCollectionsGlobal(search));
  };

  useEffect(() => {
    loadData();
    dispatch(fetchCompanyDetails());
    return () => {
      dispatch(clearInterestCollections());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, selectedDate, statusFilter]);

  // Debounced backend search
  useEffect(() => {
    const t = setTimeout(() => {
      loadData();
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Date shifting
  const handleShiftDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const isToday = selectedDate === new Date().toISOString().slice(0, 10);

  // Active list based on selected tab
  const activeList = activeTab === "today" ? todayCollections : overdueCollections;

  // Client-side quick filter across customer name, mobile, loan no, customer no
  const filteredList = useMemo(() => {
    let list = Array.isArray(activeList) ? activeList : [];

    if (activeTab === "today" && statusFilter !== "all") {
      list = list.filter((item) => {
        const st = (item.status || "pending").toLowerCase();
        if (statusFilter === "pending") return st === "pending" || st === "overdue";
        if (statusFilter === "partial") return st === "partial";
        if (statusFilter === "paid") return st === "paid";
        return true;
      });
    }

    if (!search.trim()) return list;

    const q = search.toLowerCase().trim();
    return list.filter((item) => {
      const name = (
        item.customer_name ||
        `${item.first_name || ""} ${item.last_name || ""}` ||
        ""
      ).toLowerCase();
      const loanNo = (item.loan_no || "").toLowerCase();
      const mobile = (item.customer_mobile || item.mobile || "").toString();
      const custNo = (item.customer_no || "").toLowerCase();
      const schedNo = String(item.schedule_no || "");
      return (
        name.includes(q) ||
        loanNo.includes(q) ||
        mobile.includes(q) ||
        custNo.includes(q) ||
        schedNo.includes(q)
      );
    });
  }, [activeList, activeTab, statusFilter, search]);

  // Pagination
  const {
    pagedData,
    currentPage,
    pageSize,
    totalItems,
    setPage,
    setPageSize,
    reset: resetPage,
  } = usePagination({ data: filteredList, initialSize: 15 });

  // Reset page when switching tabs, filter, or search
  useEffect(() => {
    resetPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, statusFilter, search]);

  // Open Payment Modal pre-filled
  const handleOpenCollect = (row) => {
    const outstandingInt =
      row.outstanding_interest != null
        ? Number(row.outstanding_interest)
        : Number(row.balance_amount || 0);
    const outstandingPrin =
      row.outstanding_principal != null
        ? Number(row.outstanding_principal)
        : Number(row.loan_principal || 0);
    const totalDue =
      row.total_payable != null
        ? Number(row.total_payable)
        : Number((outstandingInt + outstandingPrin).toFixed(2));

    const mockLoan = {
      id: row.loan_id,
      loan_no: row.loan_no,
      customer_name:
        row.customer_name ||
        `${row.first_name || ""} ${row.last_name || ""}`.trim() ||
        "Customer",
      customer_id: row.customer_id,
      schedule_id: row.id,
      schedule_no: row.schedule_no,
      schedule_due: Number(row.balance_amount || row.total_due || 0),
      outstanding_interest: outstandingInt,
      outstanding_principal: outstandingPrin,
      total_payable: totalDue,
    };

    setPayTargetLoan(mockLoan);
    setPayInitialValues({
      payment_amount: row.balance_amount,
      schedule_id: row.id,
      schedule_no: row.schedule_no,
      schedule_due: Number(row.balance_amount || row.total_due || 0),
      remarks: `Repayment for ${row.loan_no} Schedule #${row.schedule_no}`,
    });
  };

  // Submit payment
  const handlePaymentSubmit = async (payload) => {
    const res = await dispatch(addInterestOnlyPayment(payload));
    if (!res.error) {
      loadData();
      return { success: true, data: res.payload?.data || res.payload };
    } else {
      return { success: false, error: res.payload || "Failed to record payment" };
    }
  };

  const handlePrintScheduleReceipt = (row) => {
    printInterestReceipt({
      loan: {
        id: row.loan_id,
        loan_no: row.loan_no,
        customer_name:
          row.customer_name ||
          `${row.first_name || ""} ${row.last_name || ""}`.trim() ||
          "Customer",
        customer_mobile: row.customer_mobile || row.mobile,
      },
      payment: {
        payment_amount: Number(row.paid_amount || row.interest_amount),
        payment_date: row.paid_date || new Date().toISOString().slice(0, 10),
        payment_mode: "Cash",
        schedule_no: row.schedule_no,
      },
      allocations: [
        {
          schedule_no: row.schedule_no,
          due_date: row.due_date,
          type: "interest",
          amount: Number(row.paid_amount || row.interest_amount),
        },
      ],
      company: company || {},
      remainingOutstanding: Number(row.balance_amount || 0),
    });
  };

  // RBAC Access Guard
  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
        <span className="flex items-center justify-center w-14 h-14 rounded-full bg-error/10 text-error">
          <ShieldAlert size={28} />
        </span>
        <h2 className="text-lg font-bold">Access Restricted</h2>
        <p className="text-sm text-base-content/50 max-w-sm">
          You do not have permission to view the Interest Collection Module.
          Please contact your administrator if you need access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Top Header ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Coins size={22} className="text-primary" />
            Interest Collection Dashboard
          </h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            Daily worklist of interest dues and overdue installments across customer loans.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/reports/interest-collections")}
            className="btn btn-ghost btn-sm gap-1.5 border border-base-300"
          >
            <FileBarChart2 size={14} />
            Collection Reports
          </button>
          <button
            onClick={loadData}
            disabled={collectionLoading}
            className="btn btn-outline btn-sm gap-1.5 border-base-300"
            title="Refresh list"
          >
            <RefreshCw
              size={14}
              className={collectionLoading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {paySuccessMsg && (
        <div className="alert alert-success text-sm py-2 shadow-sm animate-fade-in flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{paySuccessMsg}</span>
        </div>
      )}

      {/* Error Banner */}
      {collectionError && (
        <div className="alert alert-error text-sm py-2">
          <span>{typeof collectionError === "string" ? collectionError : "Failed to load collection data."}</span>
        </div>
      )}

      {/* ── KPI Summary Cards (Matched with collection dashboard) ───────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today Due */}
        <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-xs">
          <div className="text-xs text-base-content/50 flex items-center gap-1.5">
            <Calendar size={13} className="text-primary" />{" "}
            {isToday ? "Today's Due" : `Due on ${selectedDate}`}
          </div>
          <div className="text-xl font-bold leading-tight mt-1 text-base-content">
            {formatCurrency(todaySummary?.total_due || 0)}
          </div>
          <div className="text-[11px] text-base-content/40 mt-1">
            {todaySummary?.count ?? todayCollections.length} scheduled installment(s)
          </div>
        </div>

        {/* Total Overdue */}
        <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-xs">
          <div className="text-xs text-base-content/50 flex items-center gap-1.5">
            <AlertTriangle size={13} className="text-error" /> Total Overdue
          </div>
          <div className="text-xl font-bold leading-tight text-error mt-1">
            {formatCurrency(overdueSummary?.total_overdue_amount || 0)}
          </div>
          <div className="text-[11px] text-base-content/40 mt-1">
            {overdueSummary?.count ?? overdueCollections.length} installment(s) overdue
          </div>
        </div>

        {/* Collected Today */}
        <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-xs">
          <div className="text-xs text-base-content/50 flex items-center gap-1.5">
            <TrendingUp size={13} className="text-success" /> Collected
          </div>
          <div className="text-xl font-bold leading-tight text-success mt-1">
            {formatCurrency(todaySummary?.total_collected || 0)}
          </div>
          <div className="text-[11px] text-base-content/40 mt-1">
            Recorded against {selectedDate}
          </div>
        </div>

        {/* Pending Balance */}
        <div className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-xs">
          <div className="text-xs text-base-content/50 flex items-center gap-1.5">
            <IndianRupee size={13} className="text-warning" /> Pending Balance
          </div>
          <div className="text-xl font-bold leading-tight text-warning mt-1">
            {formatCurrency(todaySummary?.total_balance || 0)}
          </div>
          <div className="text-[11px] text-base-content/40 mt-1">
            Remaining due for {selectedDate}
          </div>
        </div>
      </div>

      {/* ── Main Container: Tabs & Table ───────────────────────────────────── */}
      <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
        {/* Tab Header Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between px-5 py-3.5 border-b border-base-300 gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              const count =
                tab.key === "today"
                  ? (todaySummary?.count ?? todayCollections.length)
                  : (overdueSummary?.count ?? overdueCollections.length);

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                    isActive
                      ? "bg-primary text-primary-content font-semibold shadow-xs"
                      : "text-base-content/60 hover:bg-base-200"
                  }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span
                      className={`badge badge-xs font-semibold ${
                        isActive
                          ? "badge-neutral"
                          : tab.key === "overdue"
                            ? "badge-error text-white"
                            : "badge-ghost"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2">
            <label className="input input-bordered input-sm flex items-center gap-2 rounded-xl w-full sm:w-64">
              <Search size={14} className="text-base-content/40 shrink-0" />
              <input
                type="text"
                placeholder="Search customer, loan #…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="grow text-xs"
              />
            </label>
          </div>
        </div>

        {/* Controls Bar for Today tab */}
        {activeTab === "today" && (
          <div className="px-5 py-3 bg-base-200/40 border-b border-base-300 flex flex-wrap items-center justify-between gap-3">
            {/* Date Navigator */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleShiftDate(-1)}
                className="btn btn-ghost btn-xs btn-square border border-base-300"
                title="Previous Day"
              >
                <ChevronLeft size={14} />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input input-bordered input-xs font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => handleShiftDate(1)}
                className="btn btn-ghost btn-xs btn-square border border-base-300"
                title="Next Day"
              >
                <ChevronRight size={14} />
              </button>
              {!isToday && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedDate(new Date().toISOString().slice(0, 10))
                  }
                  className="btn btn-ghost btn-xs text-[11px] text-primary"
                >
                  Today
                </button>
              )}
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key)}
                  className={`btn btn-xs rounded-lg font-medium ${
                    statusFilter === f.key
                      ? "btn-neutral"
                      : "btn-ghost text-base-content/60"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Table Content */}
        <InterestCollectionTable
          items={pagedData}
          loading={collectionLoading}
          isOverdueTab={activeTab === "overdue"}
          canCollect={canCollect}
          onCollect={handleOpenCollect}
          onPrintReceipt={handlePrintScheduleReceipt}
        />

        {/* Pagination Footer */}
        {totalItems > 0 && (
          <div className="p-4 border-t border-base-300">
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </div>

      {/* ── Payment Modal ──────────────────────────────────────────────────── */}
      {payTargetLoan && (
        <InterestOnlyPaymentModal
          open={Boolean(payTargetLoan)}
          loan={payTargetLoan}
          company={company}
          initialValues={payInitialValues}
          onClose={() => {
            setPayTargetLoan(null);
            setPayInitialValues(null);
          }}
          onSubmit={handlePaymentSubmit}
        />
      )}
    </div>
  );
}
