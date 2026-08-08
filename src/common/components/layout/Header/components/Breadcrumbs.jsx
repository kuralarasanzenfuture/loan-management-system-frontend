import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";

const ROUTE_LABELS = {
  dashboard: "Dashboard",
  reports: "Reports",
  applications: "Applications",
  loans: "Active Loans",
  repayments: "Repayments",
  borrowers: "Borrowers",
  documents: "Documents",
  settings: "Settings",
};

/**
 * Breadcrumbs Component
 * Dynamically computes and displays the breadcrumb navigation path based on the current route.
 */
export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div className="hidden md:flex items-center min-w-0">
      <div className="breadcrumbs text-xs py-0">
        <ul className="flex items-center gap-1">
          {/* Home Link */}
          <li className="flex items-center">
            <Link
              to="/dashboard"
              className="flex items-center gap-1 text-base-content/50 hover:text-primary transition-colors font-medium"
            >
              <Home size={14} className="stroke-[2.2]" />
              <span>Home</span>
            </Link>
          </li>

          {pathnames.map((value, index) => {
            const last = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join("/")}`;
            const label =
              ROUTE_LABELS[value] ||
              value.charAt(0).toUpperCase() + value.slice(1);

            return (
              <li key={to} className="flex items-center gap-1">
                {/* <ChevronRight size={12} className="text-base-content/30" /> */}
                {last ? (
                  <span className="font-semibold text-base-content tracking-tight">
                    {label}
                  </span>
                ) : (
                  <Link
                    to={to}
                    className="text-base-content/50 hover:text-primary transition-colors font-medium"
                  >
                    {label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
