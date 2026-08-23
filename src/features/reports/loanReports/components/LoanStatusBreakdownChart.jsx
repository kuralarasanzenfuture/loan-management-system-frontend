import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  formatCurrency,
} from "../utils/loanReportHelpers.js";

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-base-300 bg-base-100 shadow-dropdown px-3 py-2 text-xs">
      <p className="font-semibold text-base-content mb-1">
        {STATUS_LABELS[item.status] || item.status}
      </p>
      <p className="text-base-content/60">
        Loans:{" "}
        <span className="font-semibold text-base-content">{item.count}</span>
      </p>
      <p className="text-base-content/60">
        Amount:{" "}
        <span className="font-semibold text-base-content">
          {formatCurrency(item.amount)}
        </span>
      </p>
    </div>
  );
}

/**
 * LoanStatusBreakdownChart
 * Props:
 * - data (array) : [{ status, count, amount }]
 */
export default function LoanStatusBreakdownChart({ data = [] }) {
  const totalCount = data.reduce((sum, d) => sum + Number(d.count || 0), 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-base-content/40">
        No status data available for this period.
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <ResponsiveContainer width="100%" height={220} className="max-w-[220px]">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell
                key={entry.status}
                fill={STATUS_COLORS[entry.status] || "#94A3B8"}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex-1 w-full space-y-2">
        {data.map((entry) => {
          const pct = totalCount
            ? Math.round((entry.count / totalCount) * 100)
            : 0;
          return (
            <div
              key={entry.status}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    background: STATUS_COLORS[entry.status] || "#94A3B8",
                  }}
                />
                <span className="font-medium text-base-content/70 capitalize">
                  {STATUS_LABELS[entry.status] || entry.status}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-base-content/40">
                  {entry.count} loans ({pct}%)
                </span>
                <span className="font-bold text-base-content">
                  {formatCurrency(entry.amount)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
