import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  CHART_COLORS,
  CHART_PALETTE,
  tooltipStyle,
  axisTickProps,
  categoryAxisTickProps,
  gridProps,
} from "./chartTheme.js";

// Shown when a chart is given no data, instead of rendering an empty plot
// area — makes it obvious at a glance whether something's actually broken
// vs. there just being no data for the selected period yet.
function EmptyState({ height }) {
  return (
    <div
      className="flex items-center justify-center text-xs text-base-content/40"
      style={{ height }}
    >
      No data available for this period.
    </div>
  );
}

export function CollectionAreaChart({ data, height = 260 }) {
  if (!data?.length) return <EmptyState height={height} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="collected" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={CHART_COLORS.primary}
              stopOpacity={0.35}
            />
            <stop
              offset="95%"
              stopColor={CHART_COLORS.primary}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid {...gridProps} vertical={false} />
        <XAxis dataKey="day" {...axisTickProps} />
        <YAxis {...axisTickProps} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          type="monotone"
          dataKey="expected"
          stroke={CHART_COLORS.muted}
          fill="none"
          strokeDasharray="4 4"
        />
        <Area
          type="monotone"
          dataKey="collected"
          stroke={CHART_COLORS.primary}
          strokeWidth={2.5}
          fill="url(#collected)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function WeeklyBarChart({ data, height = 260 }) {
  if (!data?.length) return <EmptyState height={height} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid {...gridProps} vertical={false} />
        <XAxis dataKey="week" {...axisTickProps} />
        <YAxis {...axisTickProps} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="target" fill={CHART_COLORS.grid} radius={[6, 6, 0, 0]} />
        <Bar
          dataKey="collected"
          fill={CHART_COLORS.success}
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MonthlyLineChart({ data, height = 240 }) {
  if (!data?.length) return <EmptyState height={height} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid {...gridProps} vertical={false} />
        <XAxis dataKey="month" {...axisTickProps} />
        <YAxis {...axisTickProps} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line
          type="monotone"
          dataKey="income"
          stroke={CHART_COLORS.primary}
          strokeWidth={2.5}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DistributionPieChart({ data, height = 240 }) {
  if (!data?.length) return <EmptyState height={height} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
        >
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.color || CHART_PALETTE[i % CHART_PALETTE.length]}
            />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function VillageBarChart({ data, height = 240 }) {
  if (!data?.length) return <EmptyState height={height} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
        <CartesianGrid {...gridProps} horizontal={false} />
        <XAxis type="number" {...axisTickProps} />
        <YAxis
          type="category"
          dataKey="village"
          width={90}
          {...categoryAxisTickProps}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar
          dataKey="count"
          fill={CHART_COLORS.secondary}
          radius={[0, 6, 6, 0]}
          barSize={16}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GrowthAreaChart({ data, height = 240 }) {
  if (!data?.length) return <EmptyState height={height} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="growth" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={CHART_COLORS.success}
              stopOpacity={0.35}
            />
            <stop
              offset="95%"
              stopColor={CHART_COLORS.success}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid {...gridProps} vertical={false} />
        <XAxis dataKey="month" {...axisTickProps} />
        <YAxis {...axisTickProps} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          type="monotone"
          dataKey="customers"
          stroke={CHART_COLORS.success}
          strokeWidth={2.5}
          fill="url(#growth)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
