import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Search,
  X,
  CornerDownLeft,
  LogOut,
  User,
  Settings,
  SearchX,
  Sparkles,
  Compass,
  ArrowRight,
} from "lucide-react";
import { NAV_SECTIONS } from "../../Sidebar/sidebarMenu.js";
import usePermissions from "../../../../hooks/usePermissions.js";
import { filterNavSections } from "../../../../utils/permissionUtils.js";
import { logoutUser } from "../../../../../redux/auth/authSlice.js";

/**
 * Helper to highlight matching text in query results
 */
function HighlightMatch({ text, query }) {
  if (!query || !query.trim()) return <span>{text}</span>;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-primary/20 text-primary font-semibold rounded-xs px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

/**
 * QuickSearch Component
 * - Enterprise-grade command palette & quick navigation
 * - Global Ctrl+K / ⌘K and "/" keyboard shortcut listeners
 * - Arrow key navigation (↑, ↓) and Enter to jump directly to page
 * - Clean responsive trigger in header (pill on desktop, icon button on mobile)
 * - True backdrop blur modal with body scroll lock
 */
export default function QuickSearch() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = usePermissions();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMac, setIsMac] = useState(false);

  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);
  const itemRefs = useRef([]);

  // Detect platform for shortcut symbol
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC"));
  }, []);

  // Filter accessible sections based on user permissions
  const accessibleSections = useMemo(() => {
    return filterNavSections(NAV_SECTIONS, user);
  }, [user]);

  // Flatten accessible items for fast search & indexing
  const searchableItems = useMemo(() => {
    const list = [];

    accessibleSections.forEach((section) => {
      section.items.forEach((item) => {
        list.push({
          id: `${section.label}-${item.path}`,
          label: item.label,
          path: item.path,
          icon: item.icon,
          badge: item.badge,
          sectionLabel: section.label,
          type: "page",
        });
      });
    });

    // Account & System quick actions
    list.push({
      id: "action-profile",
      label: "My Profile",
      path: "/profile",
      icon: User,
      sectionLabel: "Account",
      type: "action",
    });

    list.push({
      id: "action-settings",
      label: "System Settings",
      path: "/settings",
      icon: Settings,
      sectionLabel: "Account",
      type: "action",
    });

    list.push({
      id: "action-logout",
      label: "Logout",
      action: "logout",
      icon: LogOut,
      sectionLabel: "Account",
      type: "action",
      isDestructive: true,
    });

    return list;
  }, [accessibleSections]);

  // Filter items according to search query
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return searchableItems.filter((item) => {
      const matchLabel = item.label.toLowerCase().includes(q);
      const matchSection = item.sectionLabel.toLowerCase().includes(q);
      const matchPath = item.path ? item.path.toLowerCase().includes(q) : false;
      return matchLabel || matchSection || matchPath;
    });
  }, [searchableItems, query]);

  // Frequently accessed quick links when search is empty
  const suggestedLinks = useMemo(() => {
    const preferredPaths = [
      "/dashboard",
      "/customers",
      "/loan-applications",
      "/interest-loans",
      "/interest-loans/collections",
      "/settings",
    ];
    return searchableItems.filter(
      (item) => item.type === "page" && preferredPaths.includes(item.path)
    );
  }, [searchableItems]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (open && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex, open]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Handle action or route selection
  const handleSelect = useCallback(
    async (item) => {
      setOpen(false);
      if (item.action === "logout") {
        try {
          await dispatch(logoutUser());
        } catch (err) {
          console.error("Logout failed:", err);
        } finally {
          navigate("/login", { replace: true });
        }
      } else if (item.path) {
        navigate(item.path);
      }
    },
    [dispatch, navigate]
  );

  // Global keyboard shortcuts (Ctrl+K, ⌘K, /, Esc, Arrows, Enter)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Toggle modal on Ctrl+K or ⌘K
      if (isCmdOrCtrl && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      // Open on "/" when not inside an input or textarea
      if (
        !open &&
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName) &&
        !document.activeElement?.isContentEditable
      ) {
        e.preventDefault();
        setOpen(true);
        return;
      }

      // Handle keyboard navigation when modal is open
      if (open) {
        if (e.key === "Escape") {
          e.preventDefault();
          setOpen(false);
          return;
        }

        const activeList = query.trim() ? filteredItems : [];
        if (activeList.length > 0) {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % activeList.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) =>
              prev - 1 < 0 ? activeList.length - 1 : prev - 1
            );
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeList[selectedIndex]) {
              handleSelect(activeList[selectedIndex]);
            }
          }
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [open, query, filteredItems, selectedIndex, handleSelect]);

  // Autofocus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  return (
    <>
      {/* Header Trigger Button */}
      {/* Desktop / Tablet: Sleek search bar trigger pill */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center justify-between gap-2.5 h-9 w-48 lg:w-56 px-3 rounded-xl border border-base-300 bg-base-200/50 hover:bg-base-200 hover:border-base-content/25 text-base-content/60 hover:text-base-content transition-all text-xs cursor-pointer shadow-2xs group select-none"
        aria-label="Quick search"
        title={`Quick search (${isMac ? "⌘K" : "Ctrl+K"})`}
      >
        <span className="flex items-center gap-2 truncate">
          <Search
            size={14}
            className="text-base-content/40 group-hover:text-primary transition-colors shrink-0"
          />
          <span className="font-medium truncate">Quick search...</span>
        </span>
        <kbd className="kbd kbd-xs bg-base-100 border border-base-300/80 text-[10px] font-semibold text-base-content/60 px-1.5 py-0.5 rounded shadow-2xs shrink-0">
          {isMac ? "⌘K" : "Ctrl+K"}
        </kbd>
      </button>

      {/* Mobile: Circle icon button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-ghost btn-sm btn-circle flex md:hidden hover:bg-base-200 text-base-content/70"
        aria-label="Quick search"
        title={`Quick search (${isMac ? "⌘K" : "Ctrl+K"})`}
      >
        <Search size={18} />
      </button>

      {/* QuickSearch Modal Overlay */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-start justify-center p-3 sm:p-4 pt-16 sm:pt-24 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Quick Search Palette"
          >
            <div
              className="w-full max-w-2xl bg-base-100 text-base-content rounded-2xl shadow-2xl border border-base-300 flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150 max-h-[82vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input Bar */}
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-base-200 shrink-0 bg-base-100">
                <Search size={19} className="text-primary shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search pages, loans, collections, settings... (or Esc to close)"
                  className="grow bg-transparent border-0 ring-0 outline-none focus:outline-none focus:ring-0 focus:border-transparent text-sm sm:text-base font-normal text-base-content placeholder:text-base-content/40 shadow-none"
                  style={{ outline: "none", boxShadow: "none", border: "none" }}
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-base-content"
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn btn-ghost btn-xs rounded-lg px-2 text-xs font-medium text-base-content/60 hover:bg-base-200 flex items-center gap-1 shrink-0"
                  aria-label="Close search"
                >
                  <kbd className="kbd kbd-xs bg-base-200/80 border border-base-300/80 text-[10px] font-semibold text-base-content/60 shadow-2xs">
                    ESC
                  </kbd>
                </button>
              </div>

              {/* Results / Navigation Area */}
              <div
                ref={resultsContainerRef}
                className="overflow-y-auto px-4 sm:px-5 py-4 space-y-4 max-h-[58vh]"
              >
              {query.trim() ? (
                /* Search Results View */
                filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center text-base-content/40 mb-3">
                      <SearchX size={24} />
                    </div>
                    <p className="text-sm font-semibold text-base-content">
                      No results found for &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-xs text-base-content/50 mt-1 max-w-sm">
                      Check your spelling or try searching for keywords like{" "}
                      <span className="font-medium text-primary">loans</span>,{" "}
                      <span className="font-medium text-primary">collections</span>,{" "}
                      <span className="font-medium text-primary">customers</span>, or{" "}
                      <span className="font-medium text-primary">reports</span>.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between px-2 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-base-content/45">
                        Results ({filteredItems.length})
                      </span>
                      <span className="text-[11px] text-base-content/40 hidden sm:inline-block">
                        Use ↑↓ to navigate, ↵ to select
                      </span>
                    </div>

                    <div className="space-y-1">
                      {filteredItems.map((item, index) => {
                        const Icon = item.icon || Compass;
                        const isSelected = index === selectedIndex;

                        return (
                          <div
                            key={item.id}
                            ref={(el) => (itemRefs.current[index] = el)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            onClick={() => handleSelect(item)}
                            className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-100 ${
                              isSelected
                                ? "bg-primary/10 text-primary font-medium border border-primary/20 shadow-xs"
                                : "hover:bg-base-200/80 text-base-content border border-transparent"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                  isSelected
                                    ? "bg-primary text-primary-content"
                                    : "bg-base-200 text-base-content/70"
                                }`}
                              >
                                <Icon size={16} />
                              </div>

                              <div className="min-w-0">
                                <div className="text-sm font-medium flex items-center gap-2 truncate">
                                  <HighlightMatch
                                    text={item.label}
                                    query={query}
                                  />
                                  {item.badge && (
                                    <span className="badge badge-primary badge-xs">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-base-content/45 flex items-center gap-1.5 truncate">
                                  <span>{item.sectionLabel}</span>
                                  {item.path && (
                                    <>
                                      <span>•</span>
                                      <span className="font-mono">{item.path}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isSelected ? (
                                <span className="flex items-center gap-1 text-xs text-primary font-semibold">
                                  <span className="hidden sm:inline">Jump</span>
                                  <CornerDownLeft size={13} />
                                </span>
                              ) : (
                                <ArrowRight
                                  size={14}
                                  className="text-base-content/20"
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              ) : (
                /* Default View (No query typed yet) */
                <div className="space-y-5">
                  {/* Suggested Quick Links */}
                  {suggestedLinks.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-base-content/45">
                        <Sparkles size={13} className="text-primary" />
                        <span>Quick Shortcuts</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {suggestedLinks.map((item) => {
                          const Icon = item.icon || Compass;
                          return (
                            <Link
                              key={item.id}
                              to={item.path}
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-2.5 p-2.5 rounded-xl border border-base-200 bg-base-200/40 hover:bg-base-200 hover:border-base-300 text-base-content transition-all group"
                            >
                              <div className="w-7 h-7 rounded-lg bg-base-100 flex items-center justify-center text-base-content/70 group-hover:text-primary group-hover:scale-105 transition-all shadow-2xs shrink-0">
                                <Icon size={14} />
                              </div>
                              <span className="text-xs font-medium truncate">
                                {item.label}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* All Sections Overview */}
                  <div>
                    <div className="px-2 mb-2 text-xs font-semibold uppercase tracking-wider text-base-content/45">
                      All Modules & Pages
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {accessibleSections.map((section) => (
                        <div
                          key={section.label}
                          className="p-3 rounded-xl bg-base-200/30 border border-base-200/80"
                        >
                          <h4 className="text-xs font-bold uppercase tracking-wider text-primary/80 mb-2">
                            {section.label}
                          </h4>
                          <ul className="space-y-1">
                            {section.items.map((item) => {
                              const ItemIcon = item.icon || Compass;
                              return (
                                <li key={item.path}>
                                  <Link
                                    to={item.path}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-base-content/80 hover:text-primary hover:bg-base-200 transition-colors group"
                                  >
                                    <ItemIcon
                                      size={13}
                                      className="text-base-content/40 group-hover:text-primary transition-colors shrink-0"
                                    />
                                    <span className="truncate">{item.label}</span>
                                    {item.badge && (
                                      <span className="badge badge-primary badge-xs ml-auto">
                                        {item.badge}
                                      </span>
                                    )}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}

                      {/* Account Section */}
                      <div className="p-3 rounded-xl bg-base-200/30 border border-base-200/80">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary/80 mb-2">
                          Account
                        </h4>
                        <ul className="space-y-1">
                          <li>
                            <Link
                              to="/profile"
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-base-content/80 hover:text-primary hover:bg-base-200 transition-colors group"
                            >
                              <User
                                size={13}
                                className="text-base-content/40 group-hover:text-primary transition-colors shrink-0"
                              />
                              <span className="truncate">My Profile</span>
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/settings"
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-base-content/80 hover:text-primary hover:bg-base-200 transition-colors group"
                            >
                              <Settings
                                size={13}
                                className="text-base-content/40 group-hover:text-primary transition-colors shrink-0"
                              />
                              <span className="truncate">Settings</span>
                            </Link>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={() =>
                                handleSelect({ action: "logout" })
                              }
                              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-error hover:bg-error/10 transition-colors group text-left"
                            >
                              <LogOut
                                size={13}
                                className="text-error/70 group-hover:text-error transition-colors shrink-0"
                              />
                              <span className="truncate">Logout</span>
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Palette Footer Bar */}
            <div className="px-4 py-2.5 bg-base-200/60 border-t border-base-300 flex items-center justify-between text-xs text-base-content/60 shrink-0">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="kbd kbd-xs bg-base-100 border-base-300 text-[10px]">
                    ↑
                  </kbd>
                  <kbd className="kbd kbd-xs bg-base-100 border-base-300 text-[10px]">
                    ↓
                  </kbd>
                  <span className="hidden sm:inline">Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="kbd kbd-xs bg-base-100 border-base-300 text-[10px]">
                    ↵
                  </kbd>
                  <span className="hidden sm:inline">Select</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="kbd kbd-xs bg-base-100 border-base-300 text-[10px]">
                    esc
                  </kbd>
                  <span className="hidden sm:inline">Close</span>
                </span>
              </div>

              <div className="text-[11px] text-base-content/45">
                {query.trim() ? (
                  <span>
                    {filteredItems.length}{" "}
                    {filteredItems.length === 1 ? "result" : "results"}
                  </span>
                ) : (
                  <span className="hidden sm:inline">
                    CM Micro Finance Quick Search
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}