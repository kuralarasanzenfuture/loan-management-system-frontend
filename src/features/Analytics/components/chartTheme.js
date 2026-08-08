/**
 * chartTheme.js
 * Single source of truth for chart colors and shared Recharts config.
 * Matches the app's navy/gold design tokens (see globals.css / tailwind
 * theme). Update colors here and every chart in Charts.jsx picks it up —
 * no more hunting through six components for a stray hex code.
 */

export const CHART_COLORS = {
  primary: "#C7A248", // gold-500 — main series (collections, income)
  primaryLight: "#D8B968", // gold-400 — gradient fade / secondary emphasis
  secondary: "#1F3F60", // navy-600 — comparison series (targets, village bars)
  success: "#4C9A6A", // growth / positive trend
  error: "#B3483F", // overdue / negative trend, if needed
  muted: "#94A3B8", // axis ticks, expected/target ghost lines
  grid: "#EEF2F7", // gridlines
  border: "#E4E1D9", // tooltip border
  textDark: "#334155", // category axis labels (e.g. village names)
};

// A rotating palette for pie/distribution charts with an arbitrary number
// of categories. Extend this array if you regularly have more than 5 slices.
export const CHART_PALETTE = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.success,
  "#8B93A6",
  CHART_COLORS.error,
];

export const tooltipStyle = {
  borderRadius: 10,
  border: `1px solid ${CHART_COLORS.border}`,
  boxShadow: "0 8px 24px -12px rgba(15,23,42,0.18)",
  fontSize: 12,
};

// Shared axis tick styling — pass as {...axisTickProps} on XAxis/YAxis.
export const axisTickProps = {
  tick: { fontSize: 12, fill: CHART_COLORS.muted },
  axisLine: false,
  tickLine: false,
};

export const categoryAxisTickProps = {
  tick: { fontSize: 12, fill: CHART_COLORS.textDark },
  axisLine: false,
  tickLine: false,
};

export const gridProps = {
  strokeDasharray: "3 3",
  stroke: CHART_COLORS.grid,
};
