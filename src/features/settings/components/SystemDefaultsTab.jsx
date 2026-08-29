import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sliders,
  Building,
  CreditCard,
  ShieldCheck,
  Users,
  Check,
  Percent,
  Calendar,
  Receipt,
  ArrowRight,
  Save,
} from "lucide-react";

export default function SystemDefaultsTab() {
  const navigate = useNavigate();

  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem("meridian-system-defaults");
    return saved
      ? JSON.parse(saved)
      : {
          interestType: "reducing",
          defaultInterestRate: 14.5,
          defaultTenureMonths: 12,
          gracePeriodDays: 3,
          penaltyRateMonthly: 2.0,
          autoGenerateReceipt: true,
          autoSendReceiptSMS: true,
          enforceGuarantorForBigLoans: true,
          bigLoanThreshold: 100000,
        };
  });

  const [toastMessage, setToastMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem("meridian-system-defaults", JSON.stringify(config));
      setSaving(false);
      showToast("System & Loan calculation defaults saved successfully!");
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="alert alert-success shadow-lg text-sm flex items-center justify-between py-2.5 px-4 rounded-xl sticky top-20 z-30 transition-all">
          <div className="flex items-center gap-2">
            <Check size={16} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 1. System Quick Navigation Cards */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <h3 className="font-semibold text-base flex items-center gap-2 text-base-content mb-1">
          <Building size={18} className="text-primary" />
          Enterprise Entity & Master Settings
        </h3>
        <p className="text-xs text-base-content/60 mb-5">
          Quick shortcuts to configure company information, settlement bank accounts, and role permissions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <div
            onClick={() => navigate("/companies-details")}
            className="cursor-pointer p-4 rounded-xl border border-base-300 bg-base-200/40 hover:bg-base-200 hover:border-primary/50 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                  <Building size={18} />
                </span>
                <ArrowRight size={16} className="text-base-content/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-sm font-semibold text-base-content">Company Profile</h4>
              <p className="text-xs text-base-content/50 mt-1">
                Legal name, GSTIN, registered address, tax ID, and invoice logo.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-primary mt-3 block">
              Manage Company Info →
            </span>
          </div>

          <div
            onClick={() => navigate("/bank-accounts")}
            className="cursor-pointer p-4 rounded-xl border border-base-300 bg-base-200/40 hover:bg-base-200 hover:border-primary/50 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-info/10 text-info group-hover:scale-105 transition-transform">
                  <CreditCard size={18} />
                </span>
                <ArrowRight size={16} className="text-base-content/40 group-hover:text-info group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-sm font-semibold text-base-content">Bank Accounts</h4>
              <p className="text-xs text-base-content/50 mt-1">
                Disbursement & collection bank accounts, UPI IDs, and ledger balances.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-info mt-3 block">
              View Bank Accounts →
            </span>
          </div>

          <div
            onClick={() => navigate("/role-permissions")}
            className="cursor-pointer p-4 rounded-xl border border-base-300 bg-base-200/40 hover:bg-base-200 hover:border-primary/50 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-success/15 text-success group-hover:scale-105 transition-transform">
                  <ShieldCheck size={18} />
                </span>
                <ArrowRight size={16} className="text-base-content/40 group-hover:text-success group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-sm font-semibold text-base-content">Role Permissions</h4>
              <p className="text-xs text-base-content/50 mt-1">
                Granular access matrix: loan officer, collector, and auditor permissions.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-success mt-3 block">
              Configure Matrix →
            </span>
          </div>
        </div>
      </div>

      {/* 2. Loan Calculation & System Defaults Form */}
      <form onSubmit={handleSave} className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <h3 className="font-semibold text-base flex items-center gap-2 text-base-content mb-1">
          <Sliders size={18} className="text-primary" />
          Default Loan Parameters & Grace Rules
        </h3>
        <p className="text-xs text-base-content/60 mb-5">
          Pre-populated values used when creating new loans, plans, and EMI calculation schedules.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Interest Method */}
          <div className="form-control">
            <label className="label pb-1.5" htmlFor="calc-interest-method">
              <span className="label-text text-xs font-semibold text-base-content">
                Standard Interest Calculation Type
              </span>
            </label>
            <select
              id="calc-interest-method"
              className="select select-bordered select-sm rounded-lg"
              value={config.interestType}
              onChange={(e) => handleChange("interestType", e.target.value)}
            >
              <option value="reducing">Reducing Balance Method (Standard EMI)</option>
              <option value="flat">Flat Rate Method (Fixed Interest on Principal)</option>
              <option value="compound">Compound / Daily Rest</option>
            </select>
          </div>

          {/* Default Annual Interest Rate */}
          <div className="form-control">
            <label className="label pb-1.5" htmlFor="calc-default-rate">
              <span className="label-text text-xs font-semibold text-base-content">
                Default Annual Interest Rate (%)
              </span>
            </label>
            <label className="input input-bordered input-sm flex items-center gap-2 rounded-lg">
              <input
                id="calc-default-rate"
                type="number"
                step="0.1"
                min="0"
                max="100"
                className="grow"
                value={config.defaultInterestRate}
                onChange={(e) => handleChange("defaultInterestRate", parseFloat(e.target.value) || 0)}
              />
              <span className="text-xs text-base-content/40">% p.a.</span>
            </label>
          </div>

          {/* Grace Period */}
          <div className="form-control">
            <label className="label pb-1.5" htmlFor="calc-grace-period">
              <span className="label-text text-xs font-semibold text-base-content">
                EMI Grace Period
              </span>
            </label>
            <label className="input input-bordered input-sm flex items-center gap-2 rounded-lg">
              <input
                id="calc-grace-period"
                type="number"
                min="0"
                max="30"
                className="grow"
                value={config.gracePeriodDays}
                onChange={(e) => handleChange("gracePeriodDays", parseInt(e.target.value, 10) || 0)}
              />
              <span className="text-xs text-base-content/40">Days</span>
            </label>
            <span className="text-[11px] text-base-content/50 mt-1">
              Days after due date before late penalty fees are calculated.
            </span>
          </div>

          {/* Monthly Late Penalty */}
          <div className="form-control">
            <label className="label pb-1.5" htmlFor="calc-penalty-rate">
              <span className="label-text text-xs font-semibold text-base-content">
                Overdue Late Penalty Rate
              </span>
            </label>
            <label className="input input-bordered input-sm flex items-center gap-2 rounded-lg">
              <input
                id="calc-penalty-rate"
                type="number"
                step="0.1"
                min="0"
                max="50"
                className="grow"
                value={config.penaltyRateMonthly}
                onChange={(e) => handleChange("penaltyRateMonthly", parseFloat(e.target.value) || 0)}
              />
              <span className="text-xs text-base-content/40">% per month</span>
            </label>
          </div>
        </div>

        {/* Toggles */}
        <div className="mt-6 pt-5 border-t border-base-200 space-y-4">
          <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-base-200/40">
            <div>
              <div className="text-sm font-semibold text-base-content">
                Auto-generate digital receipt on payment
              </div>
              <div className="text-xs text-base-content/50">
                Immediately issues PDF/printable receipt with transaction reference.
              </div>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={config.autoGenerateReceipt}
              onChange={(e) => handleChange("autoGenerateReceipt", e.target.checked)}
            />
          </div>

          <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-base-200/40">
            <div>
              <div className="text-sm font-semibold text-base-content">
                Send SMS receipt confirmation to borrower
              </div>
              <div className="text-xs text-base-content/50">
                Dispatches instant SMS acknowledgment once agent collects payment.
              </div>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={config.autoSendReceiptSMS}
              onChange={(e) => handleChange("autoSendReceiptSMS", e.target.checked)}
            />
          </div>

          <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-base-200/40">
            <div>
              <div className="text-sm font-semibold text-base-content">
                Mandatory Guarantor for High-Value Loans
              </div>
              <div className="text-xs text-base-content/50">
                Requires at least 1 verified guarantor for loan amounts above ₹1,00,000.
              </div>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={config.enforceGuarantorForBigLoans}
              onChange={(e) => handleChange("enforceGuarantorForBigLoans", e.target.checked)}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary btn-sm rounded-lg gap-2"
          >
            <Save size={14} />
            {saving ? "Saving Defaults..." : "Save System Defaults"}
          </button>
        </div>
      </form>
    </div>
  );
}
