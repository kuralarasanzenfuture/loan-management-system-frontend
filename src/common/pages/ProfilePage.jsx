import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  Camera,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";

const DEFAULT_USER = {
  name: "Sarah Whitfield",
  email: "sarah.whitfield@meridianlending.com",
  role: "Senior Loan Officer",
  avatarUrl: "https://i.pravatar.cc/120?img=47",
  phone: "",
};

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);

  const currentUser = {
    name: user?.username || user?.name || user?.fullName || DEFAULT_USER.name,
    email: user?.email || DEFAULT_USER.email,
    role:
      user?.role_name || user?.role?.name || user?.role || DEFAULT_USER.role,
    avatarUrl: user?.avatarUrl || DEFAULT_USER.avatarUrl,
    phone: user?.phone || DEFAULT_USER.phone,
  };

  // ---- Personal info form ----
  const [infoForm, setInfoForm] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
  });
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoSaved, setInfoSaved] = useState(false);

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
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
  const [pwError, setPwError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError("");

    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setPwError("Fill in all three password fields.");
      return;
    }
    if (pwForm.next.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError("New password and confirmation don't match.");
      return;
    }

    setPwSaving(true);
    try {
      // TODO: replace with your real thunk, e.g.
      // await dispatch(changePassword(pwForm)).unwrap();
      await new Promise((r) => setTimeout(r, 700));
      setPwForm({ current: "", next: "", confirm: "" });
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err) {
      setPwError(err?.message || "Couldn't update your password.");
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
        {/* Left: avatar / identity card */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-6 flex flex-col items-center text-center h-fit">
          <div className="relative">
            <div className="avatar">
              <div className="w-24 h-24 rounded-full ring-2 ring-primary/20 ring-offset-2 ring-offset-base-100 overflow-hidden">
                <img src={currentUser.avatarUrl} alt={currentUser.name} />
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-xs btn-circle absolute -bottom-1 -right-1"
              title="Change photo"
              aria-label="Change photo"
            >
              <Camera size={13} />
            </button>
          </div>

          <h2 className="mt-4 font-semibold text-base">{currentUser.name}</h2>
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
            <h3 className="font-semibold text-sm mb-1">Personal information</h3>
            <p className="text-xs text-base-content/50 mb-5">
              This is shown across the platform wherever your name appears.
            </p>

            <form onSubmit={handleInfoSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label py-1" htmlFor="profile-name">
                    <span className="label-text text-xs font-medium">
                      Full name
                    </span>
                  </label>
                  <label className="input input-bordered input-sm flex items-center gap-2">
                    <User size={14} className="text-base-content/40" />
                    <input
                      id="profile-name"
                      type="text"
                      className="grow"
                      value={infoForm.name}
                      onChange={(e) =>
                        setInfoForm((f) => ({ ...f, name: e.target.value }))
                      }
                      disabled={infoSaving}
                    />
                  </label>
                </div>

                <div className="form-control">
                  <label className="label py-1" htmlFor="profile-phone">
                    <span className="label-text text-xs font-medium">
                      Phone
                    </span>
                  </label>
                  <label className="input input-bordered input-sm flex items-center gap-2">
                    <Phone size={14} className="text-base-content/40" />
                    <input
                      id="profile-phone"
                      type="tel"
                      className="grow"
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
                <label className="label py-1" htmlFor="profile-email">
                  <span className="label-text text-xs font-medium">
                    Email address
                  </span>
                </label>
                <label className="input input-bordered input-sm flex items-center gap-2">
                  <Mail size={14} className="text-base-content/40" />
                  <input
                    id="profile-email"
                    type="email"
                    className="grow"
                    value={infoForm.email}
                    onChange={(e) =>
                      setInfoForm((f) => ({ ...f, email: e.target.value }))
                    }
                    disabled={infoSaving}
                  />
                </label>
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
            <h3 className="font-semibold text-sm mb-1">Change password</h3>
            <p className="text-xs text-base-content/50 mb-5">
              Use at least 8 characters. We recommend a mix of letters, numbers,
              and symbols.
            </p>

            {pwError && (
              <div className="alert alert-error text-sm py-2 mb-4">
                <span>{pwError}</span>
              </div>
            )}

            <form
              onSubmit={handlePasswordSubmit}
              className="space-y-4"
              noValidate
            >
              {[
                { key: "current", label: "Current password" },
                { key: "next", label: "New password" },
                { key: "confirm", label: "Confirm new password" },
              ].map(({ key, label }) => (
                <div className="form-control" key={key}>
                  <label className="label py-1" htmlFor={`pw-${key}`}>
                    <span className="label-text text-xs font-medium">
                      {label}
                    </span>
                  </label>
                  <label className="input input-bordered input-sm flex items-center gap-2">
                    <Lock size={14} className="text-base-content/40" />
                    <input
                      id={`pw-${key}`}
                      type={showPw[key] ? "text" : "password"}
                      className="grow"
                      value={pwForm[key]}
                      onChange={(e) =>
                        setPwForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                      disabled={pwSaving}
                      autoComplete={
                        key === "current" ? "current-password" : "new-password"
                      }
                    />
                    <button
                      type="button"
                      className="text-base-content/40 hover:text-base-content/70"
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
