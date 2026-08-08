import { useState } from "react";
import {
  TrendingUp,
  Wallet,
  PiggyBank,
  Users,
  RefreshCcw,
  Download,
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
import {
  getCollectionTrend,
  getWeeklyPerformance,
  getMonthlyIncome,
  getLoanDistribution,
  getVillageWise,
  getCustomerGrowth,
  getDashboardStats,
} from "./aggregates.js";
import { formatCurrency } from "./ledger.js";

const DATE_RANGES = [
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "quarter", label: "This quarter" },
  { value: "year", label: "This year" },
];

// Small stat card matching the icon-in-tinted-circle pattern used across
// Roles / Loans / Profile pages, for visual consistency.
function StatCard({ icon: Icon, tone, label, value }) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    info: "bg-info/10 text-info",
    error: "bg-error/10 text-error",
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-5 py-4">
      <span
        className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${toneClasses[tone]}`}
      >
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <div className="text-xs text-base-content/50">{label}</div>
        <div className="text-xl font-semibold leading-tight truncate">
          {value}
        </div>
      </div>
    </div>
  );
}

// Card wrapper matching the RolesPage/RoleTable card style, with a small
// icon-led title row so every chart card looks consistent.
function ChartCard({ title, className = "", children }) {
  return (
    <div
      className={`rounded-2xl border border-base-300 bg-base-100 p-5 ${className}`}
    >
      <h3 className="font-semibold text-sm text-base-content mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function Analytics() {
  const [range, setRange] = useState("month");
  const [refreshedAt, setRefreshedAt] = useState(new Date());

  const stats = getDashboardStats();
  const successRate = stats.totalCustomers
    ? Math.round(
        ((stats.totalCustomers - stats.overdueCustomers) /
          stats.totalCustomers) *
          100,
      )
    : 0;

  // TODO: swap these two for real fields from getDashboardStats() once
  // your aggregates module exposes them — left as safe optional-chained
  // fallbacks so this doesn't crash if they're not there yet.
  const avgLoanSize =
    stats.totalDisbursed && stats.activeLoansCount
      ? formatCurrency(stats.totalDisbursed / stats.activeLoansCount)
      : "—";
  const defaultRate = stats.totalCustomers
    ? `${Math.round((stats.overdueCustomers / stats.totalCustomers) * 100)}%`
    : "—";

  const villageData = getVillageWise();
  const topVillages = [...(villageData || [])]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const handleRefresh = () => {
    // TODO: wire to your real data-refetch, e.g. re-run getDashboardStats()
    // against fresh data if it's not already reactive.
    setRefreshedAt(new Date());
  };

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
          >
            <RefreshCcw size={14} />
            Refresh
          </button>
          <button className="btn btn-ghost btn-sm gap-1.5 border border-base-300">
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard
          icon={TrendingUp}
          tone="primary"
          label="Collection Success"
          value={`${successRate}%`}
        />
        <StatCard
          icon={Wallet}
          tone="info"
          label="Outstanding Amount"
          value={formatCurrency(stats.pendingAmount)}
        />
        <StatCard
          icon={PiggyBank}
          tone="success"
          label="Profit Trend"
          value={formatCurrency(stats.totalProfit)}
        />
        <StatCard
          icon={Users}
          tone="primary"
          label="Total Customers"
          value={stats.totalCustomers}
        />
        <StatCard
          icon={Wallet}
          tone="info"
          label="Avg. Loan Size"
          value={avgLoanSize}
        />
        <StatCard
          icon={TrendingUp}
          tone="error"
          label="Default Rate"
          value={defaultRate}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <ChartCard title="Daily Collection (Area)" className="lg:col-span-2">
          <CollectionAreaChart data={getCollectionTrend()} />
        </ChartCard>
        <ChartCard title="Loan Distribution">
          <DistributionPieChart data={getLoanDistribution()} />
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <ChartCard title="Weekly Collection (Bar)">
          <WeeklyBarChart data={getWeeklyPerformance()} />
        </ChartCard>
        <ChartCard title="Monthly Income (Line)">
          <MonthlyLineChart data={getMonthlyIncome()} />
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <ChartCard title="Village-wise Customers (Bar)">
          <VillageBarChart data={villageData} />
        </ChartCard>
        <ChartCard title="Customer Growth (Area)">
          <GrowthAreaChart data={getCustomerGrowth()} />
        </ChartCard>
      </div>

      {/* Extra maintenance widget: quick leaderboard, no chart needed to scan it */}
      <ChartCard title="Top 5 Villages by Customer Count" className="mt-4">
        {topVillages.length === 0 ? (
          <p className="text-xs text-base-content/40">
            No village data available.
          </p>
        ) : (
          <ul className="divide-y divide-base-200">
            {topVillages.map((v, i) => (
              <li
                key={v.village}
                className="flex items-center justify-between py-2.5"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-base-200 text-xs font-semibold flex items-center justify-center text-base-content/60">
                    {i + 1}
                  </span>
                  <span className="text-sm text-base-content">{v.village}</span>
                </div>
                <span className="text-sm font-medium text-base-content/70">
                  {v.count} customers
                </span>
              </li>
            ))}
          </ul>
        )}
      </ChartCard>
    </div>
  );
}
