import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  Plus,
  Percent,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Award,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  fetchDashboardOverview,
  fetchPortfolioTrends,
  fetchLoanPlanMix,
  fetchPortfolioHealth,
  fetchRecentLoans,
  fetchQuickInsights,
  fetchTopLoanOfficers,
} from "../../../redux/dashboard/dashboardSlice.js";
import { fetchInterestOnlyLoans } from "../../../redux/interestOnlyLoans/interestLoanSlice.js";
import { fetchInterestCollectionReports } from "../../../redux/interestOnlyPayment/interestOnlyPaymentSlice.js";
import { fetchInterestOnlyLoanPlans } from "../../../redux/interestLoanPlan/interestLoanPlanSlice.js";

const PLAN_COLORS = [
  "#C7A248",
  "#1F3F60",
  "#4C9A6A",
  "#3B82F6",
  "#94A3B8",
  "#B3483F",
];

const STATUS_BADGE = {
  active: "badge-success",
  pending: "badge-warning",
  overdue: "badge-error",
  closed: "badge-ghost",
  default: "badge-error",
  defaulted: "badge-error",
  rejected: "badge-error",
  completed: "badge-success",
  cancelled: "badge-ghost",
};

function formatCurrency(value) {
  const n = Number(value) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatCompactCurrency(val) {
  const num = Number(val) || 0;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(0)}k`;
  return `₹${num}`;
}

function formatMonthLabel(monthStr) {
  if (!monthStr) return "";
  const parts = String(monthStr).split("-");
  if (parts.length === 2) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    }
  }
  return String(monthStr);
}

function initials(a = "", b = "") {
  return `${a?.[0] || ""}${b?.[0] || ""}`.toUpperCase() || "?";
}

function ChartTooltip({ active, payload, label, prefix = "", suffix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-base-300 bg-base-100 shadow-lg px-3.5 py-2.5 text-xs space-y-1.5 min-w-[140px]">
      <p className="font-semibold text-base-content border-b border-base-200 pb-1">
        {label}
      </p>
      {payload.map((p) => (
        <div key={p.dataKey || p.name} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: p.color || p.fill }}
            />
            <span className="text-base-content/70 capitalize">
              {p.name || p.dataKey}:
            </span>
          </div>
          <span className="font-bold text-base-content">
            {prefix}
            {typeof p.value === "number" ? p.value.toLocaleString("en-IN") : p.value}
            {suffix}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loanType, setLoanType] = useState("all"); // "all" | "regular" | "interest_only"

  const {
    overview,
    portfolioTrends,
    loanPlanMix,
    portfolioHealth,
    recentLoans,
    quickInsights,
    topLoanOfficers,
    loading,
    error,
  } = useSelector((state) => state.dashboard);

  const { loans: rawInterestLoans = [] } = useSelector(
    (state) => state.interestOnlyLoans || {},
  );
  const interestLoans = Array.isArray(rawInterestLoans) ? rawInterestLoans : [];

  const { reports: rawInterestPayments = [] } = useSelector(
    (state) => state.interestOnlyPayments || {},
  );
  const interestPayments = Array.isArray(rawInterestPayments) ? rawInterestPayments : [];

  useEffect(() => {
    dispatch(fetchDashboardOverview({ loan_type: loanType }));
    dispatch(fetchPortfolioTrends({ loan_type: loanType }));
    dispatch(fetchLoanPlanMix({ loan_type: loanType }));
    dispatch(fetchPortfolioHealth({ loan_type: loanType }));
    dispatch(fetchRecentLoans({ loan_type: loanType }));
    dispatch(fetchQuickInsights({ loan_type: loanType }));
    dispatch(fetchTopLoanOfficers({ loan_type: loanType }));

    dispatch(fetchInterestOnlyLoans());
    dispatch(fetchInterestCollectionReports());
    dispatch(fetchInterestOnlyLoanPlans());
  }, [dispatch, loanType]);

  // ---- Interest-only loans computed overview ----
  const interestOverview = useMemo(() => {
    const activeList = interestLoans.filter((l) => l.status === "active");
    const activePortfolio = activeList.reduce(
      (sum, l) => sum + (Number(l.principal_amount) || 0),
      0,
    );
    const activeBorrowersSet = new Set(
      activeList.map((l) => l.customer_id).filter(Boolean),
    );
    const avgLoanSize =
      activeList.length > 0 ? activePortfolio / activeList.length : 0;

    const outstandingReceivables = activeList.reduce(
      (sum, l) =>
        sum +
        (Number(l.outstanding_principal) || 0) +
        (Number(l.outstanding_interest) || 0),
      0,
    );

    const overdueList = interestLoans.filter(
      (l) => l.status === "default" || l.status === "overdue",
    );
    const overdueAmount = overdueList.reduce(
      (sum, l) =>
        sum +
        (Number(l.outstanding_principal) || 0) +
        (Number(l.outstanding_interest) || 0),
      0,
    );

    const totalPaid = interestLoans.reduce(
      (sum, l) =>
        sum +
        (Number(l.total_interest_paid) || 0) +
        (Number(l.total_principal_paid) || 0),
      0,
    );

    const totalDue = interestLoans.reduce(
      (sum, l) => sum + (Number(l.total_payable) || 0),
      0,
    );

    const collectionRate =
      totalDue > 0 ? Number(((totalPaid / totalDue) * 100).toFixed(2)) : 0;

    return {
      active_portfolio: activePortfolio,
      active_loans: activeList.length,
      active_borrowers: activeBorrowersSet.size,
      average_loan_size: avgLoanSize,
      outstanding_receivables: outstandingReceivables,
      overdue_amount: overdueAmount,
      total_paid: totalPaid,
      total_due: totalDue,
      collection_rate: collectionRate,
    };
  }, [interestLoans]);

  // ---- Effective merged overview ----
  const effectiveOverview = useMemo(() => {
    if (loanType === "regular") return overview;
    if (loanType === "interest_only") return interestOverview;

    if (!overview && !interestOverview) return null;
    const reg = overview || {};
    const int = interestOverview || {};

    const activePortfolio =
      (Number(reg.active_portfolio) || 0) + (Number(int.active_portfolio) || 0);
    const activeLoans =
      (Number(reg.active_loans) || 0) + (Number(int.active_loans) || 0);
    const activeBorrowers =
      (Number(reg.active_borrowers) || 0) + (Number(int.active_borrowers) || 0);
    const averageLoanSize =
      activeLoans > 0 ? activePortfolio / activeLoans : 0;
    const outstandingReceivables =
      (Number(reg.outstanding_receivables) || 0) +
      (Number(int.outstanding_receivables) || 0);
    const overdueAmount =
      (Number(reg.overdue_amount) || 0) + (Number(int.overdue_amount) || 0);
    const totalPaid =
      (Number(reg.total_paid) || 0) + (Number(int.total_paid) || 0);
    const totalDue =
      (Number(reg.total_due) || 0) + (Number(int.total_due) || 0);
    const collectionRate =
      totalDue > 0 ? Number(((totalPaid / totalDue) * 100).toFixed(2)) : 0;

    return {
      active_portfolio: activePortfolio,
      active_loans: activeLoans,
      active_borrowers: activeBorrowers,
      average_loan_size: averageLoanSize,
      outstanding_receivables: outstandingReceivables,
      overdue_amount: overdueAmount,
      total_paid: totalPaid,
      total_due: totalDue,
      collection_rate: collectionRate,
    };
  }, [overview, interestOverview, loanType]);

  // ---- KPI cards ----
  const kpiCards = useMemo(() => {
    if (!effectiveOverview) return [];
    return [
      {
        title: "Active Portfolio",
        value: formatCurrency(effectiveOverview.active_portfolio),
        sub: `${effectiveOverview.active_loans || 0} active loans`,
        icon: DollarSign,
        iconColor: "text-primary bg-primary/10",
      },
      {
        title: "Active Borrowers",
        value: (effectiveOverview.active_borrowers || 0).toLocaleString("en-IN"),
        sub: `Avg loan ${formatCurrency(effectiveOverview.average_loan_size)}`,
        icon: Users,
        iconColor: "text-success bg-success/10",
      },
      {
        title: "Outstanding Receivables",
        value: formatCurrency(effectiveOverview.outstanding_receivables),
        sub: `${formatCurrency(effectiveOverview.overdue_amount)} overdue`,
        icon: FileText,
        iconColor: "text-info bg-info/10",
      },
      {
        title: "Collection Rate",
        value: `${effectiveOverview.collection_rate || 0}%`,
        sub: `${formatCurrency(effectiveOverview.total_paid)} of ${formatCurrency(effectiveOverview.total_due)}`,
        icon: Percent,
        iconColor: "text-warning bg-warning/10",
      },
    ];
  }, [effectiveOverview]);

  // ---- Merge portfolio / collections / overdue trend arrays by month ----
  const trendData = useMemo(() => {
    const byMonth = {};

    if (loanType === "all" || loanType === "regular") {
      const {
        portfolio = [],
        collections = [],
        overdue = [],
      } = portfolioTrends || {};

      portfolio.forEach((r) => {
        if (!r.month) return;
        byMonth[r.month] = {
          month: r.month,
          disbursed: Number(r.disbursed_amount) || 0,
          loan_count: Number(r.loan_count) || 0,
          collected: 0,
          overdue: 0,
        };
      });

      collections.forEach((r) => {
        if (!r.month) return;
        byMonth[r.month] = {
          ...(byMonth[r.month] || {
            month: r.month,
            disbursed: 0,
            loan_count: 0,
            overdue: 0,
          }),
          collected: Number(r.collected_amount) || 0,
        };
      });

      overdue.forEach((r) => {
        if (!r.month) return;
        byMonth[r.month] = {
          ...(byMonth[r.month] || {
            month: r.month,
            disbursed: 0,
            loan_count: 0,
            collected: 0,
          }),
          overdue: Number(r.overdue_amount) || 0,
        };
      });
    }

    if (loanType === "all" || loanType === "interest_only") {
      interestLoans.forEach((l) => {
        if (!l.start_date) return;
        const m = String(l.start_date).slice(0, 7);
        if (!m || m.length < 7) return;
        if (!byMonth[m]) {
          byMonth[m] = { month: m, disbursed: 0, loan_count: 0, collected: 0, overdue: 0 };
        }
        byMonth[m].disbursed += Number(l.principal_amount) || 0;
        byMonth[m].loan_count += 1;
      });

      interestPayments.forEach((p) => {
        if (!p.payment_date) return;
        const m = String(p.payment_date).slice(0, 7);
        if (!m || m.length < 7) return;
        if (!byMonth[m]) {
          byMonth[m] = { month: m, disbursed: 0, loan_count: 0, collected: 0, overdue: 0 };
        }
        byMonth[m].collected += Number(p.payment_amount) || 0;
      });
    }

    return Object.values(byMonth)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((r) => ({ ...r, monthLabel: formatMonthLabel(r.month) }));
  }, [portfolioTrends, interestLoans, interestPayments, loanType]);

  const loanPlanMixData = useMemo(() => {
    const plans = [];

    if (loanType === "all" || loanType === "regular") {
      (loanPlanMix || []).forEach((p) => {
        plans.push({
          name: p.plan_name,
          category: "EMI",
          amount: Number(p.total_loan_amount) || 0,
        });
      });
    }

    if (loanType === "all" || loanType === "interest_only") {
      const planTotals = {};
      interestLoans.forEach((l) => {
        const planName = l.plan_name || "Interest Plan";
        planTotals[planName] =
          (planTotals[planName] || 0) + (Number(l.principal_amount) || 0);
      });

      Object.entries(planTotals).forEach(([name, amount]) => {
        plans.push({
          name: loanType === "all" ? `${name} (Interest)` : name,
          category: "Interest",
          amount,
        });
      });
    }

    const totalAmount = plans.reduce((sum, p) => sum + p.amount, 0);

    return plans
      .sort((a, b) => b.amount - a.amount)
      .map((p, i) => ({
        ...p,
        value:
          totalAmount > 0 ? Number(((p.amount / totalAmount) * 100).toFixed(1)) : 0,
        color: PLAN_COLORS[i % PLAN_COLORS.length],
      }));
  }, [loanPlanMix, interestLoans, loanType]);

  const combinedRecentLoans = useMemo(() => {
    const regularList = (recentLoans || []).map((l) => ({
      ...l,
      loan_type: "regular",
    }));

    const interestList = interestLoans.map((l) => ({
      id: l.id,
      loan_no: l.loan_no,
      loan_amount: l.principal_amount,
      status: l.status,
      created_at: l.created_at,
      first_name:
        l.first_name || l.customer_name?.split(" ")[0] || "Customer",
      last_name:
        l.last_name ||
        l.customer_name?.split(" ").slice(1).join(" ") ||
        "",
      mobile: l.mobile || l.customer_mobile || "—",
      loan_type: "interest_only",
    }));

    let list = [];
    if (loanType === "regular") {
      list = regularList;
    } else if (loanType === "interest_only") {
      list = interestList;
    } else {
      list = [...regularList, ...interestList];
    }

    return list
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 10);
  }, [recentLoans, interestLoans, loanType]);

  const onTimeRate = Number(portfolioHealth?.on_time_payment_rate) || 0;
  const nplRatio = Number(portfolioHealth?.npl_ratio) || 0;

  const COLOR_CLASSES = {
    success: { text: "text-success", bg: "bg-success" },
    warning: { text: "text-warning", bg: "bg-warning" },
    error: { text: "text-error", bg: "bg-error" },
  };

  const onTimeColor =
    COLOR_CLASSES[
      onTimeRate >= 90 ? "success" : onTimeRate >= 70 ? "warning" : "error"
    ];
  const nplColor =
    COLOR_CLASSES[
      nplRatio < 2 ? "success" : nplRatio <= 5 ? "warning" : "error"
    ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-base-content">
            Dashboard
          </h1>
          <p className="text-sm text-base-content/50 mt-1 max-w-xl">
            Welcome back. High-level portfolio overview across standard EMI and interest-only loans.
          </p>
        </div>

        {/* Primary Action Controls & Filter Tabs */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          {/* Segmented Filter Tabs */}
          <div className="join bg-base-200/80 p-0.5 sm:p-1 rounded-xl border border-base-300/80 shrink-0">
            {[
              { key: "all", label: "All Loans" },
              { key: "regular", label: "Regular EMI" },
              { key: "interest_only", label: "Interest-Only" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setLoanType(tab.key)}
                className={`join-item btn btn-xs sm:btn-sm rounded-lg border-none px-2.5 sm:px-3.5 transition-all ${
                  loanType === tab.key
                    ? "btn-primary shadow-xs font-bold"
                    : "btn-ghost text-base-content/70 hover:text-base-content"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Action Buttons Group */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate("/loan-reports")}
              className="btn btn-outline btn-sm rounded-xl border-base-300 gap-1.5"
            >
              <FileText size={15} />
              <span>Reports</span>
            </button>
            <button
              onClick={() => navigate("/interest-only-loans")}
              className="btn btn-outline btn-sm rounded-xl border-base-300 gap-1.5"
              title="Manage Interest-Only Loans"
            >
              <Percent size={14} />
              <span>Interest Loans</span>
            </button>
            <button
              onClick={() => navigate("/loan-applications")}
              className="btn btn-primary btn-sm rounded-xl gap-1.5 shadow-md shadow-primary/20"
            >
              <Plus size={16} />
              <span>New Application</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error text-sm py-2">
          <span>
            {typeof error === "string"
              ? error
              : "Failed to load dashboard data."}
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {loading && !overview
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="card bg-base-100 border border-base-300 rounded-2xl p-5 h-[104px] animate-pulse"
              />
            ))
          : kpiCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="card bg-base-100 border border-base-300 shadow-xs rounded-2xl overflow-hidden p-5 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                        {card.title}
                      </span>
                      <p className="text-2xl font-bold text-base-content tracking-tight">
                        {card.value}
                      </p>
                    </div>
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${card.iconColor}`}
                    >
                      <Icon size={18} className="stroke-[2.2]" />
                    </div>
                  </div>
                  <p className="text-[11px] text-base-content/40 mt-4">
                    {card.sub}
                  </p>
                </div>
              );
            })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disbursement vs Collections trend */}
        <div className="card bg-base-100 border border-base-300 shadow-xs rounded-2xl lg:col-span-2 overflow-hidden p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm tracking-tight">
                Disbursement vs Collections
              </h3>
              <p className="text-[11px] text-base-content/40 mt-0.5">
                Monthly disbursed vs collected amounts
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C7A248]" />
                Disbursed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1F3F60]" />
                Collected
              </span>
            </div>
          </div>

          {trendData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[260px] text-base-content/40 text-xs">
              No trend data recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={trendData}
                margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="disbursedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C7A248" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#C7A248" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="collectedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1F3F60" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#1F3F60" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  className="text-base-300"
                />
                <XAxis
                  dataKey="monthLabel"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  className="fill-base-content/50"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatCompactCurrency}
                  className="fill-base-content/50"
                />
                <Tooltip content={<ChartTooltip prefix="₹" />} />
                <Area
                  type="monotone"
                  dataKey="disbursed"
                  name="Disbursed"
                  stroke="#C7A248"
                  strokeWidth={2}
                  fill="url(#disbursedFill)"
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  name="Collected"
                  stroke="#1F3F60"
                  strokeWidth={2}
                  fill="url(#collectedFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Loan Plan Mix */}
        <div className="card bg-base-100 border border-base-300 shadow-xs rounded-2xl overflow-hidden p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm tracking-tight mb-1">
              Loan Plan Mix
            </h3>
            <p className="text-[11px] text-base-content/40 mb-2">
              Share of active loan volume by plan
            </p>
          </div>

          {loanPlanMixData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-xs text-base-content/40">
              No loan plan data yet.
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie
                    data={loanPlanMixData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {loanPlanMixData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip suffix="%" />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2 max-h-36 overflow-y-auto">
                {loanPlanMixData.map((item, i) => (
                  <div
                    key={`${item.name}-${i}`}
                    className="flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: item.color }}
                      />
                      <span className="text-base-content/70 truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-semibold text-base-content shrink-0">
                      {item.value}% ({formatCompactCurrency(item.amount)})
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Collections vs Overdue (full width) */}
      <div className="card bg-base-100 border border-base-300 shadow-xs rounded-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-sm tracking-tight">
              Collections vs Overdue
            </h3>
            <p className="text-[11px] text-base-content/40 mt-0.5">
              Monthly collected amount against overdue balance
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4C9A6A]" />
              Collected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B3483F]" />
              Overdue
            </span>
          </div>
        </div>

        {trendData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[240px] text-base-content/40 text-xs">
            No collection records yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={trendData}
              margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="text-base-300"
              />
              <XAxis
                dataKey="monthLabel"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                className="fill-base-content/50"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCompactCurrency}
                className="fill-base-content/50"
              />
              <Tooltip content={<ChartTooltip prefix="₹" />} />
              <Bar dataKey="collected" name="Collected" fill="#4C9A6A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="overdue" name="Overdue" fill="#B3483F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Grid: Recent Loans & Portfolio Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Loans */}
        <div className="card bg-base-100 border border-base-300 shadow-xs rounded-2xl lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 bg-base-200/10">
            <h3 className="font-bold text-sm tracking-tight">Recent Loans</h3>
            <button
              onClick={() =>
                navigate(
                  loanType === "interest_only"
                    ? "/interest-only-loans"
                    : "/loan-applications",
                )
              }
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              View all
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="table table-sm w-full">
              <thead>
                <tr className="bg-transparent border-b border-base-200">
                  <th className="py-3 px-6 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                    Borrower
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                    Loan No. &amp; Amount
                  </th>
                  <th className="py-3 px-6 text-center text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-6 text-right text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-100">
                {loading && combinedRecentLoans.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-10 text-center text-xs text-base-content/40"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : combinedRecentLoans.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-10 text-center text-xs text-base-content/40"
                    >
                      No recent loans.
                    </td>
                  </tr>
                ) : (
                  combinedRecentLoans.map((loan) => (
                    <tr
                      key={`${loan.loan_type}-${loan.id}`}
                      onClick={() => {
                        if (loan.loan_type === "interest_only") {
                          navigate(`/interest-only-loans/${loan.id}`);
                        } else {
                          navigate(`/loans/${loan.id}`);
                        }
                      }}
                      className="hover:bg-base-200/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                            {initials(loan.first_name, loan.last_name)}
                          </div>
                          <div className="flex flex-col min-w-0 leading-tight">
                            <span className="text-xs font-bold text-base-content">
                              {loan.first_name} {loan.last_name}
                            </span>
                            <span className="text-[10px] text-base-content/40 truncate">
                              {loan.mobile || "—"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 leading-tight">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-base-content">
                            {formatCurrency(loan.loan_amount)}
                          </p>
                          <span
                            className={`badge badge-xs font-semibold text-[9px] ${
                              loan.loan_type === "interest_only"
                                ? "badge-info text-info-content"
                                : "badge-ghost"
                            }`}
                          >
                            {loan.loan_type === "interest_only"
                              ? "Interest"
                              : "EMI"}
                          </span>
                        </div>
                        <p className="text-[10px] text-base-content/40 font-mono">
                          {loan.loan_no}
                        </p>
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <span
                          className={`badge badge-sm font-semibold rounded-lg px-2.5 py-1 capitalize ${STATUS_BADGE[loan.status] || "badge-ghost"}`}
                        >
                          {loan.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right text-[11px] font-semibold text-base-content/40">
                        {loan.created_at
                          ? new Date(loan.created_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Portfolio Health Insights */}
        <div className="card bg-base-100 border border-base-300 shadow-xs rounded-2xl overflow-hidden p-6 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-base-200 pb-3">
              <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-primary" />
                Portfolio Health
              </h3>
            </div>

            <div className="space-y-5 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-base-content/70">
                    On-time Payment Rate
                  </span>
                  <span className={`font-bold ${onTimeColor.text}`}>
                    {onTimeRate}%
                  </span>
                </div>
                <div className="w-full bg-base-200 h-2.5 rounded-full overflow-hidden border border-base-300">
                  <div
                    className={`${onTimeColor.bg} h-full rounded-full transition-all`}
                    style={{ width: `${Math.min(onTimeRate, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-base-content/70">
                    NPL Ratio
                  </span>
                  <span className={`font-bold ${nplColor.text}`}>{nplRatio}%</span>
                </div>
                <div className="w-full bg-base-200 h-2.5 rounded-full overflow-hidden border border-base-300">
                  <div
                    className={`${nplColor.bg} h-full rounded-full transition-all`}
                    style={{ width: `${Math.min(nplRatio * 10, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-base-content/40">
                  Active capital at risk:{" "}
                  {formatCurrency(portfolioHealth?.active_capital)}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`rounded-xl p-4 space-y-2 border ${nplRatio < 2 ? "bg-success/5 border-success/20" : "bg-warning/5 border-warning/20"}`}
          >
            <h4
              className={`text-xs font-bold flex items-center gap-1.5 ${nplRatio < 2 ? "text-success" : "text-warning"}`}
            >
              {nplRatio < 2 ? (
                <TrendingUp size={14} />
              ) : (
                <AlertTriangle size={14} />
              )}
              {nplRatio < 2
                ? "Portfolio in good health"
                : "NPL ratio needs attention"}
            </h4>
            <p className="text-[11px] text-base-content/60 leading-relaxed">
              {nplRatio < 2
                ? `Non-performing loans sit at ${nplRatio}%, well within a healthy range.`
                : `Non-performing loans are at ${nplRatio}% — consider reviewing overdue accounts.`}
            </p>
          </div>
        </div>
      </div>

      {/* Top Loan Officers Leaderboard */}
      <div className="card bg-base-100 border border-base-300 shadow-xs rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 bg-base-200/10">
          <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
            <Award size={16} className="text-warning" />
            Top Loan Officers
          </h3>
          <button
            onClick={() => navigate("/loan-reports")}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            View all
            <ArrowUpRight size={13} />
          </button>
        </div>
        {topLoanOfficers.length === 0 ? (
          <p className="text-xs text-base-content/40 text-center py-10">
            No loan officer data yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-base-200">
            {topLoanOfficers.map((officer, i) => (
              <div key={officer.id || i} className="flex items-center gap-3 p-5">
                <div className="relative shrink-0">
                  <div className="flex items-center justify-center w-11 h-11 rounded-full bg-primary/10 text-primary text-sm font-bold">
                    {officer.username?.[0]?.toUpperCase() || "?"}
                  </div>
                  <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary text-primary-content text-[10px] font-bold flex items-center justify-center ring-2 ring-base-100">
                    {i + 1}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-base-content truncate">
                    {officer.username}
                  </p>
                  <p className="text-[11px] text-base-content/40">
                    {officer.total_loans} loans ·{" "}
                    {formatCurrency(officer.total_amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
