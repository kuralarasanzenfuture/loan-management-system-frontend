import React, { useState } from "react";
import { ChevronDown, Heart, ShieldAlert } from "lucide-react";

/**
 * SidebarFooter Component
 * Displays system status, portfolio health details, or quick metrics.
 * 
 * @param {boolean} collapsed - Whether the sidebar is collapsed
 */
export default function SidebarFooter({ collapsed = false }) {
  const [expanded, setExpanded] = useState(false);

  if (collapsed) {
    return (
      <div className="p-3 border-t border-base-300 flex justify-center">
        <div 
          className="tooltip tooltip-right tooltip-primary cursor-pointer flex items-center justify-center w-10 h-10 rounded-xl bg-success/10 text-success"
          data-tip="Portfolio Health: 99.2%"
        >
          <Heart size={18} className="fill-success/20 stroke-[2.5]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-base-300 shrink-0 bg-base-100">
      <div className="rounded-xl border border-base-200 bg-base-200/50 p-3 transition-all duration-300">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs font-semibold text-base-content/80 hover:text-primary transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-success ring-4 ring-success/20 animate-ping" />
            <span>Portfolio Health</span>
          </div>
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 text-base-content/40 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dynamic Expandable section */}
        <div
          className={`
            grid transition-all duration-200 ease-in-out
            ${expanded ? "grid-rows-[1fr] mt-3 opacity-100" : "grid-rows-[0fr] opacity-0"}
          `}
        >
          <div className="overflow-hidden space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-base-content/50">On-time payments</span>
              <span className="font-bold text-success">99.2%</span>
            </div>
            <div className="w-full bg-base-300 h-1.5 rounded-full overflow-hidden">
              <div className="bg-success h-full rounded-full" style={{ width: "99.2%" }}></div>
            </div>
            
            <div className="divider my-1.5 opacity-50" />
            
            <div className="flex justify-between text-[11px]">
              <span className="text-base-content/50">NPL Ratio</span>
              <span className="font-semibold text-warning">0.8%</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-base-content/50">Active Capital</span>
              <span className="font-semibold text-base-content">$14.2M</span>
            </div>
          </div>
        </div>

        {/* Default brief status shown when collapsed */}
        {!expanded && (
          <div className="mt-1 flex justify-between items-center text-[11px]">
            <span className="text-base-content/50">On-time repayments</span>
            <span className="font-bold text-success">99.2%</span>
          </div>
        )}
      </div>
    </div>
  );
}
