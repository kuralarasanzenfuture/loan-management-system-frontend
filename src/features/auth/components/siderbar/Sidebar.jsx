import React, { useState } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  FileText,
  Landmark,
  Users,
  Wallet,
  BarChart3,
  FolderOpen,
  Settings,
  ChevronDown,
  X,
} from "lucide-react";

/**
 * Sidebar
 * Tailwind + DaisyUI sidebar for the loan management dashboard.
 *
 * Props:
 * - open (bool)      : whether the mobile drawer is open
 * - onClose (fn)      : called to close the mobile drawer (backdrop / X button)
 * - activePath (str)  : current route path, used to highlight the active item
 */

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { label: "Reports", icon: BarChart3, path: "/reports" },
    ],
  },
  {
    label: "Loan Operations",
    items: [
      {
        label: "Applications",
        icon: FileText,
        path: "/applications",
        badge: "12",
      },
      { label: "Active Loans", icon: Landmark, path: "/loans" },
      { label: "Repayments", icon: Wallet, path: "/repayments" },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Borrowers", icon: Users, path: "/borrowers" },
      { label: "Documents", icon: FolderOpen, path: "/documents" },
      { label: "Settings", icon: Settings, path: "/settings" },
    ],
  },
];

export default function Sidebar({
  open = false,
  onClose = () => {},
  activePath = "/dashboard",
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen w-64 shrink-0
          bg-base-100 border-r border-base-300 flex flex-col
          transition-transform duration-200 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-base-300 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-content">
              <ShieldCheck size={18} />
            </span>
            <span className="font-semibold text-base leading-tight">
              Meridian
              <span className="block text-[11px] font-normal text-base-content/50 -mt-0.5">
                Lending Platform
              </span>
            </span>
          </div>
          <button
            className="btn btn-ghost btn-sm btn-circle lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-base-content/40">
                {section.label}
              </p>
              <ul className="menu menu-sm w-full gap-0.5 p-0">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePath === item.path;
                  return (
                    <li key={item.path}>
                      <a
                        href={item.path}
                        className={`
                          flex items-center rounded-lg px-3 py-2.5
                          ${
                            isActive
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-base-content/70 hover:bg-base-200"
                          }
                        `}
                      >
                        <Icon size={17} className="shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="badge badge-sm badge-primary">
                            {item.badge}
                          </span>
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer / plan card */}
        <div className="p-3 border-t border-base-300 shrink-0">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="w-full flex items-center justify-between rounded-lg bg-base-200 px-3 py-2.5 text-xs"
          >
            <span className="flex flex-col text-left">
              <span className="font-medium text-base-content/80">
                Portfolio health
              </span>
              <span className="text-base-content/50">99.2% on-time</span>
            </span>
            <ChevronDown
              size={14}
              className={`transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </aside>
    </>
  );
}
