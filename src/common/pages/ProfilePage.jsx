import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { changePassword } from "../../redux/users/userSlice.js";

const DEFAULT_USER = {
  name: "Sarah Whitfield",
  email: "sarah.whitfield@meridianlending.com",
  role: "Senior Loan Officer",
  phone: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Turns "Sarah Whitfield" into "SW", "cheran" into "C", "" into "?" —
// mirrors the same initials-badge pattern used elsewhere in the app
// (Top Loan Officers leaderboard, Recent Loans table).
function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { passwordLoading, passwordError, passwordSuccess } = useSelector(
    (state) => state.users,
  );

  const currentUser = {
    name: user?.username || user?.name || user?.fullName || DEFAULT_USER.name,
    email: user?.email || DEFAULT_USER.email,
    role:
      user?.role_name || user?.role?.name || user?.role || DEFAULT_USER.role,
    phone: user?.phone || DEFAULT_USER.phone,
  };

  // ---- Personal info form ----
  const [infoForm, setInfoForm] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
  });
  const [infoFieldErrors, setInfoFieldErrors] = useState({});
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoSaved, setInfoSaved] = useState(false);

  const InfoFieldError = ({ field }) =>
    infoFieldErrors[field] ? (
      <span className="text-[11px] text-error mt-1 block">
        {infoFieldErrors[field]}
      </span>
    ) : null;

  const validateInfo = () => {
    const errs = {};
    if (!infoForm.name.trim()) errs.name = "Full name is required.";
    if (!infoForm.email.trim()) {
      errs.email = "Email is required.";
    } else if (!EMAIL_RE.test(infoForm.email.trim())) {
      errs.email = "Enter a valid email address.";
    }
    return errs;
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    const errs = validateInfo();
    setInfoFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setInfoSaving(true);
    setInfoSaved(false);
    try {
      // TODO: replace with your real thunk, e.g.
      // await dispatch(updateProfile(infoForm)).unwrap();
      await new Promise((r) => setTimeout(r, 700));
      setInfoSaved(true);
      setTimeout(() => setInfoSaved(false), 2500);
    } finally {
      setInfoSaving(false);
    }
  };

  // ---- Password form ----
  const [pwForm, setPwForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [pwFieldErrors, setPwFieldErrors] = useState({});
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  const PwFieldError = ({ field }) =>
    pwFieldErrors[field] ? (
      <span className="text-[11px] text-error mt-1 block">
        {pwFieldErrors[field]}
      </span>
    ) : null;

  const validatePassword = () => {
    const errs = {};
    if (!pwForm.current) errs.current = "Enter your current password.";
    if (!pwForm.next) {
      errs.next = "Enter a new password.";
    } else if (pwForm.next.length < 8) {
      errs.next = "Must be at least 8 characters.";
    }
    if (!pwForm.confirm) {
      errs.confirm = "Confirm your new password.";
    } else if (pwForm.next && pwForm.confirm !== pwForm.next) {
      errs.confirm = "Doesn't match new password.";
    }
    return errs;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errs = validatePassword();
    setPwFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setPwSaving(true);
    try {
      const payload = {
        current_password: pwForm.current,
        new_password: pwForm.next,
      };

      await dispatch(changePassword(payload)).unwrap();
      setPwForm({ current: "", next: "", confirm: "" });
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err) {
      setPwFieldErrors({
        current: err?.message || "Couldn't update your password.",
      });
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <User size={20} className="text-primary" />
          My Profile
        </h1>
        <p className="text-sm text-base-content/50 mt-1">
          Manage your personal information and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Left: identity card */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-6 flex flex-col items-center text-center h-fit">
          {/* Initials badge — no photo upload/storage needed, and never
              breaks the way an unset/broken avatarUrl would. */}
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-content ring-2 ring-primary/20 ring-offset-2 ring-offset-base-100">
            <span className="text-2xl font-bold tracking-wide">
              {getInitials(currentUser.name)}
            </span>
          </div>

          <h2 className="mt-4 font-semibold text-base text-base-content">
            {currentUser.name}
          </h2>
          <span className="badge badge-primary badge-outline gap-1.5 mt-2">
            <ShieldCheck size={12} />
            {currentUser.role}
          </span>

          <div className="w-full border-t border-base-200 mt-5 pt-4 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs text-base-content/50">
              <Mail size={13} className="shrink-0" />
              <span className="truncate">{currentUser.email}</span>
            </div>
            {currentUser.phone && (
              <div className="flex items-center gap-2 text-xs text-base-content/50">
                <Phone size={13} className="shrink-0" />
                <span className="truncate">{currentUser.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: forms */}
        <div className="space-y-6">
          {/* Personal information */}
          <div className="rounded-2xl border border-base-300 bg-base-100 p-6">
            <h3 className="font-semibold text-sm mb-1 text-base-content">
              Personal information
            </h3>
            <p className="text-xs text-base-content/50 mb-5">
              This is shown across the platform wherever your name appears.
            </p>

            <form onSubmit={handleInfoSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label pb-1" htmlFor="profile-name">
                    <span className="label-text text-xs font-semibold">
                      Full name
                    </span>
                  </label>
                  <label
                    className={`input input-bordered input-sm flex items-center gap-2 rounded-lg ${
                      infoFieldErrors.name ? "input-error" : ""
                    }`}
                  >
                    <User size={14} className="text-base-content/40 shrink-0" />
                    <input
                      id="profile-name"
                      type="text"
                      className="grow text-base-content"
                      value={infoForm.name}
                      onChange={(e) =>
                        setInfoForm((f) => ({ ...f, name: e.target.value }))
                      }
                      disabled={infoSaving}
                    />
                  </label>
                  <InfoFieldError field="name" />
                </div>

                <div className="form-control">
                  <label className="label pb-1" htmlFor="profile-phone">
                    <span className="label-text text-xs font-semibold">
                      Phone
                    </span>
                  </label>
                  <label className="input input-bordered input-sm flex items-center gap-2 rounded-lg">
                    <Phone
                      size={14}
                      className="text-base-content/40 shrink-0"
                    />
                    <input
                      id="profile-phone"
                      type="tel"
                      className="grow text-base-content"
                      placeholder="Not set"
                      value={infoForm.phone}
                      onChange={(e) =>
                        setInfoForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      disabled={infoSaving}
                    />
                  </label>
                </div>
              </div>

              <div className="form-control">
                <label className="label pb-1" htmlFor="profile-email">
                  <span className="label-text text-xs font-semibold">
                    Email address
                  </span>
                </label>
                <label
                  className={`input input-bordered input-sm flex items-center gap-2 rounded-lg ${
                    infoFieldErrors.email ? "input-error" : ""
                  }`}
                >
                  <Mail size={14} className="text-base-content/40 shrink-0" />
                  <input
                    id="profile-email"
                    type="email"
                    className="grow text-base-content"
                    value={infoForm.email}
                    onChange={(e) =>
                      setInfoForm((f) => ({ ...f, email: e.target.value }))
                    }
                    disabled={infoSaving}
                  />
                </label>
                <InfoFieldError field="email" />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                {infoSaved && (
                  <span className="text-xs text-success flex items-center gap-1">
                    <Check size={13} /> Saved
                  </span>
                )}
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={infoSaving}
                >
                  {infoSaving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </div>

          {/* Password */}
          <div className="rounded-2xl border border-base-300 bg-base-100 p-6">
            <h3 className="font-semibold text-sm mb-1 text-base-content">
              Change password
            </h3>
            <p className="text-xs text-base-content/50 mb-5">
              Use at least 8 characters. We recommend a mix of letters, numbers,
              and symbols.
            </p>

            <form
              onSubmit={handlePasswordSubmit}
              className="space-y-4"
              noValidate
            >
              {[
                {
                  key: "current",
                  label: "Current password",
                  autoComplete: "current-password",
                },
                {
                  key: "next",
                  label: "New password",
                  autoComplete: "new-password",
                },
                {
                  key: "confirm",
                  label: "Confirm new password",
                  autoComplete: "new-password",
                },
              ].map(({ key, label, autoComplete }) => (
                <div className="form-control" key={key}>
                  <label className="label pb-1" htmlFor={`pw-${key}`}>
                    <span className="label-text text-xs font-semibold">
                      {label}
                    </span>
                  </label>
                  <label
                    className={`input input-bordered input-sm flex items-center gap-2 rounded-lg ${
                      pwFieldErrors[key] ? "input-error" : ""
                    }`}
                  >
                    <Lock size={14} className="text-base-content/40 shrink-0" />
                    <input
                      id={`pw-${key}`}
                      type={showPw[key] ? "text" : "password"}
                      className="grow text-base-content"
                      value={pwForm[key]}
                      onChange={(e) =>
                        setPwForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                      disabled={pwSaving}
                      autoComplete={autoComplete}
                    />
                    <button
                      type="button"
                      className="text-base-content/40 hover:text-base-content/70 shrink-0"
                      onClick={() =>
                        setShowPw((s) => ({ ...s, [key]: !s[key] }))
                      }
                      aria-label={
                        showPw[key] ? "Hide password" : "Show password"
                      }
                    >
                      {showPw[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </label>
                  <PwFieldError field={key} />
                </div>
              ))}

              <div className="flex items-center justify-end gap-3 pt-2">
                {pwSaved && (
                  <span className="text-xs text-success flex items-center gap-1">
                    <Check size={13} /> Password updated
                  </span>
                )}
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={pwSaving}
                >
                  {pwSaving ? "Updating…" : "Update password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
