import React, { useState, useRef, useEffect } from "react";
import { Palette, Check } from "lucide-react";

const THEMES = [
  "meridian-light",
  "meridian-dark",
  "light",
  "dark",
  "cupcake",
  "corporate",
  "business",
  "night",
  "forest",
  "luxury",
  "dracula",
  "winter",
  "dim",
  "nord",
];

export default function ThemeSelector() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("meridian-theme") || "meridian-light",
  );
  const rootRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("meridian-theme", theme);
  }, [theme]);

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
        className="btn btn-ghost btn-sm btn-circle hover:bg-base-200 transition-colors"
        aria-label="Change theme"
        aria-expanded={open}
        title="Change theme"
      >
        <Palette size={18} className="text-base-content/70" />
      </button>

      {open && (
        <ul className="absolute right-0 top-full mt-2 w-48 max-h-80 overflow-y-auto rounded-2xl bg-base-100 border border-base-300 shadow-dropdown p-2 gap-0.5 z-50">
          {THEMES.map((t) => (
            <li key={t}>
              <button
                onClick={() => {
                  setTheme(t);
                  setOpen(false);
                }}
                className="flex items-center justify-between w-full text-xs font-medium py-2 px-3 rounded-lg text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors capitalize"
              >
                {t.replace("meridian-", "")}
                {theme === t && <Check size={13} className="text-primary" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
