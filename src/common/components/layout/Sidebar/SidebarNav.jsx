import React, { useMemo } from "react";
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

  // Dynamically filter sections and items according to user permissions & roles
  const visibleSections = useMemo(() => {
    return filterNavSections(NAV_SECTIONS, user);
  }, [user]);

  return (
    <nav className="sidebar-scroll flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-6 min-w-0">
      {visibleSections.map((section) => (
        <div key={section.label} className="space-y-1 min-w-0">
          {/* Section Heading */}
          <p
            className={`
              px-3 text-[10px] font-bold uppercase tracking-wider text-base-content/40 transition-all duration-300 select-none
              ${collapsed ? "opacity-0 h-0 overflow-hidden mb-0" : "opacity-100 mb-1.5"}
            `}
          >
            {section.label}
          </p>

          <ul className="w-full gap-1 p-0 m-0 list-none space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.path} className="min-w-0">
                  <NavLink
                    to={item.path}
                    onClick={onItemClick}
                    className={({ isActive }) => `
                      group relative flex items-center rounded-lg py-2.5 transition-all duration-200 min-w-0 select-none
                      ${collapsed ? "px-0 justify-center" : "px-3 justify-start"}
                      ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold border-l-4 border-primary rounded-l-none"
                          : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                      }
                      ${collapsed ? "tooltip tooltip-right tooltip-primary" : ""}
                    `}
                    data-tip={collapsed ? item.label : undefined}
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
                    {item.badge && !collapsed && (
                      <span className="badge badge-sm badge-primary text-[10px] font-semibold px-2 animate-pulse shrink-0 ml-auto">
                        {item.badge}
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
  );
}
