import React, { useState, useRef, useEffect } from "react";
import { Bell, FileText, CheckCircle2, AlertCircle } from "lucide-react";

const RECENT_NOTIFICATIONS = [
  {
    id: 1,
    title: "New application received",
    description: "Marcus Vance submitted a $25,000 personal loan application.",
    time: "5m ago",
    unread: true,
    icon: FileText,
    iconColor: "text-blue-500 bg-blue-500/10",
  },
  {
    id: 2,
    title: "Repayment completed",
    description:
      "Elena Rostova paid monthly instalment of $1,240 on Loan #4492.",
    time: "1h ago",
    unread: true,
    icon: CheckCircle2,
    iconColor: "text-green-500 bg-green-500/10",
  },
  {
    id: 3,
    title: "Overdue alert",
    description: "Loan #1029 (Jordan K.) is 3 days past payment due date.",
    time: "4h ago",
    unread: false,
    icon: AlertCircle,
    iconColor: "text-amber-500 bg-amber-500/10",
  },
];

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const unreadCount = RECENT_NOTIFICATIONS.filter((n) => n.unread).length;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target))
        setOpen(false);
    };
    const handleEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn btn-ghost btn-sm btn-circle relative hover:bg-base-200 transition-colors"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <div className="indicator">
          <Bell size={19} className="text-base-content/70 stroke-[2]" />
          {unreadCount > 0 && (
            <span className="indicator-item badge badge-primary badge-xs ring-2 ring-base-100" />
          )}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 md:w-96 rounded-2xl bg-base-100 border border-base-300 shadow-dropdown overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-base-200 bg-base-200/20">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <span className="badge badge-primary badge-sm font-semibold">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-base-200">
            {RECENT_NOTIFICATIONS.map((n) => {
              const Icon = n.icon;
              return (
                <div
                  key={n.id}
                  className={`flex gap-3 p-4 hover:bg-base-200/50 transition-colors cursor-pointer ${
                    n.unread
                      ? "bg-primary/5 border-l-2 border-primary"
                      : "border-l-2 border-transparent"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${n.iconColor}`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 space-y-0.5 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <p
                        className={`text-xs truncate ${n.unread ? "font-semibold text-base-content" : "text-base-content/80"}`}
                      >
                        {n.title}
                      </p>
                      <span className="text-[10px] text-base-content/40 shrink-0">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-base-content/50 leading-relaxed line-clamp-2">
                      {n.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-4 py-2 text-center border-t border-base-200 bg-base-200/20">
            <button
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-primary hover:underline w-full"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
