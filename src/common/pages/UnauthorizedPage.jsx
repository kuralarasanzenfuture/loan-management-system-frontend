import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home, LifeBuoy } from "lucide-react";

/**
 * UnauthorizedPage
 * Shown when a logged-in user hits a route/action their role or
 * permissions don't allow (403), as opposed to not being logged in
 * at all (that's a redirect-to-login case, not this page).
 */
export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200/40 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-base-300 bg-base-100 shadow-card p-8 sm:p-10 text-center">
          {/* Icon */}
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full bg-error/10 animate-pulse" />
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-error/10">
              <ShieldAlert
                size={34}
                className="text-error"
                strokeWidth={1.75}
              />
            </div>
          </div>

          {/* Code + heading */}
          <p className="text-xs font-bold tracking-[0.2em] text-error/70 uppercase mb-2">
            Error 403
          </p>
          <h1 className="text-2xl font-bold text-base-content mb-2">
            Access Denied
          </h1>
          <p className="text-sm text-base-content/50 leading-relaxed mb-8">
            You don't have permission to view this page. If you think this is a
            mistake, contact your administrator to request access.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-outline btn-sm sm:btn-md flex-1 rounded-xl border-base-300 gap-2"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn btn-primary btn-sm sm:btn-md flex-1 rounded-xl gap-2 shadow-md shadow-primary/20"
            >
              <Home size={16} />
              Dashboard
            </button>
          </div>

          {/* Support link */}
          <div className="mt-8 pt-6 border-t border-base-200">
            <a
              href="mailto:support@meridianlending.com"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-base-content/40 hover:text-primary transition-colors"
            >
              <LifeBuoy size={13} />
              Need access? Contact support
            </a>
          </div>
        </div>

        {/* Footer branding */}
        <p className="text-center text-[11px] text-base-content/30 mt-6">
          Meridian Lending Platform
        </p>
      </div>
    </div>
  );
}
