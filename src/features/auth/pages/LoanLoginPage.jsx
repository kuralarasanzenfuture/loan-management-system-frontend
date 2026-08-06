import React, { useState } from "react";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";
import "../styles/LoanLoginPage.css";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../../redux/auth/authSlice";

/**
 * LoanLoginPage
 * A professional, globally-styled login page for a loan management platform.
 * Design language: deep navy + muted brass gold, serif/sans/mono type system,
 * signature element: a declining amortization curve that visualizes the
 * product's core idea (a loan balance paid down over time).
 */

function AmortizationCurve() {
  // A simple declining balance curve — the product's core idea, rendered as
  // the page's signature visual element.
  const width = 300;
  const height = 120;
  const points = [
    [0, 14],
    [40, 22],
    [80, 34],
    [120, 50],
    [160, 68],
    [200, 84],
    [240, 98],
    [280, 108],
    [300, 112],
  ];
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`)
    .join(" ");
  const area = `${path} L 300 120 L 0 120 Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="120"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="llpAreaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C7A248" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#C7A248" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#llpAreaFill)" />
      <path
        d={path}
        fill="none"
        stroke="#D8B968"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="300" cy="112" r="4" fill="#D8B968" />
    </svg>
  );
}

export default function LoanLoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error: authError } = useSelector((state) => state.auth);

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  // Show whichever error is more current: a client-side validation issue
  // takes priority over a stale Redux error from a previous attempt.
  const displayError = formError || authError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!loginId.trim()) {
      setFormError("Enter your username, email, or mobile number.");
      return;
    }
    if (!password.trim()) {
      setFormError("Enter your password.");
      return;
    }

    try {
      const result = await dispatch(loginUser({ loginId, password }));

      if (loginUser.fulfilled.match(result)) {
        navigate("/dashboard", { replace: true });
      } else {
        setFormError(result.payload || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setFormError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="llp-root">
      {/* Left: brand + signature amortization visual */}
      <div className="llp-panel">
        <div className="llp-brand">
          <span className="llp-brand-mark">
            <ShieldCheck size={18} />
          </span>
          Meridian Lending
        </div>

        <div>
          <h1 className="llp-headline">
            Every loan, tracked to the last payment.
          </h1>
          <p className="llp-subtext">
            Sign in to review applications, monitor portfolios, and keep every
            borrower's balance on schedule.
          </p>

          <div className="llp-chart-card">
            <div className="llp-chart-head">
              <span className="llp-chart-label">Portfolio balance, 36 mo.</span>
              <span className="llp-chart-value">
                <TrendingDown size={13} /> -68.4%
              </span>
            </div>
            <AmortizationCurve />
            <div className="llp-stats-row">
              <div>
                <div className="llp-stat-num">2,148</div>
                <div className="llp-stat-label">Active loans</div>
              </div>
              <div>
                <div className="llp-stat-num">99.2%</div>
                <div className="llp-stat-label">On-time repayment</div>
              </div>
              <div>
                <div className="llp-stat-num">4.3%</div>
                <div className="llp-stat-label">Avg. delinquency</div>
              </div>
            </div>
          </div>
        </div>

        <div className="llp-foot">
          <ShieldCheck size={14} />
          256-bit encrypted · SOC 2 Type II compliant
        </div>
      </div>

      {/* Right: login form */}
      <div className="llp-form-side">
        <div className="llp-card">
          <div className="llp-card-eyebrow">Loan Management Platform</div>
          <h2 className="llp-card-title">Welcome back</h2>
          <p className="llp-card-sub">
            Sign in with your username, email, or phone to access your
            dashboard.
          </p>

          {displayError && <div className="llp-error">{displayError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="llp-field">
              <label className="llp-label" htmlFor="llp-loginId">
                Username / Email / Phone
              </label>
              <div className="llp-input-wrap">
                <span className="llp-input-icon">
                  <User size={16} />
                </span>
                <input
                  id="llp-loginId"
                  type="text"
                  className="llp-input"
                  placeholder="Enter username, email, or phone"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="llp-field">
              <label className="llp-label" htmlFor="llp-password">
                Password
              </label>
              <div className="llp-input-wrap">
                <span className="llp-input-icon">
                  <Lock size={16} />
                </span>
                <input
                  id="llp-password"
                  type={showPassword ? "text" : "password"}
                  className="llp-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: 40 }}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="llp-toggle-eye"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="llp-row-between">
              <label className="llp-remember">
                <input type="checkbox" />
                Keep me signed in
              </label>
              <Link to="/forgot-password" className="llp-link">
                Forgot password?
              </Link>
            </div>

            {/* <button type="submit" className="llp-submit " disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button> */}

            {/* <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-lg hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button> */}

            <button
              type="submit"
              className="btn btn-primary w-full rounded-xl h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            {/* <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block btn-lg glass rounded-xl"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button> */}

            {/* <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block h-12 rounded-xl font-semibold tracking-wide shadow-lg hover:-translate-y-0.5 hover:shadow-xl disabled:loading disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button> */}
          </form>

          <div className="llp-divider">or</div>
          <div className="llp-secure-note">
            <ShieldCheck size={13} />
            Your session is protected with bank-grade encryption
          </div>

          <div className="llp-signup">
            New loan officer?{" "}
            <Link to="/request-access" className="llp-link">
              Request access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
