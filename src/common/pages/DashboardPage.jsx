import React from "react";
import {
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Percent,
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
  Legend,
} from "recharts";

// ---------- KPI CARDS ----------
const KPI_CARDS = [
  {
    title: "Active Portfolio",
    value: "$14,248,500",
    change: "+12.4%",
    isPositive: true,
    description: "vs previous quarter",
    icon: DollarSign,
    iconColor: "text-primary bg-primary/10",
  },
  {
    title: "Active Borrowers",
    value: "1,248",
    change: "+4.2%",
    isPositive: true,
    description: "vs last month",
    icon: Users,
    iconColor: "text-success bg-success/10",
  },
  {
    title: "Applications Pending",
    value: "12",
    change: "-15.3%",
    isPositive: true,
    description: "avg 2.4 days wait",
    icon: FileText,
    iconColor: "text-info bg-info/10",
  },
  {
    title: "Average APR",
    value: "8.42%",
    change: "+0.15%",
    isPositive: false,
    description: "vs market average",
    icon: Percent,
    iconColor: "text-warning bg-warning/10",
  },
];

// ---------- TABLE DATA ----------
const RECENT_APPLICATIONS = [
  {
    id: "APP-1024",
    borrower: "Marcus Vance",
    email: "marcus.vance@gmail.com",
    avatar: "https://i.pravatar.cc/80?img=11",
    amount: "$25,000",
    purpose: "Debt Consolidation",
    status: "Pending Approval",
    statusClass: "badge-warning",
    date: "Aug 04, 2026",
  },
  {
    id: "APP-1023",
    borrower: "Elena Rostova",
    email: "elena.rostova@icloud.com",
    avatar: "https://i.pravatar.cc/80?img=32",
    amount: "$150,000",
    purpose: "Commercial Real Estate",
    status: "Approved",
    statusClass: "badge-success",
    date: "Aug 03, 2026",
  },
  {
    id: "APP-1022",
    borrower: "Damian Reed",
    email: "d.reed@reedventures.com",
    avatar: "https://i.pravatar.cc/80?img=60",
    amount: "$8,500",
    purpose: "Home Improvement",
    status: "In Review",
    statusClass: "badge-info",
    date: "Aug 03, 2026",
  },
  {
    id: "APP-1021",
    borrower: "Aaliyah Jackson",
    email: "aaliyah.j@yahoo.com",
    avatar: "https://i.pravatar.cc/80?img=41",
    amount: "$45,000",
    purpose: "Business Expansion",
    status: "Declined",
    statusClass: "badge-error",
    date: "Jul 31, 2026",
  },
];

// ---------- CHART DUMMY DATA ----------
const PORTFOLIO_TREND = [
  { month: "Feb", portfolio: 10.8, disbursed: 1.4 },
  { month: "Mar", portfolio: 11.3, disbursed: 1.6 },
  { month: "Apr", portfolio: 11.9, disbursed: 1.9 },
  { month: "May", portfolio: 12.4, disbursed: 1.7 },
  { month: "Jun", portfolio: 13.1, disbursed: 2.1 },
  { month: "Jul", portfolio: 13.7, disbursed: 2.0 },
  { month: "Aug", portfolio: 14.25, disbursed: 2.3 },
];

const APPLICATIONS_VOLUME = [
  { month: "Feb", approved: 62, declined: 14, review: 9 },
  { month: "Mar", approved: 71, declined: 11, review: 12 },
  { month: "Apr", approved: 68, declined: 18, review: 10 },
  { month: "May", approved: 84, declined: 13, review: 15 },
  { month: "Jun", approved: 79, declined: 9, review: 11 },
  { month: "Jul", approved: 92, declined: 16, review: 14 },
  { month: "Aug", approved: 58, declined: 7, review: 8 },
];

const LOAN_PURPOSE_BREAKDOWN = [
  { name: "Debt Consolidation", value: 34, color: "#C7A248" },
  { name: "Real Estate", value: 26, color: "#1F3F60" },
  { name: "Business Expansion", value: 18, color: "#4C9A6A" },
  { name: "Home Improvement", value: 14, color: "#3B82F6" },
  { name: "Other", value: 8, color: "#94A3B8" },
];

const TOP_OFFICERS = [
  {
    name: "Sarah Whitfield",
    avatar: "https://i.pravatar.cc/80?img=47",
    loans: 42,
    volume: "$3.1M",
  },
  {
    name: "Ryan Osei",
    avatar: "https://i.pravatar.cc/80?img=15",
    loans: 37,
    volume: "$2.6M",
  },
  {
    name: "Priya Nair",
    avatar: "https://i.pravatar.cc/80?img=25",
    loans: 33,
    volume: "$2.2M",
  },
  {
    name: "Tomas Alvarez",
    avatar: "https://i.pravatar.cc/80?img=53",
    loans: 29,
    volume: "$1.9M",
  },
];

// Custom tooltip so chart tooltips match the theme instead of recharts' default white box
function ChartTooltip({ active, payload, label, prefix = "", suffix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-base-300 bg-base-100 shadow-dropdown px-3 py-2 text-xs">
      <p className="font-semibold text-base-content mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: p.color || p.fill }}
          />
          <span className="text-base-content/60 capitalize">{p.dataKey}:</span>
          <span className="font-semibold text-base-content">
            {prefix}
            {p.value}
            {suffix}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-base-content">
            Dashboard
          </h1>
          <p className="text-sm text-base-content/50 mt-1">
            Welcome back, Senior Loan Officer. Here's what's happening today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn btn-outline btn-sm rounded-xl border-base-300">
            Export Report
          </button>
          <button className="btn btn-primary btn-sm rounded-xl gap-1.5 shadow-md shadow-primary/20">
            <Plus size={16} />
            <span>New Application</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {KPI_CARDS.map((card) => {
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
                <div className={`p-2.5 rounded-xl shrink-0 ${card.iconColor}`}>
                  <Icon size={18} className="stroke-[2.2]" />
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold">
                <span
                  className={`flex items-center gap-0.5 ${card.isPositive ? "text-success" : "text-error"}`}
                >
                  {card.isPositive ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                  {card.change}
                </span>
                <span className="text-base-content/40 font-normal">
                  {card.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Growth — Area Chart */}
        <div className="card bg-base-100 border border-base-300 shadow-xs rounded-2xl lg:col-span-2 overflow-hidden p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm tracking-tight">
                Portfolio Growth
              </h3>
              <p className="text-[11px] text-base-content/40 mt-0.5">
                Active portfolio vs. monthly disbursement ($M)
              </p>
            </div>
            <span className="badge badge-success badge-sm font-semibold">
              +31.9% YTD
            </span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={PORTFOLIO_TREND}
              margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C7A248" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#C7A248" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="disbursedFill" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="month"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                className="fill-base-content/50"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                className="fill-base-content/50"
              />
              <Tooltip content={<ChartTooltip prefix="$" suffix="M" />} />
              <Area
                type="monotone"
                dataKey="portfolio"
                stroke="#C7A248"
                strokeWidth={2}
                fill="url(#portfolioFill)"
              />
              <Area
                type="monotone"
                dataKey="disbursed"
                stroke="#1F3F60"
                strokeWidth={2}
                fill="url(#disbursedFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Loan Purpose Breakdown — Donut Chart */}
        <div className="card bg-base-100 border border-base-300 shadow-xs rounded-2xl overflow-hidden p-6">
          <h3 className="font-bold text-sm tracking-tight mb-1">
            Loan Purpose Mix
          </h3>
          <p className="text-[11px] text-base-content/40 mb-2">
            Share of active loan volume
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={LOAN_PURPOSE_BREAKDOWN}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
              >
                {LOAN_PURPOSE_BREAKDOWN.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip suffix="%" />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {LOAN_PURPOSE_BREAKDOWN.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-[11px]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: item.color }}
                  />
                  <span className="text-base-content/60 truncate">
                    {item.name}
                  </span>
                </div>
                <span className="font-semibold text-base-content shrink-0">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Applications Volume — Bar Chart (full width) */}
      <div className="card bg-base-100 border border-base-300 shadow-xs rounded-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm tracking-tight">
              Monthly Applications Volume
            </h3>
            <p className="text-[11px] text-base-content/40 mt-0.5">
              Applications by outcome, last 7 months
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success" />
              Approved
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-error" />
              Declined
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-info" />
              In Review
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={APPLICATIONS_VOLUME}
            margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-base-300"
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              className="fill-base-content/50"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              className="fill-base-content/50"
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar
              dataKey="approved"
              stackId="a"
              fill="#4C9A6A"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="review"
              stackId="a"
              fill="#3B82F6"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="declined"
              stackId="a"
              fill="#EF4444"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Grid: Applications Table & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications Card */}
        <div className="card bg-base-100 border border-base-300 shadow-xs rounded-2xl lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 bg-base-200/10">
            <h3 className="font-bold text-sm tracking-tight">
              Recent Loan Applications
            </h3>
            <button className="text-xs font-bold text-primary hover:underline">
              View all
            </button>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="table table-sm w-full divide-y divide-base-200">
              <thead>
                <tr className="bg-transparent border-b border-base-200">
                  <th className="py-3 px-6 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                    Borrower
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                    Amount & Purpose
                  </th>
                  <th className="py-3 px-6 text-center text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-6 text-right text-xs font-semibold text-base-content/50 uppercase tracking-wider">
                    Date Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-100">
                {RECENT_APPLICATIONS.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-base-200/20 transition-colors"
                  >
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-9 h-9 rounded-full overflow-hidden">
                            <img src={app.avatar} alt={app.borrower} />
                          </div>
                        </div>
                        <div className="flex flex-col min-w-0 leading-tight">
                          <span className="text-xs font-bold text-base-content">
                            {app.borrower}
                          </span>
                          <span className="text-[10px] text-base-content/40 truncate">
                            {app.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 leading-tight">
                      <p className="text-xs font-semibold text-base-content">
                        {app.amount}
                      </p>
                      <p className="text-[10px] text-base-content/40">
                        {app.purpose}
                      </p>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span
                        className={`badge badge-sm font-semibold rounded-lg px-2.5 py-1 ${app.statusClass} bg-opacity-15`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right text-[11px] font-semibold text-base-content/40">
                      {app.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Insights / Sidebar Stats */}
        <div className="card bg-base-100 border border-base-300 shadow-xs rounded-2xl overflow-hidden p-6 space-y-6">
          <h3 className="font-bold text-sm tracking-tight border-b border-base-200 pb-3">
            Quick Insights
          </h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-base-content/70">
                Disbursed Funds Target
              </span>
              <span className="font-bold text-primary">78%</span>
            </div>
            <div className="w-full bg-base-200 h-2.5 rounded-full overflow-hidden border border-base-300">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: "78%" }}
              ></div>
            </div>
            <p className="text-[10px] text-base-content/40">
              $11.2M issued of $15M budget for Q3.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-base-content/70">
                Risk Tolerance Limit
              </span>
              <span className="font-bold text-success">Low (0.8% NPL)</span>
            </div>
            <div className="w-full bg-base-200 h-2.5 rounded-full overflow-hidden border border-base-300">
              <div
                className="bg-success h-full rounded-full"
                style={{ width: "32%" }}
              ></div>
            </div>
            <p className="text-[10px] text-base-content/40">
              Well within the target safety threshold of 2.0%.
            </p>
          </div>

          <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 space-y-2">
            <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
              <TrendingUp size={14} />
              Platform optimization
            </h4>
            <p className="text-[11px] text-base-content/60 leading-relaxed">
              Auto-approve feature is now online for applicants with credit
              scores above 780 and low DTI ratio. This can save up to 14 hours
              per week.
            </p>
          </div>
        </div>
      </div>

      {/* Top Loan Officers Leaderboard */}
      <div className="card bg-base-100 border border-base-300 shadow-xs rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 bg-base-200/10">
          <h3 className="font-bold text-sm tracking-tight">
            Top Loan Officers — This Quarter
          </h3>
          <button className="text-xs font-bold text-primary hover:underline">
            View all
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-base-200">
          {TOP_OFFICERS.map((officer, i) => (
            <div key={officer.name} className="flex items-center gap-3 p-5">
              <div className="relative shrink-0">
                <div className="avatar">
                  <div className="w-11 h-11 rounded-full overflow-hidden">
                    <img src={officer.avatar} alt={officer.name} />
                  </div>
                </div>
                <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary text-primary-content text-[10px] font-bold flex items-center justify-center ring-2 ring-base-100">
                  {i + 1}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-base-content truncate">
                  {officer.name}
                </p>
                <p className="text-[11px] text-base-content/40">
                  {officer.loans} loans · {officer.volume}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
