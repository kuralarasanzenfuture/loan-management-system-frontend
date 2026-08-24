import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, Heart, ShieldCheck, AlertTriangle } from "lucide-react";
import { fetchPortfolioHealth } from "../../../../../redux/dashboard/dashboardSlice.js";

function formatCompactCurrency(val) {
  const num = Number(val) || 0;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
  return `₹${num.toLocaleString("en-IN")}`;
}

/**
 * SidebarFooter Component
 * Displays dynamic system status and portfolio health metrics from Redux.
 * 
 * @param {boolean} collapsed - Whether the sidebar is collapsed
 */
export default function SidebarFooter({ collapsed = false }) {
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);

  const { portfolioHealth } = useSelector((state) => state.dashboard);

  useEffect(() => {
    if (!portfolioHealth) {
      dispatch(fetchPortfolioHealth());
    }
  }, [dispatch, portfolioHealth]);

  const onTimeRate = Number(portfolioHealth?.on_time_payment_rate) || 0;
  const nplRatio = Number(portfolioHealth?.npl_ratio) || 0;
  const activeCapital = Number(portfolioHealth?.active_capital) || 0;

  const isHealthy = onTimeRate >= 80 && nplRatio < 5;
  const statusColorClass = isHealthy ? "text-success bg-success" : "text-warning bg-warning";
  const badgeBgClass = isHealthy ? "bg-success/10 text-success" : "bg-warning/10 text-warning";
  const progressBgClass = isHealthy ? "bg-success" : "bg-warning";

  if (collapsed) {
    return (
      <div className="p-3 border-t border-base-300 flex justify-center">
        <div 
          className={`tooltip tooltip-right tooltip-primary cursor-pointer flex items-center justify-center w-10 h-10 rounded-xl ${badgeBgClass}`}
          data-tip={`Portfolio Health: ${onTimeRate}% on-time`}
        >
          <Heart size={18} className="fill-current/20 stroke-[2.5]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-base-300 shrink-0 bg-base-100">
      <div className="rounded-xl border border-base-200 bg-base-200/50 p-3 transition-all duration-300">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs font-semibold text-base-content/80 hover:text-primary transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className={`flex h-2 w-2 rounded-full ${isHealthy ? "bg-success" : "bg-warning"} ring-4 ${isHealthy ? "ring-success/20" : "ring-warning/20"} animate-ping`} />
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
              <span className={`font-bold ${isHealthy ? "text-success" : "text-warning"}`}>
                {onTimeRate}%
              </span>
            </div>
            <div className="w-full bg-base-300 h-1.5 rounded-full overflow-hidden">
              <div
                className={`${progressBgClass} h-full rounded-full transition-all`}
                style={{ width: `${Math.min(onTimeRate, 100)}%` }}
              />
            </div>
            
            <div className="divider my-1.5 opacity-50" />
            
            <div className="flex justify-between text-[11px]">
              <span className="text-base-content/50">NPL Ratio</span>
              <span className={`font-semibold ${nplRatio < 2 ? "text-success" : "text-warning"}`}>
                {nplRatio}%
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-base-content/50">Active Capital</span>
              <span className="font-semibold text-base-content">
                {formatCompactCurrency(activeCapital)}
              </span>
            </div>
          </div>
        </div>

        {/* Default brief status shown when collapsed */}
        {!expanded && (
          <div className="mt-1 flex justify-between items-center text-[11px]">
            <span className="text-base-content/50">On-time repayments</span>
            <span className={`font-bold ${isHealthy ? "text-success" : "text-warning"}`}>
              {onTimeRate}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
