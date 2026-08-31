import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, X, LayoutGrid, LogOut } from "lucide-react";
import { NAV_SECTIONS } from "../../Sidebar/sidebarMenu.js";

import usePermissions from "../../../../hooks/usePermissions.js";
import { filterNavSections } from "../../../../utils/permissionUtils.js";

/**
 * AppLauncher
 * Grid-icon-triggered overlay: search bar + multi-column list of every
 * section/page in the app, like a command palette without the keyboard-first
 * behavior. Uses CSS multi-column (`columns-*`) so sections stack into
 * whichever column has room next, matching a masonry-style mega menu.
 */
export default function QuickSearch() {
  const { user } = usePermissions();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    const handleKey = (e) => e.key === "Escape" && setOpen(false);
    const handleClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const accessibleSections = useMemo(() => {
    return filterNavSections(NAV_SECTIONS, user);
  }, [user]);

  const filteredSections = useMemo(() => {
    if (!query.trim()) return accessibleSections;
    const q = query.toLowerCase();
    return accessibleSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          item.label.toLowerCase().includes(q)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [accessibleSections, query]);

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-sm btn-circle hidden sm:inline-flex"
        onClick={() => setOpen(true)}
        aria-label="Open quick access menu"
        title="Quick access"
      >
        <LayoutGrid size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 px-4">
          <div
            ref={rootRef}
            className="w-full max-w-5xl max-h-[80vh] rounded-2xl bg-base-100 border border-base-300 shadow-dropdown flex flex-col overflow-hidden"
          >
            {/* Search bar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-base-300 shrink-0">
              <Search size={18} className="text-base-content/40 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search modules and pages…"
                className="grow bg-transparent outline-none text-sm text-base-content placeholder:text-base-content/40"
              />
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-circle shrink-0"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            {/* Sections */}
            <div className="overflow-y-auto p-6">
              {filteredSections.length === 0 ? (
                <p className="text-sm text-base-content/40 text-center py-10">
                  No matching pages found.
                </p>
              ) : (
                <div className="columns-1 sm:columns-2 lg:columns-4 gap-8">
                  {filteredSections.map((section) => (
                    <div key={section.label} className="break-inside-avoid mb-7">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-2.5">
                        {section.label}
                      </h4>
                      <ul className="space-y-1.5">
                        {section.items.map((item) => (
                          <li key={item.path}>
                            <Link
                              to={item.path}
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-2 text-sm text-base-content/70 hover:text-primary transition-colors"
                            >
                              {item.label}
                              {item.badge && (
                                <span className="badge badge-primary badge-xs">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {/* Static account section — not part of NAV_SECTIONS */}
                  {!query.trim() && (
                    <div className="break-inside-avoid mb-7">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-2.5">
                        Account
                      </h4>
                      <ul className="space-y-1.5">
                        <li>
                          <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 text-sm text-error hover:opacity-80 transition-opacity"
                          >
                            <LogOut size={13} />
                            Logout
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}