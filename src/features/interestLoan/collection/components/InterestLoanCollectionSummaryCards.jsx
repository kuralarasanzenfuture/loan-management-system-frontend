import React from "react";
import {
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Flame,
  ArrowUpRight,
} from "lucide-react";
import { formatCurrency } from "../../loan/utils/interestLoanHelpers.js";

export default function InterestLoanCollectionSummaryCards({
  todaySummary = {},
  overdueSummary = {},
  upcomingSummary = {},
  loading = false,
  activeTab = "today",
  onSelectTab,
  activeAgingBucket = "all",
  onSelectAgingBucket,
}) {
  const todayDue = Number(todaySummary?.total_due_amount || 0);
  const todayCollected = Number(todaySummary?.total_collected_amount || 0);
  const todayCount = Number(todaySummary?.total_records || 0);
  const todayBalance = Number(todaySummary?.total_outstanding_amount || 0);
  const todayPercent =
    todayDue > 0 ? Math.min(100, Math.round((todayCollected / todayDue) * 100)) : 0;

  const overdueAmount = Number(overdueSummary?.total_overdue_amount || 0);
  const overdueCount = Number(overdueSummary?.total_overdue_periods || 0);
  const overdueLoans = Number(overdueSummary?.total_loans_overdue || 0);
  const maxDaysOverdue = Number(overdueSummary?.max_days_overdue || 0);
  const aging = overdueSummary?.aging_breakdown || {
    bucket_1_15: { count: 0, amount: 0 },
    bucket_16_30: { count: 0, amount: 0 },
    bucket_31_60: { count: 0, amount: 0 },
    bucket_60_plus: { count: 0, amount: 0 },
  };

  const upcomingAmount = Number(upcomingSummary?.total_due_amount || 0);
  const upcomingCount = Number(upcomingSummary?.total_records || 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Today's Scheduled Due Card */}
      <div
        onClick={() => onSelectTab && onSelectTab("today")}
        className={`group relative rounded-2xl border p-4 shadow-xs transition-all cursor-pointer ${
          activeTab === "today"
            ? "bg-base-100 border-primary shadow-sm ring-2 ring-primary/20"
            : "bg-base-100 border-base-300 hover:border-primary/50 hover:shadow-sm"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary shrink-0 transition-transform group-hover:scale-105">
            <Calendar size={20} />
          </span>
          {activeTab === "today" && (
            <span className="badge badge-xs badge-primary font-bold uppercase tracking-wider text-[10px]">
              Active Tab
            </span>
          )}
        </div>

        <div className="mt-3">
          <div className="text-[11px] text-base-content/50 font-bold uppercase tracking-wider">
            Today's Scheduled Due
          </div>
          <div className="text-2xl font-black tracking-tight text-base-content tabular-nums leading-tight mt-0.5">
            {loading ? "..." : formatCurrency(todayDue)}
          </div>
          <div className="text-[11px] text-base-content/60 font-medium mt-1 flex items-center justify-between">
            <span>{todayCount} loan cycle{todayCount !== 1 ? "s" : ""} scheduled</span>
            {todayBalance > 0 && (
              <span className="text-amber-600 dark:text-amber-400 font-bold tabular-nums">
                ₹{todayBalance.toLocaleString("en-IN")} pending
              </span>
            )}
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="w-full bg-base-200 h-1.5 rounded-full overflow-hidden mt-2.5">
          <div
            className="bg-primary h-full transition-all duration-500 rounded-full"
            style={{ width: `${todayPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Today's Collected Amount Card */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 size={20} />
          </span>
          <span className="badge badge-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 font-bold">
            {todayPercent}% Collected
          </span>
        </div>

        <div className="mt-3">
          <div className="text-[11px] text-base-content/50 font-bold uppercase tracking-wider">
            Today's Collected
          </div>
          <div className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums leading-tight mt-0.5">
            {loading ? "..." : formatCurrency(todayCollected)}
          </div>
          <div className="text-[11px] text-base-content/60 font-medium mt-1">
            {todayCount > 0 ? (
              <span>
                {todaySummary?.paid_count || 0} of {todayCount} settled
              </span>
            ) : (
              <span>No collections scheduled for date</span>
            )}
          </div>
        </div>

        <div className="w-full bg-base-200 h-1.5 rounded-full overflow-hidden mt-2.5">
          <div
            className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
            style={{ width: `${todayPercent}%` }}
          />
        </div>
      </div>

      {/* 3. Total Overdue Interest Card (Interactive) */}
      <div
        onClick={() => onSelectTab && onSelectTab("overdue")}
        className={`group relative rounded-2xl border p-4 shadow-xs transition-all cursor-pointer ${
          activeTab === "overdue"
            ? "bg-base-100 border-error shadow-sm ring-2 ring-error/20"
            : "bg-base-100 border-base-300 hover:border-error/50 hover:shadow-sm"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-error/10 text-error shrink-0 transition-transform group-hover:scale-105">
            <AlertTriangle size={20} />
          </span>
          <div className="flex items-center gap-1">
            {maxDaysOverdue > 0 && (
              <span className="badge badge-xs bg-error/15 text-error border-error/25 font-bold flex items-center gap-1">
                <Flame size={10} />
                Max {maxDaysOverdue}d
              </span>
            )}
            {activeTab === "overdue" && (
              <span className="badge badge-xs badge-error font-bold uppercase tracking-wider text-[10px]">
                Active Tab
              </span>
            )}
          </div>
        </div>

        <div className="mt-3">
          <div className="text-[11px] text-base-content/50 font-bold uppercase tracking-wider">
            Overdue Interest
          </div>
          <div className="text-2xl font-black tracking-tight text-error tabular-nums leading-tight mt-0.5">
            {loading ? "..." : formatCurrency(overdueAmount)}
          </div>
          <div className="text-[11px] text-base-content/60 font-medium mt-1">
            {overdueCount} cycle{overdueCount !== 1 ? "s" : ""} across {overdueLoans} loan{overdueLoans !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Quick Aging Tier Chips */}
        <div className="grid grid-cols-4 gap-1 mt-2.5 pt-2 border-t border-base-200 text-[10px]">
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelectTab && onSelectTab("overdue");
              onSelectAgingBucket && onSelectAgingBucket("1-15");
            }}
            className={`text-center py-0.5 px-1 rounded-md transition-colors ${
              activeAgingBucket === "1-15" && activeTab === "overdue"
                ? "bg-amber-500 text-white font-bold"
                : "bg-base-200/70 hover:bg-amber-500/20 text-base-content/70"
            }`}
            title="1 to 15 days overdue"
          >
            <div className="font-semibold leading-none">1-15d</div>
            <div className="text-[9px] font-bold tabular-nums mt-0.5">
              {aging.bucket_1_15?.count || 0}
            </div>
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelectTab && onSelectTab("overdue");
              onSelectAgingBucket && onSelectAgingBucket("16-30");
            }}
            className={`text-center py-0.5 px-1 rounded-md transition-colors ${
              activeAgingBucket === "16-30" && activeTab === "overdue"
                ? "bg-orange-500 text-white font-bold"
                : "bg-base-200/70 hover:bg-orange-500/20 text-base-content/70"
            }`}
            title="16 to 30 days overdue"
          >
            <div className="font-semibold leading-none">16-30d</div>
            <div className="text-[9px] font-bold tabular-nums mt-0.5">
              {aging.bucket_16_30?.count || 0}
            </div>
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelectTab && onSelectTab("overdue");
              onSelectAgingBucket && onSelectAgingBucket("31-60");
            }}
            className={`text-center py-0.5 px-1 rounded-md transition-colors ${
              activeAgingBucket === "31-60" && activeTab === "overdue"
                ? "bg-red-500 text-white font-bold"
                : "bg-base-200/70 hover:bg-red-500/20 text-base-content/70"
            }`}
            title="31 to 60 days overdue"
          >
            <div className="font-semibold leading-none">31-60d</div>
            <div className="text-[9px] font-bold tabular-nums mt-0.5">
              {aging.bucket_31_60?.count || 0}
            </div>
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelectTab && onSelectTab("overdue");
              onSelectAgingBucket && onSelectAgingBucket("60+");
            }}
            className={`text-center py-0.5 px-1 rounded-md transition-colors ${
              activeAgingBucket === "60+" && activeTab === "overdue"
                ? "bg-red-700 text-white font-bold"
                : "bg-base-200/70 hover:bg-red-600/20 text-error font-bold"
            }`}
            title="Over 60 days overdue (Critical)"
          >
            <div className="font-semibold leading-none">60+d</div>
            <div className="text-[9px] font-bold tabular-nums mt-0.5">
              {aging.bucket_60_plus?.count || 0}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Upcoming (Next 7 Days) Card */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-secondary/10 text-secondary shrink-0">
            <Clock size={20} />
          </span>
          <span className="badge badge-xs badge-secondary badge-outline font-semibold">
            Next 7 Days
          </span>
        </div>

        <div className="mt-3">
          <div className="text-[11px] text-base-content/50 font-bold uppercase tracking-wider">
            Upcoming Interest Due
          </div>
          <div className="text-2xl font-black tracking-tight text-base-content tabular-nums leading-tight mt-0.5">
            {loading ? "..." : formatCurrency(upcomingAmount)}
          </div>
          <div className="text-[11px] text-base-content/60 font-medium mt-1">
            {upcomingCount} cycle{upcomingCount !== 1 ? "s" : ""} scheduled
          </div>
        </div>

        <div className="pt-2 border-t border-base-200 flex items-center justify-between text-[11px] text-base-content/60 font-medium mt-2.5">
          <span>Expected inflow</span>
          <span className="text-secondary font-bold flex items-center gap-0.5">
            Forecast <ArrowUpRight size={12} />
          </span>
        </div>
      </div>
    </div>
  );
}
