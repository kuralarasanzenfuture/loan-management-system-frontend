import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { TrendingUp, PieChart as PieIcon, CreditCard } from "lucide-react";

const formatINR = (val) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
  return `₹${val}`;
};

const STATUS_COLORS = {
  active: "#3B82F6",
  completed: "#10B981",
  closed: "#6B7280",
  cancelled: "#EF4444",
};

const MODE_COLORS = {
  cash: "#10B981",
  bank: "#3B82F6",
  upi: "#8B5CF6",
  cheque: "#F59E0B",
  other: "#6B7280",
};

export default function InterestLoanReportCharts({
  monthlyTrend = [],
  statusBreakdown = [],
  paymentModes = {},
  loading = false,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 rounded-2xl bg-base-100 border border-base-300 animate-pulse p-5" />
        <div className="h-80 rounded-2xl bg-base-100 border border-base-300 animate-pulse p-5" />
      </div>
    );
  }

  // Format payment modes for pie chart
  const paymentModeData = Object.entries(paymentModes)
    .filter(([_, val]) => Number(val) > 0)
    .map(([mode, val]) => ({
      name: mode.toUpperCase(),
      value: Number(val),
      color: MODE_COLORS[mode] || "#94A3B8",
    }));

  // Format status breakdown
  const statusData = statusBreakdown.map((s) => ({
    name: s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1) : "Unknown",
    value: s.count,
    color: STATUS_COLORS[s.status] || "#94A3B8",
  }));

  const hasTrendData = monthlyTrend.length > 0;
  const hasStatusData = statusData.length > 0;
  const hasModeData = paymentModeData.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Monthly Collections & Allocation Trend (2 Cols) */}
      <div className="lg:col-span-2 bg-base-100 border border-base-300 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-base-content">
                Collections & Allocation Trend
              </h3>
              <p className="text-xs text-base-content/50">
                Interest vs Principal receipts over time
              </p>
            </div>
          </div>
          <span className="badge badge-sm badge-ghost font-mono text-[11px]">
            {monthlyTrend.length} Periods
          </span>
        </div>

        {hasTrendData ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis
                  dataKey="monthLabel"
                  tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                  axisLine={{ opacity: 0.2 }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatINR}
                  tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                  axisLine={{ opacity: 0.2 }}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [
                    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value),
                  ]}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }}
                />
                <Area
                  type="monotone"
                  dataKey="total_collected"
                  name="Total Collected"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
                <Area
                  type="monotone"
                  dataKey="interest_collected"
                  name="Interest Portion"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorInterest)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center text-base-content/40">
            <TrendingUp size={32} className="mb-2 opacity-30" />
            <p className="text-xs font-medium">No trend records in selected date range.</p>
          </div>
        )}
      </div>

      {/* 2. Portfolio Status & Payment Modes Breakdown (1 Col) */}
      <div className="bg-base-100 border border-base-300 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <PieIcon size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-base-content">
                Loan Status Distribution
              </h3>
              <p className="text-xs text-base-content/50">
                Accounts by lifecycle status
              </p>
            </div>
          </div>
        </div>

        {hasStatusData ? (
          <div className="h-64 w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} Accounts`, name]}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Status Legend Pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {statusData.map((s, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-base-content/70">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span>
                    {s.name} ({s.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center text-base-content/40">
            <PieIcon size={32} className="mb-2 opacity-30" />
            <p className="text-xs font-medium">No status data available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
