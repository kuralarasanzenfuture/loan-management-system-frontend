import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  ShieldCheck,
  Smartphone,
  Lock,
  Key,
  LogOut,
  Check,
  Eye,
  EyeOff,
  AlertTriangle,
  Monitor,
  Tablet,
  History,
  QrCode,
  Copy,
  RefreshCw,
} from "lucide-react";
import { changePassword } from "../../../redux/users/userSlice.js";

const INITIAL_SESSIONS = [
  {
    id: 1,
    device: "Chrome on Windows 11",
    ip: "192.168.1.45 (Salem, India)",
    current: true,
    lastActive: "Active now",
    type: "desktop",
  },
  {
    id: 2,
    device: "Safari on iPhone 15 Pro",
    ip: "157.48.21.90 (Chennai, India)",
    current: false,
    lastActive: "2 hours ago",
    type: "mobile",
  },
  {
    id: 3,
    device: "Firefox on macOS Sonoma",
    ip: "49.207.195.12 (Bangalore, India)",
    current: false,
    lastActive: "3 days ago",
    type: "desktop",
  },
];

const SECURITY_LOGS = [
  {
    id: 1,
    event: "Successful password login",
    ip: "192.168.1.45",
    location: "Salem, India",
    date: "Today at 09:15 AM",
    status: "success",
  },
  {
    id: 2,
    event: "Security preferences updated",
    ip: "192.168.1.45",
    location: "Salem, India",
    date: "Yesterday at 04:30 PM",
    status: "success",
  },
  {
    id: 3,
    event: "New device login detected",
    ip: "157.48.21.90",
    location: "Chennai, India",
    date: "3 days ago",
    status: "warning",
  },
];

export default function SecurityTab() {
  const dispatch = useDispatch();

  // 2FA state
  const [twoFactor, setTwoFactor] = useState(
    () => localStorage.getItem("meridian-2fa") === "true",
  );
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);

  // Password state
  const [pwForm, setPwForm] = useState({
    current: "",
    newPw: "",
    confirmPw: "",
  });
  const [showPw, setShowPw] = useState({
    current: false,
    newPw: false,
    confirmPw: false,
  });
  const [pwErrors, setPwErrors] = useState({});
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Password strength calculator
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "Empty", color: "bg-base-300" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: "Weak", color: "bg-error" };
      case 2:
        return { score: 50, label: "Fair", color: "bg-warning" };
      case 3:
        return { score: 75, label: "Good", color: "bg-info" };
      case 4:
        return { score: 100, label: "Strong", color: "bg-success" };
      default:
        return { score: 0, label: "Very Weak", color: "bg-error" };
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!pwForm.current) errors.current = "Current password is required";
    if (!pwForm.newPw) {
      errors.newPw = "New password is required";
    } else if (pwForm.newPw.length < 8) {
      errors.newPw = "Password must be at least 8 characters long";
    }
    if (pwForm.confirmPw !== pwForm.newPw) {
      errors.confirmPw = "Passwords do not match";
    }

    setPwErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPwLoading(true);
    try {
      await dispatch(
        changePassword({
          current_password: pwForm.current,
          new_password: pwForm.newPw,
        }),
      ).unwrap();

      setPwSuccess(true);
      setPwForm({ current: "", newPw: "", confirmPw: "" });
      showToast("Password changed successfully!");
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      // A rejected change-password call almost always means the current
      // password was wrong, so anchoring the server's error message there
      // (rather than a generic top-of-form banner) points the user at the
      // actual field to fix — same pattern as ProfilePage.jsx.
      const message =
        typeof err === "string"
          ? err
          : err?.message || "Couldn't update your password.";
      setPwErrors({ current: message });
      showToast(message);
    } finally {
      setPwLoading(false);
    }
  };

  const handleToggle2FA = () => {
    if (twoFactor) {
      // Disable 2FA
      setTwoFactor(false);
      localStorage.setItem("meridian-2fa", "false");
      showToast("Two-factor authentication has been disabled.");
    } else {
      // Open Setup Modal
      setShow2FAModal(true);
    }
  };

  const handleConfirm2FA = () => {
    if (twoFactorCode.length < 6) {
      showToast("Please enter a valid 6-digit verification code");
      return;
    }
    setTwoFactor(true);
    localStorage.setItem("meridian-2fa", "true");
    setShow2FAModal(false);
    setTwoFactorCode("");
    showToast("Two-factor authentication successfully enabled!");
  };

  const handleRevokeSession = (id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    showToast("Session revoked successfully.");
  };

  const handleRevokeAllOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.current));
    showToast("All other active sessions have been signed out.");
  };

  const copySecretKey = () => {
    navigator.clipboard.writeText("JBSWY3DPEHPK3PXP");
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const pwStrength = getPasswordStrength(pwForm.newPw);

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

      {/* 1. Two-Factor Authentication */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3.5">
            <span
              className={`flex items-center justify-center w-11 h-11 rounded-2xl shrink-0 ${
                twoFactor
                  ? "bg-success/15 text-success"
                  : "bg-base-200 text-base-content/70"
              }`}
            >
              <Smartphone size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-base-content">
                  Two-Factor Authentication (2FA)
                </h3>
                <span
                  className={`badge badge-sm font-medium ${
                    twoFactor
                      ? "badge-success text-success-content"
                      : "badge-ghost"
                  }`}
                >
                  {twoFactor ? "Enabled" : "Disabled"}
                </span>
              </div>
              <p className="text-xs text-base-content/60 mt-1 max-w-lg">
                Protect your account by requiring an authenticator app (Google
                Authenticator, Authy) one-time code during login.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggle2FA}
              className={`btn btn-sm ${
                twoFactor ? "btn-outline btn-error" : "btn-primary"
              }`}
            >
              {twoFactor ? "Disable 2FA" : "Enable 2FA"}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Change Password */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-base flex items-center gap-2 text-base-content">
              <Lock size={18} className="text-primary" />
              Change Account Password
            </h3>
            <p className="text-xs text-base-content/60 mt-0.5">
              Ensure your password is strong and contains special characters.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
          {/* Current Password */}
          <div className="form-control">
            <label className="label pb-1" htmlFor="current-pw">
              <span className="label-text text-xs font-semibold text-base-content">
                Current Password
              </span>
            </label>
            <div className="relative">
              <input
                id="current-pw"
                type={showPw.current ? "text" : "password"}
                value={pwForm.current}
                onChange={(e) =>
                  setPwForm((f) => ({ ...f, current: e.target.value }))
                }
                disabled={pwLoading}
                className={`input input-bordered input-sm w-full pr-10 rounded-lg ${
                  pwErrors.current ? "input-error" : ""
                }`}
                placeholder="Enter current password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70"
                onClick={() =>
                  setShowPw((s) => ({ ...s, current: !s.current }))
                }
              >
                {showPw.current ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {pwErrors.current && (
              <span className="text-[11px] text-error mt-1">
                {pwErrors.current}
              </span>
            )}
          </div>

          {/* New Password */}
          <div className="form-control">
            <label className="label pb-1" htmlFor="new-pw">
              <span className="label-text text-xs font-semibold text-base-content">
                New Password
              </span>
            </label>
            <div className="relative">
              <input
                id="new-pw"
                type={showPw.newPw ? "text" : "password"}
                value={pwForm.newPw}
                onChange={(e) =>
                  setPwForm((f) => ({ ...f, newPw: e.target.value }))
                }
                disabled={pwLoading}
                className={`input input-bordered input-sm w-full pr-10 rounded-lg ${
                  pwErrors.newPw ? "input-error" : ""
                }`}
                placeholder="Minimum 8 characters"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70"
                onClick={() => setShowPw((s) => ({ ...s, newPw: !s.newPw }))}
              >
                {showPw.newPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {pwErrors.newPw && (
              <span className="text-[11px] text-error mt-1">
                {pwErrors.newPw}
              </span>
            )}

            {/* Strength meter */}
            {pwForm.newPw && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-base-content/60">Strength:</span>
                  <span className="font-semibold text-base-content">
                    {pwStrength.label}
                  </span>
                </div>
                <div className="w-full bg-base-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${pwStrength.color}`}
                    style={{ width: `${pwStrength.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="form-control">
            <label className="label pb-1" htmlFor="confirm-pw">
              <span className="label-text text-xs font-semibold text-base-content">
                Confirm New Password
              </span>
            </label>
            <div className="relative">
              <input
                id="confirm-pw"
                type={showPw.confirmPw ? "text" : "password"}
                value={pwForm.confirmPw}
                onChange={(e) =>
                  setPwForm((f) => ({ ...f, confirmPw: e.target.value }))
                }
                disabled={pwLoading}
                className={`input input-bordered input-sm w-full pr-10 rounded-lg ${
                  pwErrors.confirmPw ? "input-error" : ""
                }`}
                placeholder="Re-enter new password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70"
                onClick={() =>
                  setShowPw((s) => ({ ...s, confirmPw: !s.confirmPw }))
                }
              >
                {showPw.confirmPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {pwErrors.confirmPw && (
              <span className="text-[11px] text-error mt-1">
                {pwErrors.confirmPw}
              </span>
            )}
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={pwLoading}
              className="btn btn-primary btn-sm rounded-lg"
            >
              {pwLoading ? "Updating Password..." : "Update Password"}
            </button>
            {pwSuccess && (
              <span className="text-xs text-success flex items-center gap-1">
                <Check size={14} /> Password updated successfully
              </span>
            )}
          </div>
        </form>
      </div>

      {/* 3. Active Sessions */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div>
            <h3 className="font-semibold text-base flex items-center gap-2 text-base-content">
              <Monitor size={18} className="text-primary" />
              Active Sessions & Devices
            </h3>
            <p className="text-xs text-base-content/60 mt-0.5">
              Devices and locations currently authorized to access your account.
            </p>
          </div>
          {sessions.length > 1 && (
            <button
              type="button"
              onClick={handleRevokeAllOtherSessions}
              className="btn btn-ghost btn-xs text-error hover:bg-error/10 gap-1.5"
            >
              <LogOut size={13} />
              Sign Out Other Devices
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-base-200 bg-base-200/40 p-3.5 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-base-200 text-base-content/70 shrink-0">
                  {s.type === "mobile" ? (
                    <Smartphone size={18} />
                  ) : (
                    <Monitor size={18} />
                  )}
                </span>
                <div>
                  <div className="text-sm font-semibold text-base-content flex items-center gap-2">
                    {s.device}
                    {s.current && (
                      <span className="badge badge-success badge-xs font-semibold">
                        Current Device
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-base-content/50 mt-0.5">
                    {s.ip} · <span className="font-medium">{s.lastActive}</span>
                  </div>
                </div>
              </div>

              {!s.current && (
                <button
                  type="button"
                  onClick={() => handleRevokeSession(s.id)}
                  className="btn btn-ghost btn-xs text-error hover:bg-error/10 rounded-lg gap-1"
                >
                  <LogOut size={12} />
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Security Audit Log */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <h3 className="font-semibold text-base flex items-center gap-2 text-base-content mb-1">
          <History size={18} className="text-primary" />
          Recent Security Activity
        </h3>
        <p className="text-xs text-base-content/60 mb-4">
          Audit trail of recent authentication and permission events.
        </p>

        <div className="divide-y divide-base-200">
          {SECURITY_LOGS.map((log) => (
            <div
              key={log.id}
              className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    log.status === "warning" ? "bg-warning" : "bg-success"
                  }`}
                />
                <div>
                  <div className="text-xs font-semibold text-base-content">
                    {log.event}
                  </div>
                  <div className="text-[11px] text-base-content/50 mt-0.5">
                    IP: {log.ip} ({log.location})
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-base-content/40 shrink-0">
                {log.date}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="modal modal-open">
          <div className="modal-box rounded-2xl max-w-md border border-base-300 bg-base-100 p-6">
            <h3 className="font-bold text-lg flex items-center gap-2 text-base-content">
              <QrCode size={20} className="text-primary" />
              Set Up Two-Factor Authentication
            </h3>
            <p className="text-xs text-base-content/60 mt-1">
              Scan this QR code with Google Authenticator, Microsoft
              Authenticator, or Authy.
            </p>

            <div className="my-5 flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-base-300">
              {/* Mock QR display */}
              <div className="w-40 h-40 bg-neutral-900 rounded-lg flex items-center justify-center p-2 text-white relative">
                <QrCode size={128} className="text-white" />
              </div>
              <span className="text-[11px] text-neutral-600 mt-2 font-mono">
                LoanManagement: sarah@meridian.com
              </span>
            </div>

            <div className="form-control mb-4">
              <label className="label pb-1">
                <span className="label-text text-xs font-semibold text-base-content">
                  Or enter secret key manually:
                </span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="JBSWY3DPEHPK3PXP"
                  className="input input-bordered input-sm font-mono text-xs grow rounded-lg"
                />
                <button
                  type="button"
                  onClick={copySecretKey}
                  className="btn btn-sm btn-outline rounded-lg"
                >
                  {copiedKey ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="form-control mb-6">
              <label className="label pb-1" htmlFor="totp-code">
                <span className="label-text text-xs font-semibold text-base-content">
                  Enter 6-digit code from your app
                </span>
              </label>
              <input
                id="totp-code"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={twoFactorCode}
                onChange={(e) =>
                  setTwoFactorCode(e.target.value.replace(/\D/g, ""))
                }
                className="input input-bordered input-sm tracking-widest text-center font-mono font-bold text-base rounded-lg"
              />
            </div>

            <div className="modal-action flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShow2FAModal(false)}
                className="btn btn-sm btn-ghost rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm2FA}
                className="btn btn-sm btn-primary rounded-lg"
              >
                Verify & Activate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
