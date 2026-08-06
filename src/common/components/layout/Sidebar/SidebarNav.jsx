import React from "react";
import { NavLink } from "react-router-dom";

import { NAV_SECTIONS } from "./sidebarMenu";

/**
 * SidebarNav Component
 * Handles the navigation links, dynamic active states, and collapsed layout.
 *
 * @param {boolean} collapsed - Whether the sidebar is collapsed
 * @param {function} onItemClick - Callback when an item is clicked (useful to close drawer on mobile)
 */
export default function SidebarNav({
  collapsed = false,
  onItemClick = () => {},
}) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-base-300">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className="space-y-1">
          {/* Section Heading */}
          <p
            className={`
              px-3 text-[10px] font-bold uppercase tracking-wider text-base-content/40 transition-all duration-300
              ${collapsed ? "opacity-0 h-0 overflow-hidden mb-0" : "opacity-100 mb-1.5"}
            `}
          >
            {section.label}
          </p>

          <ul className="menu menu-sm w-full gap-1 p-0">
            {section.items.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onItemClick}
                    className={({ isActive }) => `
                      flex items-center rounded-lg py-2.5 px-3 transition-colors duration-150
                      ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold border-l-4 border-primary rounded-l-none"
                          : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                      }
                      ${collapsed ? "justify-center tooltip tooltip-right tooltip-primary" : "justify-start"}
                    `}
                    data-tip={collapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="shrink-0" />

                    {/* Link Label */}
                    {/* <span
                      className={`
                        flex-1 text-sm transition-all duration-300 overflow-hidden
                        ${collapsed ? "opacity-0 w-0 -translate-x-5 pointer-events-none hidden" : "opacity-100 w-auto translate-x-0 ml-3"}
                      `}
                    >
                      {item.label}
                    </span> */}

                    <span
                      className={`transition-all duration-300 ${
                        collapsed
                          ? "opacity-0 max-w-0 overflow-hidden ml-0"
                          : "opacity-100 max-w-xs ml-3"
                      }`}
                    >
                      {item.label}
                    </span>

                    {/* Optional Badge */}
                    {item.badge && !collapsed && (
                      <span className="badge badge-sm badge-primary text-xs font-semibold px-2 animate-pulse">
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
