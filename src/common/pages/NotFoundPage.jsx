import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Compass,
  ArrowLeft,
  Home,
  Search,
  LayoutDashboard,
  Landmark,
  Users,
} from "lucide-react";

const QUICK_LINKS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Active Loans", icon: Landmark, path: "/active-loans" },
  { label: "Customers", icon: Users, path: "/customers" },
];

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-base-100 px-4">
      <style>{`
        @keyframes nf-float-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(24px, -18px) scale(1.06); }
        }
        @keyframes nf-float-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 16px) scale(1.04); }
        }
        @keyframes nf-compass-spin {
          0%   { transform: rotate(0deg); }
          20%  { transform: rotate(-18deg); }
          40%  { transform: rotate(12deg); }
          60%  { transform: rotate(-8deg); }
          80%  { transform: rotate(4deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes nf-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes nf-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .nf-blob-a { animation: nf-float-a 9s ease-in-out infinite; }
        .nf-blob-b { animation: nf-float-b 11s ease-in-out infinite; }
        .nf-compass { animation: nf-compass-spin 4s ease-in-out infinite; transform-origin: center; }
        .nf-bob { animation: nf-bob 3.5s ease-in-out infinite; }
        .nf-fade-up { animation: nf-fade-up 0.5s ease-out both; }
        .nf-fade-up-1 { animation-delay: 0.05s; }
        .nf-fade-up-2 { animation-delay: 0.15s; }
        .nf-fade-up-3 { animation-delay: 0.25s; }
      `}</style>

      {/* Ambient background blobs */}
      <div
        className="nf-blob-a absolute -top-20 -left-20 w-80 h-80 rounded-full bg-primary/20 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="nf-blob-b absolute -bottom-24 -right-16 w-96 h-96 rounded-full bg-secondary/20 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        {/* 4 [compass] 4 */}
        <div className="nf-bob flex items-center justify-center gap-2 mb-2">
          <span className="font-display text-7xl sm:text-8xl font-bold text-base-content">
            4
          </span>
          <span className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 border-2 border-dashed border-primary/40 flex items-center justify-center shrink-0">
            <Compass
              size={34}
              className="nf-compass text-primary"
              strokeWidth={1.75}
            />
          </span>
          <span className="font-display text-7xl sm:text-8xl font-bold text-base-content">
            4
          </span>
        </div>

        <h1 className="nf-fade-up nf-fade-up-1 text-lg font-semibold mt-2">
          Looks like you've wandered off the map
        </h1>
        <p className="nf-fade-up nf-fade-up-2 text-sm text-base-content/50 mt-2 mb-8">
          The page you're looking for doesn't exist, may have been moved, or the
          URL might be mistyped. Let's get you back on track.
        </p>

        <div className="nf-fade-up nf-fade-up-2 flex items-center gap-2 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-sm gap-1.5 border border-base-300"
          >
            <ArrowLeft size={15} />
            Go Back
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-primary btn-sm gap-1.5"
          >
            <Home size={15} />
            Back to Dashboard
          </button>
        </div>

        {/* Quick links */}
        <div className="nf-fade-up nf-fade-up-3 w-full">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-base-content/40 mb-2.5 flex items-center justify-center gap-1.5">
            <Search size={11} />
            Or jump to
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-base-300 text-base-content/60 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-colors"
                >
                  <Icon size={12} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
