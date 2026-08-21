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

const DATE_RANGES = [
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "quarter", label: "This quarter" },
  { value: "year", label: "This year" },
];

export function formatCurrency(amount) {
  const num = Number(amount || 0);
  if (isNaN(num)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

// Small stat card matching the icon-in-tinted-circle pattern
function StatCard({ icon: Icon, tone, label, value }) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    info: "bg-info/10 text-info",
    error: "bg-error/10 text-error",
    warning: "bg-warning/10 text-warning",
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-sm hover:shadow-md transition-shadow">
      <span
        className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${toneClasses[tone] || toneClasses.primary}`}
      >
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <div className="text-xs text-base-content/60 font-medium">{label}</div>
        <div className="text-xl font-bold leading-tight truncate mt-0.5">
          {value}
        </div>
      </div>
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

  const [range, setRange] = useState("month");
  const [refreshedAt, setRefreshedAt] = useState(new Date());

  useEffect(() => {
    dispatch(fetchDashboard({ range }));
  }, [dispatch, range]);

  const handleRefresh = () => {
    dispatch(fetchDashboard({ range })).then(() => {
      setRefreshedAt(new Date());
    });
  };

  const handleExport = () => {
    if (!dashboard) return;
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(dashboard, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `analytics-dashboard-${range}-${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Safe extraction of backend data
  const summary = dashboard?.summary || {};
  const charts = dashboard?.charts || {};
  const lists = dashboard?.lists || {};

  // Formatted stats
  const collectionSuccessRate = summary.collection_success_rate !== undefined
    ? `${Number(summary.collection_success_rate).toFixed(2)}%`
    : "0.00%";

  const totalOutstanding = formatCurrency(summary.total_outstanding);
  const totalCollected = formatCurrency(summary.total_collected);
  const totalCustomers = summary.total_customers ?? 0;
  const defaultRate = summary.default_rate !== undefined
    ? `${Number(summary.default_rate).toFixed(2)}%`
    : "0.00%";

  // Calculated active loans count
  const activeLoansCount = useMemo(() => {
    if (!charts.loan_distribution?.length) return 0;
    return charts.loan_distribution.reduce(
      (sum, item) => sum + (Number(item.loan_count) || 0),
      0,
    );
  }, [charts.loan_distribution]);

  // Chart data normalization
  const dailyCollectionData = useMemo(() => {
    return (charts.daily_collection || []).map((item) => ({
      day: item.date || item.day || "",
      date: item.date || item.day || "",
      collected: Number(item.amount ?? item.collected ?? 0),
      amount: Number(item.amount ?? item.collected ?? 0),
      expected: item.expected !== undefined ? Number(item.expected) : undefined,
    }));
  }, [charts.daily_collection]);

  const loanDistributionData = useMemo(() => {
    const statusColorMap = {
      active: "#2563EB",
      completed: "#10B981",
      closed: "#10B981",
      overdue: "#EF4444",
      pending: "#F59E0B",
      defaulted: "#DC2626",
    };

    return (charts.loan_distribution || []).map((item, idx) => ({
      name: item.status
        ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
        : item.name || `Loan ${idx + 1}`,
      status: item.status,
      value: Number(item.loan_count ?? item.value ?? 0),
      loan_count: Number(item.loan_count ?? item.value ?? 0),
      loan_amount: Number(item.loan_amount ?? item.amount ?? 0),
      color: statusColorMap[item.status?.toLowerCase()] || undefined,
    }));
  }, [charts.loan_distribution]);

  const weeklyCollectionData = useMemo(() => {
    return (charts.weekly_collection || []).map((item) => {
      let label = item.week ? `W${String(item.week).slice(-2)}` : "";
      if (item.week_start) {
        label = label ? `${label} (${item.week_start})` : item.week_start;
      }
      return {
        week: label || String(item.week || ""),
        rawWeek: item.week,
        week_start: item.week_start,
        collected: Number(item.amount ?? item.collected ?? 0),
        amount: Number(item.amount ?? item.collected ?? 0),
        target: item.target !== undefined ? Number(item.target) : undefined,
      };
    });
  }, [charts.weekly_collection]);

  const monthlyIncomeData = useMemo(() => {
    return (charts.monthly_income || []).map((item) => ({
      month: item.month,
      income: Number(item.amount ?? item.income ?? 0),
      amount: Number(item.amount ?? item.income ?? 0),
    }));
  }, [charts.monthly_income]);

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

      {/* Toolbar: date range + refresh + export */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="join">
          {DATE_RANGES.map((r) => (
            <button
              key={r.value}
              className={`join-item btn btn-sm ${
                range === r.value
                  ? "btn-primary"
                  : "btn-ghost bg-base-100 border-base-300"
              }`}
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </button>
          ))}
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

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard
          icon={TrendingUp}
          tone="primary"
          label="Collection Success"
          value={collectionSuccessRate}
        />
        <StatCard
          icon={Wallet}
          tone="info"
          label="Outstanding Amount"
          value={totalOutstanding}
        />
        <StatCard
          icon={PiggyBank}
          tone="success"
          label="Total Collected"
          value={totalCollected}
        />
        <StatCard
          icon={Users}
          tone="primary"
          label="Total Customers"
          value={totalCustomers}
        />
        <StatCard
          icon={FileCheck2}
          tone="info"
          label="Active Loans"
          value={activeLoansCount}
        />
        <StatCard
          icon={TrendingUp}
          tone="error"
          label="Default Rate"
          value={defaultRate}
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

