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
  HelpCircle,
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
    <div className="w-full h-screen h-[100dvh] max-h-screen overflow-hidden bg-base-100 grid grid-cols-1 lg:grid-cols-12 selection:bg-primary selection:text-primary-content">
      
      {/* ========================================================= */}
      {/* LEFT PANEL: Full Cover Brand & Enterprise Feature Canvas */}
      {/* ========================================================= */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 flex-col justify-between h-full p-10 xl:p-14 bg-gradient-to-br from-primary/10 via-base-200/80 to-base-300/80 border-r border-base-300/80 relative overflow-hidden">
        {/* Subtle Ambient Decorative Glow */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-primary/15 blur-3xl" />
        <div 
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        />

        {/* Top Header: Brand Identity */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-base-100 shadow-md border border-base-300/80 flex items-center justify-center p-2 shrink-0">
              <img src={logo} alt="CM Micro Finance" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-base-content leading-tight tracking-tight">
                CM Micro Finance
              </h1>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Loan Management Platform
              </p>
            </div>
          </div>
        </div>

        {/* Middle Content: Value Propositions & Hero Headline */}
        <div className="relative z-10 my-auto py-6 space-y-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/20 shadow-xs">
              <Sparkles size={13} />
              Enterprise Lending Core
            </span>
            <h2 className="text-3xl xl:text-4xl font-bold text-base-content leading-tight tracking-tight">
              Every loan, tracked to the last payment.
            </h2>
            <p className="text-sm text-base-content/70 leading-relaxed max-w-lg">
              Sign in to manage borrower applications, disburse funds, monitor amortizations, and oversee comprehensive credit portfolio health.
            </p>
          </div>

          {/* Value Cards */}
          <div className="space-y-3">
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-base-100/75 border border-base-300/70 shadow-xs hover:border-primary/40 hover:bg-base-100 transition-all">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Zap size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content">Instant Loan Appraisal & Origination</p>
                <p className="text-[11px] text-base-content/60">Rapid documentation, KYC checks, and seamless approval pipelines</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-base-100/75 border border-base-300/70 shadow-xs hover:border-primary/40 hover:bg-base-100 transition-all">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <BarChart3 size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content">Automated EMI & Ledger Reconciliation</p>
                <p className="text-[11px] text-base-content/60">Real-time interest accruals, penalty calculations, and payment tracking</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-base-100/75 border border-base-300/70 shadow-xs hover:border-primary/40 hover:bg-base-100 transition-all">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content">Bank-Grade Security & Compliance</p>
                <p className="text-[11px] text-base-content/60">256-bit encryption with immutable transactional audit logs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer: System Status */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-base-300/70 text-xs text-base-content/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
            <span className="font-semibold text-base-content/80">Operational System 99.98% SLA</span>
          </div>
          <span className="font-mono text-[11px] text-base-content/50 uppercase tracking-wider">
            SOC 2 TYPE II
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT PANEL: Full Cover Authentication Terminal */}
      {/* ========================================================= */}
      <div className="col-span-1 lg:col-span-7 xl:col-span-7 flex flex-col justify-between h-full p-6 sm:p-10 md:p-12 lg:p-10 xl:p-14 bg-base-100 relative overflow-hidden">
        
        {/* Top Bar on Right Panel (Mobile Brand / Help Support) */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto">
          {/* Mobile Logo Only */}
          <div className="flex lg:hidden items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-base-200 border border-base-300 flex items-center justify-center p-1.5 shrink-0">
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

          <div className="hidden lg:flex items-center gap-2 text-xs text-base-content/50 ml-auto">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span>Secure Enterprise Node</span>
          </div>
        </div>

        {/* Center Container: Main Sign-In Form (Centered Vertically) */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          
          {/* Form Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary tracking-wider uppercase mb-1.5">
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
            <div className="flex items-start gap-2.5 p-3.5 mb-5 rounded-2xl bg-error/10 border border-error/20 text-error text-xs animate-fadeIn shadow-xs">
              <AlertCircle size={17} className="shrink-0 mt-0.5" />
              <div className="grow font-medium leading-tight">{displayError}</div>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            
            {/* Login ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-base-content/80 flex items-center justify-between" htmlFor="llp-loginId">
                <span>Account Identifier</span>
                <span className="text-[10px] font-normal text-base-content/50">Username / Email / Mobile</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-base-content/40 pointer-events-none">
                  <User size={18} />
                </div>
                <input
                  id="llp-loginId"
                  type="text"
                  required
                  className="w-full h-12 pl-10 pr-4 text-sm rounded-xl bg-base-200/50 border border-base-300 text-base-content placeholder:text-base-content/40 focus:bg-base-100 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
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
                  className="text-xs font-semibold text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-base-content/40 pointer-events-none">
                  <Lock size={18} />
                </div>
                <input
                  id="llp-password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full h-12 pl-10 pr-11 text-sm rounded-xl bg-base-200/50 border border-base-300 text-base-content placeholder:text-base-content/40 focus:bg-base-100 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
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
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
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
              className="btn btn-primary w-full h-12 rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 mt-2"
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

        </div>

        {/* Bottom Footer: Trust & Request Access */}
        <div className="w-full max-w-md mx-auto pt-4 border-t border-base-300/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-base-content/60">
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
  );
}
