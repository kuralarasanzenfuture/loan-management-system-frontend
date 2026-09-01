import React, { useState, useEffect } from "react";
import {
  Menu,
  Maximize,
  Minimize,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import Breadcrumbs from "./components/Breadcrumbs.jsx";
import SearchBar from "./components/SearchBar.jsx";
import NotificationBell from "./components/NotificationBell.jsx";
import ProfileDropdown from "./components/ProfileDropdown.jsx";
import ThemeSelector from "../../theme/ThemeSelector.jsx";
import QuickSearch from "./components/QuickSearch.jsx";

export default function Header({
  onMenuClick = () => {},
  collapsed = false,
  onCollapseToggle = () => {},
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <header
      className="sticky top-0 z-40 h-16 w-full flex items-center justify-between gap-4 px-4 lg:px-6 bg-base-100 backdrop-blur-md border-b border-base-300"
      style={{ overflow: "visible" }}
    >
      <div className="flex items-center gap-2">
        <button
          className="btn btn-ghost btn-sm btn-circle lg:hidden hover:bg-base-200"
          onClick={onMenuClick}
          aria-label="Open sidebar menu"
        >
          <Menu size={20} className="text-base-content/70" />
        </button>

        <button
          className="btn btn-ghost btn-sm btn-circle hidden lg:inline-flex hover:bg-base-200"
          onClick={onCollapseToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen size={20} className="text-base-content/70" />
          ) : (
            <PanelLeftClose size={20} className="text-base-content/70" />
          )}
        </button>

        <div className="divider divider-horizontal hidden md:block mx-1 h-6 self-center" />
        <Breadcrumbs />
      </div>

      {/* <SearchBar /> */}

      <div className="flex items-center gap-2.5 shrink-0">
        <ThemeSelector />

        <button
          className="btn btn-ghost btn-sm btn-circle hidden sm:inline-flex hover:bg-base-200"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <Minimize size={18} className="text-base-content/70" />
          ) : (
            <Maximize size={18} className="text-base-content/70" />
          )}
        </button>

          <QuickSearch />
        {/* <NotificationBell /> */}

        <div className="divider divider-horizontal mx-0.5 h-6 self-center" />

        <ProfileDropdown />
      </div>
    </header>
  );
}
