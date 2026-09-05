import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  TrendingUp,
  Wallet,
  PiggyBank,
  Users,
  RefreshCcw,
  Download,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { PageHeader } from "./Common.jsx";
import {
  CollectionAreaChart,
  WeeklyBarChart,
  MonthlyLineChart,
  DistributionPieChart,
  VillageBarChart,
  GrowthAreaChart,
} from "../components/Charts.jsx";
import { fetchDashboard } from "../../../redux/analytics/analyticsSlice.js";
import { fetchInterestOnlyLoans } from "../../../redux/interestOnlyLoans/interestLoanSlice.js";
import { fetchInterestCollectionReports } from "../../../redux/interestOnlyPayment/interestOnlyPaymentSlice.js";

const DATE_RANGES = [
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "quarter", label: "This quarter" },
  { value: "year", label: "This year" },
];

const LOAN_TYPES = [
  { value: "all", label: "All Loans" },
  { value: "regular", label: "EMI Loans" },
  { value: "interest_only", label: "Interest-Only" },
];

const getDateRange = (rangeType) => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const fmt = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (rangeType === "week") {
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(now.getFullYear(), now.getMonth(), diffToMonday);
    const end = new Date(now.getFullYear(), now.getMonth(), diffToMonday + 6);
    return { from: fmt(start), to: fmt(end) };
  }
  if (rangeType === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: fmt(start), to: fmt(end) };
  }
  if (rangeType === "quarter") {
    const qMonth = Math.floor(now.getMonth() / 3) * 3;
    const start = new Date(now.getFullYear(), qMonth, 1);
    const end = new Date(now.getFullYear(), qMonth + 3, 0);
    return { from: fmt(start), to: fmt(end) };
  }
  if (rangeType === "year") {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    return { from: fmt(start), to: fmt(end) };
  }
  return {};
};

export function formatCurrency(amount) {
  const num = Number(amount || 0);
  if (isNaN(num)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(num);
}

// Stat card with ample breathing room, top-level layout, and subtitle context
function StatCard({ icon: Icon, tone = "primary", label, value, sub }) {
  const toneClasses = {
    primary: {
      bg: "bg-primary/10 text-primary border-primary/20",
    },
    success: {
      bg: "bg-success/10 text-success border-success/20",
    },
    info: {
      bg: "bg-info/10 text-info border-info/20",
    },
    error: {
      bg: "bg-error/10 text-error border-error/20",
    },
    warning: {
      bg: "bg-warning/10 text-warning border-warning/20",
    },
  };

  const currentTone = toneClasses[tone] || toneClasses.primary;

  return (
    <div
      title={typeof value === "string" ? value : undefined}
      className="card bg-base-100 border border-base-300 shadow-xs hover:shadow-md transition-all rounded-2xl p-5 flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0 flex-1">
          <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider block">
            {label}
          </span>
          <p className="text-2xl font-bold tracking-tight text-base-content break-words">
            {value}
          </p>
        </div>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${currentTone.bg}`}
        >
          <Icon size={19} className="stroke-[2.2]" />
        </div>
      </div>

      {sub && (
        <div className="mt-3 pt-2.5 border-t border-base-200/70 flex items-center justify-between text-xs text-base-content/50">
          <span>{sub}</span>
        </div>
      )}
    </div>
  );
}

// Card wrapper matching the card style
function ChartCard({ title, className = "", children }) {
  return (
    <div
      className={`rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm ${className}`}
    >
      <h3 className="font-semibold text-sm text-base-content mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function Analytics() {
  const dispatch = useDispatch();
  const { dashboard, loading, error } = useSelector(
    (state) => state.analytics || {},
  );

  const { loans: rawInterestLoans = [] } = useSelector(
    (state) => state.interestOnlyLoans || {},
  );
  const interestLoans = Array.isArray(rawInterestLoans) ? rawInterestLoans : [];

  const { reports: rawInterestPayments = [] } = useSelector(
    (state) => state.interestOnlyPayments || {},
  );
  const interestPayments = Array.isArray(rawInterestPayments) ? rawInterestPayments : [];

  const [range, setRange] = useState("month");
  const [loanType, setLoanType] = useState("all"); // "all" | "regular" | "interest_only"
  const [refreshedAt, setRefreshedAt] = useState(new Date());

  useEffect(() => {
    const dates = getDateRange(range);
    dispatch(fetchDashboard({ range, ...dates, loan_type: loanType }));
    dispatch(fetchInterestOnlyLoans());
    dispatch(
      fetchInterestCollectionReports({
        from_date: dates.from,
        to_date: dates.to,
      }),
    );
  }, [dispatch, range, loanType]);

  const handleRefresh = () => {
    const dates = getDateRange(range);
    Promise.all([
      dispatch(fetchDashboard({ range, ...dates, loan_type: loanType })),
      dispatch(fetchInterestOnlyLoans()),
      dispatch(
        fetchInterestCollectionReports({
          from_date: dates.from,
          to_date: dates.to,
        }),
      ),
    ]).then(() => {
      setRefreshedAt(new Date());
    });
  };

  const handleExport = () => {
    if (!dashboard) return;
    const exportData = {
      ...dashboard,
      loan_type: loanType,
      range,
      exported_at: new Date().toISOString(),
    };
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `analytics-dashboard-${loanType}-${range}-${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Safe extraction of backend data
  const summary = dashboard?.summary || {};
  const charts = dashboard?.charts || {};
  const lists = dashboard?.lists || {};

  // Interest loans metrics
  const interestMetrics = useMemo(() => {
    const activeList = interestLoans.filter((l) => l.status === "active");
    const activeCount = activeList.length;
    const totalOutstanding = activeList.reduce(
      (s, l) =>
        s +
        (Number(l.outstanding_principal) || 0) +
        (Number(l.outstanding_interest) || 0),
      0,
    );
    const totalCollected = interestPayments.reduce(
      (s, p) => s + (Number(p.payment_amount) || 0),
      0,
    );
    const totalDue = interestLoans.reduce(
      (s, l) => s + (Number(l.total_payable) || 0),
      0,
    );
    const customersSet = new Set(
      interestLoans.map((l) => l.customer_id).filter(Boolean),
    );
    const overdueCount = interestLoans.filter(
      (l) => l.status === "default" || l.status === "overdue",
    ).length;
    const defaultRate =
      interestLoans.length > 0 ? (overdueCount / interestLoans.length) * 100 : 0;
    const successRate =
      totalDue > 0 ? (totalCollected / totalDue) * 100 : 0;

    return {
      activeCount,
      totalOutstanding,
      totalCollected,
      totalDue,
      customerCount: customersSet.size,
      defaultRate,
      successRate,
    };
  }, [interestLoans, interestPayments]);

  // Regular active loans count from distribution
  const regularActiveLoansCount = useMemo(() => {
    if (!charts.loan_distribution?.length) return 0;
    const activeEntry = charts.loan_distribution.find(
      (item) => item.status?.toLowerCase() === "active",
    );
    return Number(activeEntry?.loan_count ?? activeEntry?.value ?? 0);
  }, [charts.loan_distribution]);

  // Combined Formatted Stats
  const {
    collectionSuccessRate,
    totalOutstanding,
    totalCollected,
    totalCustomers,
    activeLoansCount,
    defaultRate,
  } = useMemo(() => {
    if (loanType === "regular") {
      return {
        collectionSuccessRate:
          summary.collection_success_rate !== undefined
            ? `${Number(summary.collection_success_rate).toFixed(2)}%`
            : "0.00%",
        totalOutstanding: formatCurrency(summary.total_outstanding),
        totalCollected: formatCurrency(summary.total_collected),
        totalCustomers: summary.total_customers ?? 0,
        activeLoansCount: regularActiveLoansCount,
        defaultRate:
          summary.default_rate !== undefined
            ? `${Number(summary.default_rate).toFixed(2)}%`
            : "0.00%",
      };
    }

    if (loanType === "interest_only") {
      return {
        collectionSuccessRate: `${interestMetrics.successRate.toFixed(2)}%`,
        totalOutstanding: formatCurrency(interestMetrics.totalOutstanding),
        totalCollected: formatCurrency(interestMetrics.totalCollected),
        totalCustomers: interestMetrics.customerCount,
        activeLoansCount: interestMetrics.activeCount,
        defaultRate: `${interestMetrics.defaultRate.toFixed(2)}%`,
      };
    }

    // "all" - Unified metrics
    const regColl = Number(summary.total_collected) || 0;
    const intColl = interestMetrics.totalCollected;
    const combColl = regColl + intColl;

    const regOut = Number(summary.total_outstanding) || 0;
    const intOut = interestMetrics.totalOutstanding;
    const combOut = regOut + intOut;

    const combActive = regularActiveLoansCount + interestMetrics.activeCount;
    const combCust =
      (Number(summary.total_customers) || 0) + interestMetrics.customerCount;

    const regDue = Number(summary.total_due) || regColl + regOut;
    const intDue = interestMetrics.totalDue;
    const combDue = regDue + intDue;

    const combSuccessRate =
      combDue > 0 ? (combColl / combDue) * 100 : 0;

    const regDef = Number(summary.default_rate) || 0;
    const intDef = interestMetrics.defaultRate;
    const combDef =
      combActive > 0
        ? (regDef * regularActiveLoansCount + intDef * interestMetrics.activeCount) /
          combActive
        : 0;

    return {
      collectionSuccessRate: `${combSuccessRate.toFixed(2)}%`,
      totalOutstanding: formatCurrency(combOut),
      totalCollected: formatCurrency(combColl),
      totalCustomers: combCust,
      activeLoansCount: combActive,
      defaultRate: `${combDef.toFixed(2)}%`,
    };
  }, [loanType, summary, interestMetrics, regularActiveLoansCount]);

  // Chart data normalization
  const dailyCollectionData = useMemo(() => {
    const map = {};

    if (loanType === "all" || loanType === "regular") {
      (charts.daily_collection || []).forEach((item) => {
        const d = String(item.date || item.day || "").slice(0, 10);
        if (!d) return;
        map[d] = {
          day: d,
          date: d,
          collected: Number(item.amount ?? item.collected ?? 0),
          expected:
            item.expected !== undefined ? Number(item.expected) : undefined,
        };
      });
    }

    if (loanType === "all" || loanType === "interest_only") {
      interestPayments.forEach((p) => {
        if (!p.payment_date) return;
        const d = String(p.payment_date).slice(0, 10);
        if (!d) return;
        if (!map[d]) {
          map[d] = { day: d, date: d, collected: 0, expected: undefined };
        }
        map[d].collected += Number(p.payment_amount) || 0;
      });
    }

    return Object.values(map)
      .sort((a, b) => a.day.localeCompare(b.day))
      .map((item) => ({
        ...item,
        amount: item.collected,
      }));
  }, [charts.daily_collection, interestPayments, loanType]);

  const loanDistributionData = useMemo(() => {
    const statusColorMap = {
      active: "#2563EB",
      completed: "#10B981",
      closed: "#10B981",
      overdue: "#EF4444",
      pending: "#F59E0B",
      defaulted: "#DC2626",
      default: "#DC2626",
      cancelled: "#6B7280",
    };

    const distMap = {};

    if (loanType === "all" || loanType === "regular") {
      (charts.loan_distribution || []).forEach((item) => {
        const rawStatus = (item.status || "other").toLowerCase();
        distMap[rawStatus] = {
          status: rawStatus,
          loan_count:
            (distMap[rawStatus]?.loan_count || 0) +
            Number(item.loan_count ?? item.value ?? 0),
          loan_amount:
            (distMap[rawStatus]?.loan_amount || 0) +
            Number(item.loan_amount ?? item.amount ?? 0),
        };
      });
    }

    if (loanType === "all" || loanType === "interest_only") {
      interestLoans.forEach((item) => {
        const rawStatus = (item.status || "other").toLowerCase();
        distMap[rawStatus] = {
          status: rawStatus,
          loan_count: (distMap[rawStatus]?.loan_count || 0) + 1,
          loan_amount:
            (distMap[rawStatus]?.loan_amount || 0) +
            (Number(item.principal_amount) || 0),
        };
      });
    }

    return Object.values(distMap).map((item) => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      status: item.status,
      value: item.loan_count,
      loan_count: item.loan_count,
      loan_amount: item.loan_amount,
      color: statusColorMap[item.status] || undefined,
    }));
  }, [charts.loan_distribution, interestLoans, loanType]);

  const weeklyCollectionData = useMemo(() => {
    const weekMap = {};

    if (loanType === "all" || loanType === "regular") {
      (charts.weekly_collection || []).forEach((item) => {
        let label = item.week ? `W${String(item.week).slice(-2)}` : "";
        if (item.week_start) {
          label = label ? `${label} (${item.week_start})` : item.week_start;
        }
        const key = item.week || label;
        weekMap[key] = {
          week: label || String(item.week || ""),
          collected: Number(item.amount ?? item.collected ?? 0),
          target: item.target !== undefined ? Number(item.target) : undefined,
        };
      });
    }

    if (loanType === "all" || loanType === "interest_only") {
      interestPayments.forEach((p) => {
        if (!p.payment_date) return;
        const d = new Date(p.payment_date);
        if (isNaN(d.getTime())) return;
        const oneJan = new Date(d.getFullYear(), 0, 1);
        const numberOfDays = Math.floor((d - oneJan) / (24 * 60 * 60 * 1000));
        const weekNum = Math.ceil((d.getDay() + 1 + numberOfDays) / 7);
        const weekKey = `${d.getFullYear()}W${String(weekNum).padStart(2, "0")}`;
        const label = `W${String(weekNum).padStart(2, "0")}`;

        if (!weekMap[weekKey]) {
          weekMap[weekKey] = { week: label, collected: 0, target: undefined };
        }
        weekMap[weekKey].collected += Number(p.payment_amount) || 0;
      });
    }

    return Object.values(weekMap).map((w) => ({
      ...w,
      amount: w.collected,
    }));
  }, [charts.weekly_collection, interestPayments, loanType]);

  const monthlyIncomeData = useMemo(() => {
    const monthMap = {};

    if (loanType === "all" || loanType === "regular") {
      (charts.monthly_income || []).forEach((item) => {
        if (!item.month) return;
        monthMap[item.month] = {
          month: item.month,
          income: Number(item.amount ?? item.income ?? 0),
        };
      });
    }

    if (loanType === "all" || loanType === "interest_only") {
      interestPayments.forEach((p) => {
        if (!p.payment_date) return;
        const m = String(p.payment_date).slice(0, 7);
        if (!m || m.length < 7) return;
        if (!monthMap[m]) {
          monthMap[m] = { month: m, income: 0 };
        }
        monthMap[m].income += Number(p.payment_amount) || 0;
      });
    }

    return Object.values(monthMap)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((item) => ({
        ...item,
        amount: item.income,
      }));
  }, [charts.monthly_income, interestPayments, loanType]);

  const villageCustomerData = useMemo(() => {
    return (charts.village_customers || []).map((item) => ({
      village: item.village || "Unknown",
      count: Number(item.customer_count ?? item.count ?? 0),
      customer_count: Number(item.customer_count ?? item.count ?? 0),
    }));
  }, [charts.village_customers]);

  const customerGrowthData = useMemo(() => {
    return (charts.customer_growth || []).map((item) => ({
      month: item.month,
      customers: Number(item.new_customers ?? item.customers ?? 0),
      new_customers: Number(item.new_customers ?? item.customers ?? 0),
    }));
  }, [charts.customer_growth]);

  const topVillages = useMemo(() => {
    const rawList =
      lists.top_villages?.length
        ? lists.top_villages
        : (charts.village_customers || []).map((v) => ({
            village: v.village,
            total: v.customer_count ?? v.count,
          }));

    return [...(rawList || [])]
      .map((v) => ({
        village: v.village,
        total: Number(v.total ?? v.customer_count ?? v.count ?? 0),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [lists.top_villages, charts.village_customers]);

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Full portfolio performance across collections, loans, and growth"
      />

      {/* Toolbar: loan type + date range + refresh + export */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Loan Category Tabs */}
          <div className="join bg-base-200 p-1 rounded-xl border border-base-300">
            {LOAN_TYPES.map((tab) => (
              <button
                key={tab.value}
                className={`join-item btn btn-xs sm:btn-sm border-none transition-all ${
                  loanType === tab.value
                    ? "btn-primary font-bold shadow-xs"
                    : "btn-ghost text-base-content/70 hover:text-base-content"
                }`}
                onClick={() => setLoanType(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Date Ranges */}
          <div className="join bg-base-200 p-1 rounded-xl border border-base-300">
            {DATE_RANGES.map((r) => (
              <button
                key={r.value}
                className={`join-item btn btn-xs sm:btn-sm border-none transition-all ${
                  range === r.value
                    ? "btn-primary font-bold shadow-xs"
                    : "btn-ghost text-base-content/70 hover:text-base-content"
                }`}
                onClick={() => setRange(r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-base-content/40 hidden sm:inline">
            Updated{" "}
            {refreshedAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <button
            className="btn btn-ghost btn-sm gap-1.5"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCcw
              size={14}
              className={loading ? "animate-spin text-primary" : ""}
            />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            className="btn btn-ghost btn-sm gap-1.5 border border-base-300"
            onClick={handleExport}
            disabled={!dashboard}
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Error alert if fetch failed */}
      {error && (
        <div className="alert alert-error mb-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button
            className="btn btn-xs btn-outline"
            onClick={() => dispatch(fetchDashboard({ range }))}
          >
            Retry
          </button>
        </div>
      )}

      {/* Stat cards - 3 columns perfectly aligned with the charts below */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={Wallet}
          tone="info"
          label="Outstanding Amount"
          value={totalOutstanding}
          sub="Principal & accrued interest"
        />
        <StatCard
          icon={PiggyBank}
          tone="success"
          label="Total Collected"
          value={totalCollected}
          sub="Realized repayments to date"
        />
        <StatCard
          icon={TrendingUp}
          tone="primary"
          label="Collection Success"
          value={collectionSuccessRate}
          sub="Target vs collected ratio"
        />
        <StatCard
          icon={FileCheck2}
          tone="info"
          label="Active Loans"
          value={activeLoansCount}
          sub="Currently performing contracts"
        />
        <StatCard
          icon={Users}
          tone="primary"
          label="Total Customers"
          value={totalCustomers}
          sub="Registered borrower accounts"
        />
        <StatCard
          icon={AlertCircle}
          tone="error"
          label="Default Rate"
          value={defaultRate}
          sub="Non-performing / overdue loans"
        />
      </div>

      {/* Main Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <ChartCard title="Daily Collection (Area)" className="lg:col-span-2">
          <CollectionAreaChart data={dailyCollectionData} />
        </ChartCard>
        <ChartCard title="Loan Distribution">
          <DistributionPieChart data={loanDistributionData} />
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <ChartCard title="Weekly Collection (Bar)">
          <WeeklyBarChart data={weeklyCollectionData} />
        </ChartCard>
        <ChartCard title="Monthly Income (Line)">
          <MonthlyLineChart data={monthlyIncomeData} />
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <ChartCard title="Village-wise Customers (Bar)">
          <VillageBarChart data={villageCustomerData} />
        </ChartCard>
        <ChartCard title="Customer Growth (Area)">
          <GrowthAreaChart data={customerGrowthData} />
        </ChartCard>
      </div>

      {/* Top Villages Leaderboard */}
      <ChartCard title="Top 5 Villages by Customer Count" className="mt-4">
        {topVillages.length === 0 ? (
          <p className="text-xs text-base-content/40">
            No village data available.
          </p>
        ) : (
          <ul className="divide-y divide-base-200">
            {topVillages.map((v, i) => (
              <li
                key={v.village || i}
                className="flex items-center justify-between py-2.5"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-base-200 text-xs font-semibold flex items-center justify-center text-base-content/60">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-base-content">
                    {v.village}
                  </span>
                </div>
                <span className="text-sm font-semibold text-base-content/70">
                  {v.total} customers
                </span>
              </li>
            ))}
          </ul>
        )}
      </ChartCard>
    </div>
  );
}

