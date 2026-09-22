import React from "react";
import {
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  Wallet,
  Landmark,
  Receipt,
  Percent,
} from "lucide-react";

const formatCurrency = (amount) => {
  const val = Number(amount || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(val);
};

export default function InterestLoanReportKPIs({ summary = {}, loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-base-100 border border-base-300 animate-pulse p-4 flex flex-col justify-between"
          >
            <div className="h-4 bg-base-200 rounded w-1/2" />
            <div className="h-8 bg-base-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  const collectionRate = summary?.collection_rate ?? 0;
  const overdueAmount = summary?.total_overdue_amount ?? 0;
  const overdueLoans = summary?.total_loans_overdue ?? 0;

  const kpis = [
    {
      title: "Total Principal Disbursed",
      value: formatCurrency(summary.total_principal_disbursed),
      subtitle: `${summary.total_loans ?? 0} Total Loans (${summary.active_loans ?? 0} Active)`,
      icon: Landmark,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
    },
    {
      title: "Outstanding Principal",
      value: formatCurrency(summary.total_outstanding_principal),
      subtitle: `${summary.completed_loans ?? 0} Completed • ${summary.closed_loans ?? 0} Closed`,
      icon: Wallet,
      color: "text-info",
      bgColor: "bg-info/10",
      borderColor: "border-info/20",
    },
    {
      title: "Total Interest Collected",
      value: formatCurrency(summary.total_interest_collected),
      subtitle: `Out of ${formatCurrency(summary.total_interest_accrued)} accrued`,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/20",
      badge: `${collectionRate}% Rate`,
      badgeColor: collectionRate >= 80 ? "badge-success" : "badge-warning",
    },
    {
      title: "Overdue Interest Dues",
      value: formatCurrency(overdueAmount),
      subtitle: `${overdueLoans} ${overdueLoans === 1 ? "loan" : "loans"} with overdue cycles`,
      icon: AlertTriangle,
      color: overdueAmount > 0 ? "text-error" : "text-base-content/60",
      bgColor: overdueAmount > 0 ? "bg-error/10" : "bg-base-200",
      borderColor: overdueAmount > 0 ? "border-error/30" : "border-base-300",
      badge: overdueAmount > 0 ? "Action Needed" : "Healthy",
      badgeColor: overdueAmount > 0 ? "badge-error text-white" : "badge-ghost",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className={`bg-base-100 rounded-2xl border p-4 shadow-2xs transition-all hover:shadow-sm ${kpi.borderColor}`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-base-content/60 truncate">
                {kpi.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${kpi.bgColor} ${kpi.color}`}
              >
                <Icon size={18} />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xl font-bold tracking-tight text-base-content truncate">
                {kpi.value}
              </span>
              {kpi.badge && (
                <span className={`badge badge-sm font-semibold shrink-0 ${kpi.badgeColor}`}>
                  {kpi.badge}
                </span>
              )}
            </div>

            <p className="text-xs text-base-content/50 mt-1.5 truncate">
              {kpi.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
}
