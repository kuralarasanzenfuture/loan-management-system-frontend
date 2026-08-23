import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  formatCurrency,
  formatCurrencyCompact,
  formatDate,
} from "../utils/loanReportHelpers.js";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-base-300 bg-base-100 shadow-dropdown px-3 py-2 text-xs">
      <p className="font-semibold text-base-content mb-1">
        {formatDate(label)}
      </p>
      <p className="text-base-content/60">
        Collected:{" "}
        <span className="font-semibold text-success">
          {formatCurrency(payload[0].value)}
        </span>
      </p>
    </div>
  );
}

/**
 * CollectionTrendChart
 * Props:
 * - data (array) : [{ date, amount }]
 */
export default function CollectionTrendChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-base-content/40">
        No collection activity in this period.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart
        data={data}
        margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
      >
        <defs>
          <linearGradient id="collectionFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="currentColor"
          className="text-base-300"
        />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          className="fill-base-content/50"
        />
        <YAxis
          tickFormatter={formatCurrencyCompact}
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          className="fill-base-content/50"
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#22C55E"
          strokeWidth={2}
          fill="url(#collectionFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
