import React from "react";
import { ShieldCheck, X } from "lucide-react";

/**
 * SidebarBrand Component
 * Renders the brand logo and application title.
 * 
 * @param {boolean} collapsed - Whether the sidebar is in collapsed state
 * @param {function} onClose - Mobile sidebar close handler
 */
export default function SidebarBrand({ collapsed = false, onClose = () => {} }) {
  return (
    <div className="flex items-center justify-between h-16 px-4 border-b border-base-300 shrink-0">
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Brand Logo */}
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-content shrink-0 shadow-md shadow-primary/20">
          <ShieldCheck size={20} className="stroke-[2.5]" />
        </div>
        
        {/* Brand Text */}
        <div
          className={`
            flex flex-col leading-none transition-all duration-300 ease-in-out
            ${collapsed ? "opacity-0 w-0 -translate-x-10" : "opacity-100 w-auto translate-x-0"}
          `}
        >
          <span className="font-bold text-base tracking-tight text-base-content">
            Meridian
          </span>
          <span className="text-[10px] font-medium text-base-content/40 tracking-wider uppercase mt-0.5">
            Lending Platform
          </span>
        </div>
      </div>

      {/* Mobile close button */}
      <button
        className="btn btn-ghost btn-xs btn-circle lg:hidden"
        onClick={onClose}
        aria-label="Close menu"
      >
        <X size={16} />
      </button>
    </div>
  );
}
