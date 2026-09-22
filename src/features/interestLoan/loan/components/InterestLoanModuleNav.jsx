import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Receipt, CreditCard, Coins, BarChart3 } from "lucide-react";

/**
 * Premium Segmented Navigation Tabs for Anytime Interest Loan Module
 * Connects Anytime Loans, Payments Ledger, Collections Ledger, and Reports seamlessly.
 */
export default function InterestLoanModuleNav({ activeTab }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    {
      id: "loans",
      label: "Anytime Interest Loans",
      shortLabel: "Loans",
      path: "/interest-loans",
      icon: Receipt,
      description: "Manage accounts & principal",
    },
    {
      id: "payments",
      label: "Anytime Payments",
      shortLabel: "Payments",
      path: "/interest-loans/payments",
      icon: CreditCard,
      description: "Payment ledger & allocations",
    },
    {
      id: "collections",
      label: "Anytime Collections",
      shortLabel: "Collections",
      path: "/interest-loans/collections",
      icon: Coins,
      description: "Daily dues & overdue ledger",
    },
    {
      id: "reports",
      label: "Anytime Reports",
      shortLabel: "Reports",
      path: "/interest-loans/reports",
      icon: BarChart3,
      description: "Portfolio analytics & ledger",
    },
  ];

  return (
    <div className="bg-base-100 border border-base-300 rounded-2xl p-1.5 shadow-2xs">
      <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar" aria-label="Anytime Loan Navigation">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab
            ? activeTab === tab.id
            : tab.id === "loans"
            ? currentPath === "/interest-loans"
            : tab.id === "payments"
            ? currentPath.startsWith("/interest-loans/payments")
            : tab.id === "collections"
            ? currentPath.startsWith("/interest-loans/collections")
            : currentPath.startsWith("/interest-loans/reports");

          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs transition-all whitespace-nowrap select-none ${
                isActive
                  ? "bg-primary text-primary-content font-bold shadow-xs"
                  : "text-base-content/70 hover:text-base-content hover:bg-base-200/70 font-semibold"
              }`}
            >
              <Icon size={14} className={isActive ? "text-primary-content" : "text-base-content/50"} />
              <span>{tab.label}</span>
              {isActive && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-content/80 ml-0.5 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
