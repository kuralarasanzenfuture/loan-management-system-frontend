import React from "react";
import SidebarBrand from "./SidebarBrand";
import SidebarNav from "./SidebarNav";
import SidebarFooter from "./SidebarFooter";

/**
 * Sidebar Component
 * Orchestrates the full sidebar layout, integrating mobile and desktop drawers/widths.
 * 
 * Props:
 * - open (bool)             : whether the mobile side drawer is open
 * - onClose (fn)             : handler to close the mobile drawer
 * - collapsed (bool)         : whether the desktop sidebar is collapsed
 */
export default function Sidebar({
  open = false,
  onClose = () => {},
  collapsed = false,
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen shrink-0
          bg-base-100 border-r border-base-300 flex flex-col
          transition-all duration-300 ease-in-out
          ${open ? "translate-x-0 w-64" : "-translate-x-full"}
          lg:translate-x-0 ${collapsed ? "lg:w-20" : "lg:w-64"}
        `}
      >
        {/* Brand Header */}
        <SidebarBrand collapsed={collapsed} onClose={onClose} />

        {/* Navigation Items */}
        <SidebarNav collapsed={collapsed} onItemClick={onClose} />

        {/* Footer / Portfolio Health Indicator */}
        <SidebarFooter collapsed={collapsed} />
      </aside>
    </>
  );
}
