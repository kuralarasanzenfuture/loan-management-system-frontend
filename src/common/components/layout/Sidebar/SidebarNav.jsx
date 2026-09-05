import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { NAV_SECTIONS } from "./sidebarMenu";
import usePermissions from "../../../hooks/usePermissions.js";
import { filterNavSections } from "../../../utils/permissionUtils.js";

/**
 * SidebarNav Component
 * Handles the navigation links, dynamic active states, collapsed layout,
 * and automatic RBAC/PBAC permission filtering.
 *
 * @param {boolean} collapsed - Whether the sidebar is collapsed
 * @param {function} onItemClick - Callback when an item is clicked
 */
export default function SidebarNav({
  collapsed = false,
  onItemClick = () => {},
}) {
  const { user } = usePermissions();
  const dashboardOverview = useSelector((state) => state.dashboard?.overview);
  const activeLoansCount = Number(dashboardOverview?.active_loans || 0);
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Dynamically filter sections and items according to user permissions & roles
  const visibleSections = useMemo(() => {
    return filterNavSections(NAV_SECTIONS, user);
  }, [user]);

  const handleMouseEnter = (e, item, badgeValue) => {
    if (!collapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveTooltip({
      text: item.label,
      badge: badgeValue,
      top: rect.top + rect.height / 2,
      left: rect.right + 10,
    });
  };

  const handleMouseLeave = () => {
    setActiveTooltip(null);
  };

  return (
    <>
      <nav
        onScroll={() => activeTooltip && setActiveTooltip(null)}
        className={`sidebar-scroll flex-1 overflow-y-auto overflow-x-hidden min-w-0 ${
          collapsed ? "px-2 py-3 space-y-1" : "px-3 py-4 space-y-6"
        }`}
      >
        {visibleSections.map((section) => (
          <div key={section.label} className={collapsed ? "min-w-0" : "space-y-1 min-w-0"}>
            {/* Section Heading (expanded mode only) */}
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-base-content/40 transition-all duration-300 select-none mb-1.5">
                {section.label}
              </p>
            )}

            <ul className="w-full p-0 m-0 list-none space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const badgeValue =
                  item.path === "/loan-applications"
                    ? activeLoansCount
                    : item.badge;
                const hasBadge =
                  badgeValue !== undefined &&
                  badgeValue !== null &&
                  badgeValue !== "";

                return (
                  <li key={item.path} className="min-w-0">
                    <NavLink
                      to={item.path}
                      onClick={(e) => {
                        setActiveTooltip(null);
                        onItemClick(e);
                      }}
                      onMouseEnter={(e) =>
                        handleMouseEnter(e, item, hasBadge ? badgeValue : null)
                      }
                      onMouseLeave={handleMouseLeave}
                      className={({ isActive }) => `
                        group relative flex items-center transition-all duration-200 min-w-0 select-none
                        ${
                          collapsed
                            ? "w-10 h-10 mx-auto justify-center rounded-xl p-0"
                            : "px-3 py-2.5 justify-start rounded-lg"
                        }
                        ${
                          isActive
                            ? collapsed
                              ? "bg-primary text-primary-content shadow-md shadow-primary/20"
                              : "bg-primary/10 text-primary font-semibold border-l-4 border-primary rounded-l-none"
                            : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                        }
                      `}
                    >
                      {/* Icon container explicitly sized to maintain alignment */}
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        <Icon size={18} className="shrink-0" />
                      </div>

                      {/* Smooth Collapsible Label */}
                      <span
                        className={`min-w-0 transition-all duration-300 ease-in-out ${
                          collapsed
                            ? "opacity-0 max-w-0 overflow-hidden ml-0 pointer-events-none"
                            : "opacity-100 max-w-[200px] overflow-hidden ml-3 flex-1 truncate"
                        }`}
                      >
                        {item.label}
                      </span>

                      {/* Optional Badge */}
                      {hasBadge && !collapsed && (
                        <span className="badge badge-sm badge-primary text-[10px] font-semibold px-2 animate-pulse shrink-0 ml-auto">
                          {badgeValue}
                        </span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Floating Portal Tooltip — Renders outside overflow boundaries to never be clipped */}
      {collapsed && activeTooltip && typeof document !== "undefined" && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none px-3 py-1.5 rounded-lg bg-primary text-primary-content text-xs font-semibold shadow-2xl flex items-center gap-2 whitespace-nowrap"
          style={{
            top: `${activeTooltip.top}px`,
            left: `${activeTooltip.left}px`,
            transform: "translateY(-50%)",
          }}
        >
          <span>{activeTooltip.text}</span>
          {activeTooltip.badge !== null && activeTooltip.badge !== undefined && (
            <span className="badge badge-xs bg-base-100 text-primary font-bold text-[10px] px-1.5">
              {activeTooltip.badge}
            </span>
          )}
          {/* Arrow pointing left toward icon */}
          <span
            className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-primary"
            aria-hidden="true"
          />
        </div>,
        document.body
      )}
    </>
  );
}
