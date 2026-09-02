import React, { useState } from "react";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  BarChart3,
  CheckCircle2,
  Building2,
  AlertCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../../redux/auth/authSlice";

import logo from "../../../assets/logo/CM Micro Finance.png";

export default function LoanLoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error: authError } = useSelector((state) => state.auth);

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState("");

  const displayError = formError || authError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!loginId.trim()) {
      setFormError("Please enter your username, email, or mobile number.");
      return;
    }
    if (!password.trim()) {
      setFormError("Please enter your password.");
      return;
    }

    try {
      const result = await dispatch(loginUser({ loginId, password }));
      if (loginUser.fulfilled.match(result)) {
        navigate("/dashboard", { replace: true });
      } else {
        setFormError(result.payload || "Authentication failed. Please verify your credentials.");
      }
    } catch (err) {
      console.error("Login submission error:", err);
      setFormError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="h-screen w-screen max-h-screen overflow-hidden bg-base-200/60 flex items-center justify-center p-3 sm:p-5 md:p-6 lg:p-8 relative selection:bg-primary selection:text-primary-content">
      {/* Dynamic Background Atmosphere */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[55vw] h-[55vw] max-w-[600px] max-h-[600px] rounded-full bg-primary/10 blur-[100px] opacity-70" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50vw] h-[50vw] max-w-[550px] max-h-[550px] rounded-full bg-primary/15 blur-[120px] opacity-80" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full bg-base-content/[0.02] blur-[90px]" />
      </div>

      {/* Main Dual-Panel Enterprise Container */}
      <div className="relative z-10 w-full max-w-5xl h-full max-h-[640px] grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-base-300/80 bg-base-100 shadow-2xl overflow-hidden backdrop-blur-xl">
        
        {/* Left Panel: Enterprise Branding & Core Value Pillars (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 bg-gradient-to-br from-primary/10 via-base-200/50 to-base-200/80 border-r border-base-300/70 relative overflow-hidden">
          {/* Subtle decorative grid background */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
              backgroundSize: "20px 20px"
            }}
          />

          {/* Top Brand Tag */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-base-100 shadow-md border border-base-300 flex items-center justify-center p-2 shrink-0">
                <img src={logo} alt="CM Micro Finance" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-base-content leading-tight tracking-tight">
                  CM Micro Finance
                </h1>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  Enterprise Loan Terminal
                </p>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/15 text-primary border border-primary/20">
                <Sparkles size={12} />
                Financial Management System
              </span>
              <h2 className="text-2xl font-bold text-base-content leading-snug">
                Precision lending & loan lifecycle operations.
              </h2>
              <p className="text-xs text-base-content/70 leading-relaxed pt-1">
                Unified institutional suite for loan origination, risk verification, automated amortization, and portfolio auditing.
              </p>
            </div>
          </div>

          {/* Feature Highlight Cards */}
          <div className="relative z-10 space-y-2.5 my-4">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-base-100/70 border border-base-300/60 shadow-xs hover:border-primary/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Zap size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-base-content">Instant Loan Processing</p>
                <p className="text-[11px] text-base-content/60">Automated appraisal & disbursement workflows</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-base-100/70 border border-base-300/60 shadow-xs hover:border-primary/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <BarChart3 size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-base-content">Automated Repayment Schedules</p>
                <p className="text-[11px] text-base-content/60">Real-time EMI tracking & ledger reconciliations</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-base-100/70 border border-base-300/60 shadow-xs hover:border-primary/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-base-content">Bank-Grade Compliance</p>
                <p className="text-[11px] text-base-content/60">256-bit encryption & complete audit logging</p>
              </div>
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div className="relative z-10 flex items-center justify-between pt-3 border-t border-base-300/60 text-[11px] text-base-content/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="font-medium">Core Banking System v3.4</span>
            </div>
            <span className="font-mono text-[10px] text-base-content/50 uppercase">SOC-2 Certified</span>
          </div>
        </div>

        {/* Right Panel: Authentication Form Terminal */}
        <div className="col-span-1 lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 md:p-10 bg-base-100 relative">
          
          {/* Mobile Header Logo (Visible on smaller screens) */}
          <div className="flex lg:hidden items-center justify-between pb-3 border-b border-base-300/70 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-base-200 border border-base-300 flex items-center justify-center p-1.5">
                <img src={logo} alt="CM Micro Finance" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="font-display font-bold text-sm text-base-content leading-tight">
                  CM Micro Finance
                </h1>
                <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                  Loan Terminal
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success bg-success/10 px-2 py-0.5 rounded-md border border-success/20">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Online
            </span>
          </div>

          {/* Form Header */}
          <div className="mb-4 sm:mb-5">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary tracking-wider uppercase mb-1">
              <span>Security Clearance Required</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-base-content tracking-tight">
              Officer Sign In
            </h2>
            <p className="text-xs sm:text-sm text-base-content/60 mt-1">
              Enter your authorized credentials to access the loan management console.
            </p>
          </div>

          {/* Error Message Box */}
          {displayError && (
            <div className="flex items-start gap-2.5 p-3 mb-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs animate-fadeIn">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div className="grow font-medium leading-tight">{displayError}</div>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-3.5 sm:space-y-4 grow flex flex-col justify-center">
            {/* Login ID (Username / Email / Phone) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-base-content/80 flex items-center justify-between" htmlFor="llp-loginId">
                <span>Account Identifier</span>
                <span className="text-[10px] font-normal text-base-content/50">Username / Email / Mobile</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-base-content/40 pointer-events-none">
                  <User size={17} />
                </div>
                <input
                  id="llp-loginId"
                  type="text"
                  required
                  className="w-full h-11 sm:h-12 pl-10 pr-4 text-sm rounded-xl bg-base-200/60 border border-base-300 text-base-content placeholder:text-base-content/40 focus:bg-base-100 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                  placeholder="e.g. officer@cmmicro.com or CM8901"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-base-content/80" htmlFor="llp-password">
                  Security Password
                </label>
                <Link
                  to="/forgot-password"
                  tabIndex={-1}
                  className="text-[11px] font-semibold text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-base-content/40 pointer-events-none">
                  <Lock size={17} />
                </div>
                <input
                  id="llp-password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full h-11 sm:h-12 pl-10 pr-11 text-sm rounded-xl bg-base-200/60 border border-base-300 text-base-content placeholder:text-base-content/40 focus:bg-base-100 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                  placeholder="Enter your confidential password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 p-1 text-base-content/40 hover:text-base-content/80 transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Quick Details */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="checkbox checkbox-xs checkbox-primary rounded transition-all"
                />
                <span className="text-xs font-medium text-base-content/70">Remember this workstation</span>
              </label>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full h-11 sm:h-12 rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  <span>Authenticating Session...</span>
                </>
              ) : (
                <>
                  <span>Authenticate & Enter Terminal</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer & Secondary Actions */}
          <div className="pt-3 sm:pt-4 border-t border-base-300/60 mt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-base-content/60">
            <div className="flex items-center gap-1.5 text-[11px]">
              <ShieldCheck size={14} className="text-success shrink-0" />
              <span>256-bit TLS Encrypted Session</span>
            </div>
            <div>
              <span>Need system access? </span>
              <Link
                to="/request-access"
                className="font-bold text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                Request Authorization
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
