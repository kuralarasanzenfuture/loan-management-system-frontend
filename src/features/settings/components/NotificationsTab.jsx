import React, { useState } from "react";
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Volume2,
  Moon,
  Check,
  Send,
  AlertCircle,
  FileText,
  CreditCard,
  ShieldAlert,
} from "lucide-react";

export default function NotificationsTab() {
  const [prefs, setPrefs] = useState(() => {
    const saved = localStorage.getItem("meridian-notification-prefs");
    return saved
      ? JSON.parse(saved)
      : {
          // Channels
          emailChannel: true,
          smsChannel: true,
          inAppChannel: true,
          whatsappChannel: false,

          // Loan Events
          newLoanApp: true,
          loanApproval: true,
          loanDisbursement: true,

          // Collection & Repayments
          emiDueReminder: true,
          emiOverdueAlert: true,
          paymentReceipt: true,

          // Reports & Digests
          weeklyReport: true,
          monthlyAnalytics: false,

          // System
          securityAlerts: true,
          maintenanceUpdates: false,

          // Sound & DND
          soundEnabled: true,
          dndEnabled: false,
          dndStart: "22:00",
          dndEnd: "08:00",
        };
  });

  const [toastMessage, setToastMessage] = useState(null);
  const [testSending, setTestSending] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const updatePref = (key, value) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    localStorage.setItem("meridian-notification-prefs", JSON.stringify(updated));
    showToast("Notification preference updated");
  };

  const handleSendTestNotification = () => {
    setTestSending(true);
    setTimeout(() => {
      setTestSending(false);
      showToast("Test notification sent successfully to your active channels!");
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

      {/* Header & Quick Action */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-semibold text-base flex items-center gap-2 text-base-content">
            <Bell size={18} className="text-primary" />
            Notification Preferences
          </h3>
          <p className="text-xs text-base-content/60 mt-0.5">
            Configure how and when you receive critical alerts, EMI reminders, and reports.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSendTestNotification}
          disabled={testSending}
          className="btn btn-outline btn-sm rounded-lg gap-2 text-xs"
        >
          <Send size={13} />
          {testSending ? "Sending..." : "Send Test Notification"}
        </button>
      </div>

      {/* 1. Delivery Channels */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <h4 className="font-semibold text-sm text-base-content mb-1">
          Notification Delivery Channels
        </h4>
        <p className="text-xs text-base-content/60 mb-4">
          Choose where notifications are dispatched.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Email */}
          <div className="p-4 rounded-xl border border-base-300 bg-base-200/40 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                <Mail size={16} />
              </span>
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={prefs.emailChannel}
                onChange={(e) => updatePref("emailChannel", e.target.checked)}
              />
            </div>
            <div>
              <div className="text-sm font-semibold text-base-content">Email Digest</div>
              <div className="text-[11px] text-base-content/50 mt-0.5">
                Statements, reports, and receipts
              </div>
            </div>
          </div>

          {/* SMS */}
          <div className="p-4 rounded-xl border border-base-300 bg-base-200/40 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                <Smartphone size={16} />
              </span>
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={prefs.smsChannel}
                onChange={(e) => updatePref("smsChannel", e.target.checked)}
              />
            </div>
            <div>
              <div className="text-sm font-semibold text-base-content">SMS Alerts</div>
              <div className="text-[11px] text-base-content/50 mt-0.5">
                Instant critical payment reminders
              </div>
            </div>
          </div>

          {/* In-App Push */}
          <div className="p-4 rounded-xl border border-base-300 bg-base-200/40 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                <Bell size={16} />
              </span>
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={prefs.inAppChannel}
                onChange={(e) => updatePref("inAppChannel", e.target.checked)}
              />
            </div>
            <div>
              <div className="text-sm font-semibold text-base-content">In-App Banner</div>
              <div className="text-[11px] text-base-content/50 mt-0.5">
                Top bar live activity toasts
              </div>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="p-4 rounded-xl border border-base-300 bg-base-200/40 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-success/15 text-success">
                <MessageSquare size={16} />
              </span>
              <input
                type="checkbox"
                className="toggle toggle-success toggle-sm"
                checked={prefs.whatsappChannel}
                onChange={(e) => updatePref("whatsappChannel", e.target.checked)}
              />
            </div>
            <div>
              <div className="text-sm font-semibold text-base-content">WhatsApp Business</div>
              <div className="text-[11px] text-base-content/50 mt-0.5">
                Direct customer reminders & receipts
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Event Triggers */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <h4 className="font-semibold text-sm text-base-content mb-1">
          Event Triggers & Alerts
        </h4>
        <p className="text-xs text-base-content/60 mb-5">
          Specify which activities generate notifications.
        </p>

        <div className="space-y-6 divide-y divide-base-200">
          {/* Section: Loans */}
          <div className="pt-4 first:pt-0">
            <div className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
              <FileText size={14} />
              Loan Applications & Approvals
            </div>
            <div className="space-y-3">
              {[
                {
                  key: "newLoanApp",
                  title: "New loan application submitted",
                  desc: "Receive alert whenever a customer applies for a new loan plan.",
                },
                {
                  key: "loanApproval",
                  title: "Loan approval & rejection decisions",
                  desc: "Notifications when officer approves or rejects an application.",
                },
                {
                  key: "loanDisbursement",
                  title: "Loan disbursement confirmations",
                  desc: "Notice when funds are transferred and loan status turns active.",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 p-2.5 rounded-lg hover:bg-base-200/50 transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium text-base-content">
                      {item.title}
                    </div>
                    <div className="text-xs text-base-content/50 mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary toggle-sm shrink-0"
                    checked={prefs[item.key]}
                    onChange={(e) => updatePref(item.key, e.target.checked)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section: Repayments & Collections */}
          <div className="pt-4">
            <div className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
              <CreditCard size={14} />
              EMI & Repayment Collections
            </div>
            <div className="space-y-3">
              {[
                {
                  key: "emiDueReminder",
                  title: "EMI due date reminder",
                  desc: "Alerts 3 days prior to an installment due date.",
                },
                {
                  key: "emiOverdueAlert",
                  title: "Overdue & default warning",
                  desc: "Immediate alert when an installment crosses the grace period.",
                },
                {
                  key: "paymentReceipt",
                  title: "Collection receipt confirmation",
                  desc: "Notification when collection agent records a cash or online payment.",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 p-2.5 rounded-lg hover:bg-base-200/50 transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium text-base-content">
                      {item.title}
                    </div>
                    <div className="text-xs text-base-content/50 mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary toggle-sm shrink-0"
                    checked={prefs[item.key]}
                    onChange={(e) => updatePref(item.key, e.target.checked)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section: Security & System */}
          <div className="pt-4">
            <div className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
              <ShieldAlert size={14} />
              Security & Reports
            </div>
            <div className="space-y-3">
              {[
                {
                  key: "weeklyReport",
                  title: "Weekly portfolio performance report",
                  desc: "Summary of disbursements, collections, and total outstanding.",
                },
                {
                  key: "securityAlerts",
                  title: "Security alerts & login from new IP",
                  desc: "Instant notifications for unrecognized logins or permission changes.",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 p-2.5 rounded-lg hover:bg-base-200/50 transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium text-base-content">
                      {item.title}
                    </div>
                    <div className="text-xs text-base-content/50 mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary toggle-sm shrink-0"
                    checked={prefs[item.key]}
                    onChange={(e) => updatePref(item.key, e.target.checked)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sound & Quiet Hours */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <h4 className="font-semibold text-sm text-base-content mb-1 flex items-center gap-2">
          <Moon size={16} className="text-primary" />
          Quiet Hours & Sound Settings
        </h4>
        <p className="text-xs text-base-content/60 mb-4">
          Silence audio alerts during specific hours.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-base-200/50">
            <div className="flex items-center gap-3">
              <Volume2 size={18} className="text-primary" />
              <div>
                <div className="text-sm font-medium text-base-content">Notification Sound</div>
                <div className="text-xs text-base-content/50">Play chime when in-app alerts arrive.</div>
              </div>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={prefs.soundEnabled}
              onChange={(e) => updatePref("soundEnabled", e.target.checked)}
            />
          </div>

          <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-base-200/50 flex-wrap">
            <div className="flex items-center gap-3">
              <Moon size={18} className="text-primary" />
              <div>
                <div className="text-sm font-medium text-base-content">Do Not Disturb Schedule</div>
                <div className="text-xs text-base-content/50">Mute non-urgent notifications during nighttime.</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={prefs.dndEnabled}
                onChange={(e) => updatePref("dndEnabled", e.target.checked)}
              />
            </div>
          </div>

          {prefs.dndEnabled && (
            <div className="flex items-center gap-4 pl-9 pt-1">
              <div className="flex items-center gap-2 text-xs text-base-content">
                <span>From:</span>
                <input
                  type="time"
                  className="input input-bordered input-xs rounded-lg font-mono"
                  value={prefs.dndStart}
                  onChange={(e) => updatePref("dndStart", e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-base-content">
                <span>To:</span>
                <input
                  type="time"
                  className="input input-bordered input-xs rounded-lg font-mono"
                  value={prefs.dndEnd}
                  onChange={(e) => updatePref("dndEnd", e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
