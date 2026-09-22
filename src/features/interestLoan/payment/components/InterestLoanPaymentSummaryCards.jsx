import React from "react";
import {
  DollarSign,
  TrendingUp,
  Percent,
  Receipt,
  Banknote,
  Building2,
  Smartphone,
  FileCheck2,
} from "lucide-react";
import { formatCurrency, formatNumber } from "../utils/interestLoanPaymentHelpers.js";

export default function InterestLoanPaymentSummaryCards({ summary, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-base-100 border border-base-300 animate-pulse p-4"
          />
        ))}
      </div>
    );
  }

  const data = summary || {
    total_payments: 0,
    total_amount_collected: 0,
    total_interest_collected: 0,
    total_principal_collected: 0,
    by_mode: {
      cash: 0,
      bank: 0,
      upi: 0,
      cheque: 0,
      other: 0,
    },
  };

  return (
    <div className="space-y-3">
      {/* 4 Main Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
              Total Collected
            </span>
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
              <DollarSign size={18} />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-base-content tracking-tight">
              {formatCurrency(data.total_amount_collected)}
            </span>
            <p className="text-[11px] text-base-content/50 mt-0.5">
              Across all anytime loans
            </p>
          </div>
        </div>

        {/* Total Interest Collected */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
              Interest Revenue
            </span>
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-secondary/10 text-secondary">
              <Percent size={18} />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-secondary tracking-tight">
              {formatCurrency(data.total_interest_collected)}
            </span>
            <p className="text-[11px] text-base-content/50 mt-0.5">
              Settled period charges
            </p>
          </div>
        </div>

        {/* Total Principal Returned */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
              Principal Recovered
            </span>
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-success/10 text-success">
              <TrendingUp size={18} />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-success tracking-tight">
              {formatCurrency(data.total_principal_collected)}
            </span>
            <p className="text-[11px] text-base-content/50 mt-0.5">
              Direct balance repayments
            </p>
          </div>
        </div>

        {/* Total Payments Count */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
              Payment Receipts
            </span>
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-info/10 text-info">
              <Receipt size={18} />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-base-content tracking-tight">
              {formatNumber(data.total_payments)}
            </span>
            <p className="text-[11px] text-base-content/50 mt-0.5">
              Transactions processed
            </p>
          </div>
        </div>
      </div>

      {/* Mode Distribution Pills Strip */}
      <div className="flex items-center gap-2 flex-wrap text-xs bg-base-100 border border-base-300 rounded-xl px-4 py-2.5">
        <span className="text-base-content/50 font-semibold uppercase text-[10px] tracking-wider mr-1">
          Collections by Mode:
        </span>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-medium">
          <Banknote size={13} />
          <span>Cash:</span>
          <span className="font-bold">{formatCurrency(data.by_mode?.cash || 0)}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 font-medium">
          <Building2 size={13} />
          <span>Bank:</span>
          <span className="font-bold">{formatCurrency(data.by_mode?.bank || 0)}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 font-medium">
          <Smartphone size={13} />
          <span>UPI:</span>
          <span className="font-bold">{formatCurrency(data.by_mode?.upi || 0)}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-medium">
          <FileCheck2 size={13} />
          <span>Cheque:</span>
          <span className="font-bold">{formatCurrency(data.by_mode?.cheque || 0)}</span>
        </div>
      </div>
    </div>
  );
}
