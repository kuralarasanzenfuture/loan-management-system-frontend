import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  Search,
  Maximize,
  Minimize,
  Bell,
  ChevronRight,
  Home,
  LogOut,
  User,
  Settings,
  CreditCard,
} from "lucide-react";

/**
 * Header
 * Tailwind + DaisyUI top navbar for the loan management dashboard.
 *
 * Props:
 * - onMenuClick (fn)   : opens the mobile sidebar drawer
 * - breadcrumbs (array): [{ label, path }] — last item renders as current page
 * - user (object)      : { name, email, role, avatarUrl }
 */

const DEFAULT_BREADCRUMBS = [
  { label: "Home", path: "/" },
  { label: "Loans", path: "/loans" },
  { label: "Applications", path: "/loans/applications" },
];

const DEFAULT_USER = {
  name: "Sarah Whitfield",
  email: "sarah.whitfield@meridianlending.com",
  role: "Senior Loan Officer",
  avatarUrl: "https://i.pravatar.cc/80?img=47",
};

export default function Header({
  onMenuClick = () => {},
  breadcrumbs = DEFAULT_BREADCRUMBS,
  user = DEFAULT_USER,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 lg:px-6 bg-base-100/90 backdrop-blur border-b border-base-300">
      {/* Mobile menu toggle */}
      <button
        className="btn btn-ghost btn-sm btn-circle lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={19} />
      </button>

      {/* Breadcrumb */}
      <div className="hidden md:flex items-center min-w-0">
        <div className="breadcrumbs text-sm py-0">
          <ul>
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <li key={crumb.path}>
                  <a
                    href={crumb.path}
                    className={`flex items-center gap-1 ${
                      isLast
                        ? "font-medium text-base-content pointer-events-none"
                        : "text-base-content/50 hover:text-base-content"
                    }`}
                  >
                    {i === 0 && <Home size={13} />}
                    {crumb.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 flex justify-center px-2">
        <label
          className={`
            input input-sm input-bordered flex items-center gap-2 w-full max-w-md
            transition-shadow ${searchFocused ? "ring-2 ring-primary/30 border-primary" : ""}
          `}
        >
          <Search size={15} className="text-base-content/40 shrink-0" />
          <input
            ref={searchRef}
            type="text"
            className="grow"
            placeholder="Search loans, borrowers, applications…"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <kbd className="kbd kbd-sm hidden sm:inline-flex">⌘K</kbd>
        </label>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Fullscreen toggle */}
        <button
          className="btn btn-ghost btn-sm btn-circle"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>

        {/* Notifications */}
        <button
          className="btn btn-ghost btn-sm btn-circle"
          aria-label="Notifications"
        >
          <div className="indicator">
            <Bell size={18} />
            <span className="indicator-item badge badge-primary badge-xs" />
          </div>
        </button>

        <div className="divider divider-horizontal mx-0.5 h-8 self-center" />

        {/* Profile dropdown */}
        <div className="dropdown dropdown-end">
          <button
            tabIndex={0}
            className="btn btn-ghost btn-sm h-auto py-1 px-2 gap-2 normal-case"
          >
            <div className="avatar">
              <div className="w-8 rounded-full ring ring-base-300 ring-offset-1">
                <img src={user.avatarUrl} alt={user.name} />
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-[11px] text-base-content/50">
                {user.role}
              </span>
            </div>
            <ChevronRight
              size={14}
              className="hidden sm:block rotate-90 text-base-content/40"
            />
          </button>

          <ul
            tabIndex={0}
            className="dropdown-content menu z-[60] mt-2 w-64 rounded-box bg-base-100 border border-base-300 shadow-lg p-2"
          >
            <li className="px-2 py-2 mb-1 border-b border-base-200">
              <div className="flex items-center gap-3 hover:bg-transparent">
                <div className="avatar">
                  <div className="w-10 rounded-full">
                    <img src={user.avatarUrl} alt={user.name} />
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate">
                    {user.name}
                  </span>
                  <span className="text-xs text-base-content/50 truncate">
                    {user.email}
                  </span>
                </div>
              </div>
            </li>
            <li>
              <a className="text-sm">
                <User size={15} /> My profile
              </a>
            </li>
            <li>
              <a className="text-sm">
                <CreditCard size={15} /> Billing
              </a>
            </li>
            <li>
              <a className="text-sm">
                <Settings size={15} /> Account settings
              </a>
            </li>
            <li className="border-t border-base-200 mt-1 pt-1">
              <a className="text-sm text-error">
                <LogOut size={15} /> Log out
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
