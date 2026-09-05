import React, { useEffect, useState } from "react";
import {
  Check,
  Type,
  Rows3,
  Hash,
  CalendarDays,
  Zap,
  Globe,
  Palette,
  Sparkles,
  Layout,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  THEMES,
  THEME_LABELS,
  ThemeSwatch,
} from "../../../config/Themeconfig.jsx";

// ─────────────────────────────────────────────────────────────────────────
// FONTS
// ─────────────────────────────────────────────────────────────────────────
export const FONT_OPTIONS = [
  {
    key: "inter",
    label: "Inter",
    blurb: "Default — neutral & ultra-versatile",
    google: "Inter:wght@400;500;600;700",
    family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  {
    key: "public-sans",
    label: "Public Sans",
    blurb: "Clean, institutional design system font",
    google: "Public+Sans:wght@400;500;600;700",
    family: "'Public Sans', -apple-system, sans-serif",
  },
  {
    key: "ibm-plex-sans",
    label: "IBM Plex Sans",
    blurb: "Technical, sharp & data-friendly",
    google: "IBM+Plex+Sans:wght@400;500;600;700",
    family: "'IBM Plex Sans', -apple-system, sans-serif",
  },
  {
    key: "work-sans",
    label: "Work Sans",
    blurb: "Warm, highly legible at small numbers",
    google: "Work+Sans:wght@400;500;600;700",
    family: "'Work Sans', -apple-system, sans-serif",
  },
  {
    key: "manrope",
    label: "Manrope",
    blurb: "Modern, slightly geometric fintech look",
    google: "Manrope:wght@400;500;600;700",
    family: "'Manrope', -apple-system, sans-serif",
  },
  {
    key: "plus-jakarta",
    label: "Plus Jakarta Sans",
    blurb: "Distinctive contemporary banking feel",
    google: "Plus+Jakarta+Sans:wght@400;500;600;700",
    family: "'Plus Jakarta Sans', -apple-system, sans-serif",
  },
  {
    key: "poppins",
    label: "Poppins",
    blurb: "Geometric, friendly & modern banking standard",
    google: "Poppins:wght@400;500;600;700",
    family: "'Poppins', -apple-system, sans-serif",
  },
  {
    key: "source-sans",
    label: "Source Sans 3",
    blurb: "Adobe's workhorse, exceptionally clear",
    google: "Source+Sans+3:wght@400;500;600;700",
    family: "'Source Sans 3', -apple-system, sans-serif",
  },
  {
    key: "outfit",
    label: "Outfit",
    blurb: "Crisp geometric headings & body",
    google: "Outfit:wght@400;500;600;700",
    family: "'Outfit', -apple-system, sans-serif",
  },
  {
    key: "roboto",
    label: "Roboto",
    blurb: "Familiar, standard crisp UI typeface",
    google: "Roboto:wght@400;500;600;700",
    family: "'Roboto', -apple-system, sans-serif",
  },
];

export const FONT_STORAGE_KEY = "meridian-font";

export function applyFont(fontKey) {
  const font = FONT_OPTIONS.find((f) => f.key === fontKey) || FONT_OPTIONS[0];

  let link = document.getElementById("app-dynamic-font");
  if (!link) {
    link = document.createElement("link");
    link.id = "app-dynamic-font";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  // Only override href if link doesn't already contain the target google font
  if (!link.href || (!link.href.includes(font.google) && !link.href.includes("family=" + font.label.replace(/\s+/g, "+")))) {
    link.href = `https://fonts.googleapis.com/css2?family=${font.google}&display=swap`;
  }

  // Set CSS custom properties on documentElement
  document.documentElement.style.setProperty("--font-app", font.family);
  document.documentElement.style.setProperty("--font-body", font.family);

  // Directly assign inline font family to root and body for immediate propagation
  document.documentElement.style.fontFamily = font.family;
  if (typeof document !== "undefined" && document.body) {
    document.body.style.fontFamily = font.family;
  }

  try {
    localStorage.setItem(FONT_STORAGE_KEY, font.key);
  } catch (err) {
    console.error("Failed to save font to localStorage", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// OTHER PREFERENCES CONSTANTS
// ─────────────────────────────────────────────────────────────────────────
const DENSITY_OPTIONS = [
  { key: "compact", label: "Compact", desc: "Dense data view for fast scanning" },
  { key: "comfortable", label: "Comfortable", desc: "Standard balanced spacing" },
  { key: "spacious", label: "Spacious", desc: "Roomy touch-friendly row layout" },
];

const NUMBER_FORMAT_OPTIONS = [
  { key: "en-IN", label: "Indian Rupees", example: "₹1,25,000.00" },
  { key: "en-US", label: "US Dollar ($)", example: "$125,000.00" },
  { key: "en-GB", label: "British Pound (£)", example: "£125,000.00" },
  { key: "de-DE", label: "Euro (€)", example: "125.000,00 €" },
];

const DATE_FORMAT_OPTIONS = [
  { key: "dd-mm-yyyy", label: "DD/MM/YYYY", example: "29/08/2026" },
  { key: "yyyy-mm-dd", label: "YYYY-MM-DD (ISO)", example: "2026-08-29" },
  { key: "mm-dd-yyyy", label: "MM/DD/YYYY", example: "08/29/2026" },
  { key: "dd-mmm-yyyy", label: "DD Mon YYYY", example: "29 Aug 2026" },
];

const THEME_CATEGORIES = [
  { key: "all", label: "All Themes" },
  { key: "dark", label: "Dark & High-Contrast" },
  { key: "light", label: "Light & Clean" },
  { key: "vibrant", label: "Vibrant & Accent" },
];

export default function PreferencesTab() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("meridian-theme") || "cm-micro-blue"
  );
  const [themeFilter, setThemeFilter] = useState("all");
  const [themeSearch, setThemeSearch] = useState("");

  const [font, setFont] = useState(
    () => localStorage.getItem(FONT_STORAGE_KEY) || "inter"
  );
  const [language, setLanguage] = useState(
    () => localStorage.getItem("meridian-language") || "en"
  );
  const [timezone, setTimezone] = useState(
    () => localStorage.getItem("meridian-timezone") || "Asia/Kolkata"
  );
  const [density, setDensity] = useState(
    () => localStorage.getItem("meridian-density") || "comfortable"
  );
  const [numberFormat, setNumberFormat] = useState(
    () => localStorage.getItem("meridian-number-format") || "en-IN"
  );
  const [dateFormat, setDateFormat] = useState(
    () => localStorage.getItem("meridian-date-format") || "dd-mm-yyyy"
  );
  const [reduceMotion, setReduceMotion] = useState(
    () => localStorage.getItem("meridian-reduce-motion") === "true"
  );
  const [sidebarAutoCollapse, setSidebarAutoCollapse] = useState(
    () => localStorage.getItem("meridian-sidebar-autocollapse") === "true"
  );

  const [savedBanner, setSavedBanner] = useState(null);

  // Apply Font on load
  useEffect(() => {
    applyFont(font);
  }, []);

  // Reduce motion listener
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduceMotion);
    localStorage.setItem("meridian-reduce-motion", String(reduceMotion));
  }, [reduceMotion]);

  const showToast = (msg) => {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(null), 2500);
  };

  const handleSelectTheme = (t) => {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("meridian-theme", t);
    showToast(`Theme switched to "${THEME_LABELS[t] || t}"`);
  };

  const handleSelectFont = (key) => {
    setFont(key);
    applyFont(key);
    const chosen = FONT_OPTIONS.find((f) => f.key === key);
    showToast(`Font family updated to "${chosen?.label || key}"`);
  };

  const handleSelectDensity = (key) => {
    setDensity(key);
    document.documentElement.setAttribute("data-density", key);
    localStorage.setItem("meridian-density", key);
    showToast(`Table density set to "${key}"`);
  };

  const handleLanguageChange = (val) => {
    setLanguage(val);
    localStorage.setItem("meridian-language", val);
    showToast("Language preference saved");
  };

  const handleTimezoneChange = (val) => {
    setTimezone(val);
    localStorage.setItem("meridian-timezone", val);
    showToast("Timezone preference saved");
  };

  const handleNumberFormatChange = (val) => {
    setNumberFormat(val);
    localStorage.setItem("meridian-number-format", val);
    showToast("Number & currency format saved");
  };

  const handleDateFormatChange = (val) => {
    setDateFormat(val);
    localStorage.setItem("meridian-date-format", val);
    showToast("Date format saved");
  };

  const handleSidebarCollapseToggle = (val) => {
    setSidebarAutoCollapse(val);
    localStorage.setItem("meridian-sidebar-autocollapse", String(val));
    showToast(`Sidebar auto-collapse ${val ? "enabled" : "disabled"}`);
  };

  // Filter themes
  const filteredThemes = THEMES.filter((t) => {
    const label = (THEME_LABELS[t] || t).toLowerCase();
    const query = themeSearch.toLowerCase().trim();
    if (query && !label.includes(query) && !t.toLowerCase().includes(query)) {
      return false;
    }

    if (themeFilter === "dark") {
      return (
        t.includes("dark") ||
        ["night", "forest", "black", "luxury", "dracula", "dim", "abyss", "synthwave", "business"].includes(t)
      );
    }
    if (themeFilter === "light") {
      return (
        t.includes("light") ||
        ["corporate", "cupcake", "emerald", "garden", "lofi", "pastel", "fantasy", "winter", "nord", "silk"].includes(t)
      );
    }
    if (themeFilter === "vibrant") {
      return ["cyberpunk", "retro", "valentine", "halloween", "aqua", "autumn", "acid", "lemonade", "sunset", "caramellatte"].includes(t);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {savedBanner && (
        <div className="alert alert-success shadow-lg text-sm flex items-center justify-between py-2.5 px-4 rounded-xl sticky top-20 z-30 transition-all">
          <div className="flex items-center gap-2">
            <Check size={16} />
            <span>{savedBanner}</span>
          </div>
        </div>
      )}

      {/* 1. Theme Selection */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h3 className="font-semibold text-base flex items-center gap-2 text-base-content">
              <Palette size={18} className="text-primary" />
              Theme & Styling
            </h3>
            <p className="text-xs text-base-content/60 mt-0.5">
              Choose your preferred color theme with accurate live previews.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/40"
              />
              <input
                type="text"
                placeholder="Search themes..."
                value={themeSearch}
                onChange={(e) => setThemeSearch(e.target.value)}
                className="input input-bordered input-xs pl-8 pr-3 w-36 sm:w-48 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-base-200">
          {THEME_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setThemeFilter(cat.key)}
              className={`btn btn-xs rounded-lg font-medium transition-all ${
                themeFilter === cat.key
                  ? "btn-primary shadow-sm"
                  : "btn-ghost text-base-content/70 hover:bg-base-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-80 overflow-y-auto p-1 -m-1 custom-scrollbar">
          {filteredThemes.map((t) => {
            const isActive = theme === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => handleSelectTheme(t)}
                className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all ${
                  isActive
                    ? "border-primary bg-primary/10 ring-1 ring-primary font-semibold"
                    : "border-base-300 hover:bg-base-200 hover:border-base-content/20"
                }`}
              >
                <ThemeSwatch theme={t} size="w-6 h-6" />
                <span
                  className={`flex-1 text-xs truncate capitalize ${
                    isActive ? "text-primary font-bold" : "text-base-content/80"
                  }`}
                >
                  {THEME_LABELS[t] || t}
                </span>
                {isActive && (
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-content shrink-0">
                    <Check size={10} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
          {filteredThemes.length === 0 && (
            <div className="col-span-full py-8 text-center text-xs text-base-content/50">
              No themes match &quot;{themeSearch}&quot; in this category.
            </div>
          )}
        </div>
      </div>

      {/* 2. Typography Selection */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h3 className="font-semibold text-base flex items-center gap-2 text-base-content">
              <Type size={18} className="text-primary" />
              Typography & Font Family
            </h3>
            <p className="text-xs text-base-content/60 mt-0.5">
              Live font injection for optimal readability in tables, forms, and charts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="pref-font-select" className="text-xs font-semibold text-base-content/70 whitespace-nowrap">
              Font Select:
            </label>
            <select
              id="pref-font-select"
              className="select select-bordered select-sm rounded-xl font-medium min-w-[170px]"
              value={font}
              onChange={(e) => handleSelectFont(e.target.value)}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label} {f.key === "inter" ? "(Default)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Font Typography Preview Banner */}
        <div
          className="p-4 rounded-xl border border-base-300 bg-base-200/50 mb-4 transition-all"
          style={{ fontFamily: FONT_OPTIONS.find((f) => f.key === font)?.family }}
        >
          <div className="flex items-center justify-between gap-2 mb-2 text-xs font-semibold text-base-content/60">
            <span>Live Typography Preview ({FONT_OPTIONS.find((f) => f.key === font)?.label || "Inter"})</span>
            <span className="badge badge-xs badge-primary badge-outline">Active Font</span>
          </div>
          <div className="space-y-1">
            <div className="text-base sm:text-lg font-bold text-base-content">
              CM Micro Finance — Professional Loan & Portfolio Management
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-base-content/80 flex-wrap">
              <span className="font-semibold text-primary">₹12,50,000.00 Principal</span>
              <span>•</span>
              <span>Loan ID: #LN-2026-0891</span>
              <span>•</span>
              <span className="badge badge-sm badge-success text-white">Active (14.5% APR)</span>
              <span>•</span>
              <span className="text-base-content/60">Updated 05 Sep 2026</span>
            </div>
          </div>
        </div>

        {/* Font Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto p-1 -m-1 custom-scrollbar">
          {FONT_OPTIONS.map((f) => {
            const isActive = font === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => handleSelectFont(f.key)}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                  isActive
                    ? "border-primary bg-primary/10 ring-1 ring-primary shadow-sm"
                    : "border-base-300 hover:bg-base-200 hover:border-base-content/20"
                }`}
              >
                <span
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-base-200 text-lg font-bold shrink-0 border border-base-300"
                  style={{ fontFamily: f.family }}
                  aria-hidden="true"
                >
                  Aa
                </span>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm font-semibold truncate ${
                      isActive ? "text-primary" : "text-base-content"
                    }`}
                    style={{ fontFamily: f.family }}
                  >
                    {f.label}
                  </div>
                  <div className="text-[11px] text-base-content/50 truncate">
                    {f.blurb}
                  </div>
                </div>
                {isActive && (
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-content shrink-0">
                    <Check size={10} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Regional & Localization */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <h3 className="font-semibold text-base flex items-center gap-2 text-base-content mb-1">
          <Globe size={18} className="text-primary" />
          Localization & Regional Settings
        </h3>
        <p className="text-xs text-base-content/60 mb-5">
          Configure language, timezone, currency symbols, and date formats.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="form-control">
            <label className="label pb-1.5" htmlFor="pref-language">
              <span className="label-text text-xs font-semibold text-base-content">
                Interface Language
              </span>
            </label>
            <select
              id="pref-language"
              className="select select-bordered select-sm rounded-lg w-full"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
            >
              <option value="en">English (US/UK)</option>
              <option value="ta">Tamil (தமிழ்)</option>
              <option value="hi">Hindi (हिन्दी)</option>
              <option value="es">Spanish (Español)</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label pb-1.5" htmlFor="pref-timezone">
              <span className="label-text text-xs font-semibold text-base-content">
                Timezone
              </span>
            </label>
            <select
              id="pref-timezone"
              className="select select-bordered select-sm rounded-lg w-full"
              value={timezone}
              onChange={(e) => handleTimezoneChange(e.target.value)}
            >
              <option value="Asia/Kolkata">India (IST, UTC+5:30)</option>
              <option value="America/New_York">Eastern Time (ET, UTC-5)</option>
              <option value="America/Los_Angeles">Pacific (PT, UTC-8)</option>
              <option value="Europe/London">London (GMT/BST)</option>
              <option value="Asia/Dubai">Dubai (GST, UTC+4)</option>
              <option value="Asia/Singapore">Singapore (SGT, UTC+8)</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label pb-1.5" htmlFor="pref-number-format">
              <span className="label-text text-xs font-semibold text-base-content">
                Currency & Number Format
              </span>
            </label>
            <select
              id="pref-number-format"
              className="select select-bordered select-sm rounded-lg w-full"
              value={numberFormat}
              onChange={(e) => handleNumberFormatChange(e.target.value)}
            >
              {NUMBER_FORMAT_OPTIONS.map((n) => (
                <option key={n.key} value={n.key}>
                  {n.label} ({n.example})
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label pb-1.5" htmlFor="pref-date-format">
              <span className="label-text text-xs font-semibold text-base-content">
                Date Display Format
              </span>
            </label>
            <select
              id="pref-date-format"
              className="select select-bordered select-sm rounded-lg w-full"
              value={dateFormat}
              onChange={(e) => handleDateFormatChange(e.target.value)}
            >
              {DATE_FORMAT_OPTIONS.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label} ({d.example})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Display, Density & Motion */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <h3 className="font-semibold text-base flex items-center gap-2 text-base-content mb-1">
          <Layout size={18} className="text-primary" />
          Display & Layout Adjustments
        </h3>
        <p className="text-xs text-base-content/60 mb-5">
          Fine-tune row heights, animations, and navigational behavior.
        </p>

        <div className="space-y-5">
          {/* Table Density */}
          <div className="flex items-center justify-between gap-4 flex-wrap p-3 rounded-xl bg-base-200/50 border border-base-200">
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-base-200 text-primary shrink-0">
                <Rows3 size={16} />
              </span>
              <div>
                <div className="text-sm font-semibold text-base-content">
                  Table & List Density
                </div>
                <div className="text-xs text-base-content/50 mt-0.5">
                  Adjust row padding across loan lists, transactions, and customer tables.
                </div>
              </div>
            </div>
            <div className="join border border-base-300 rounded-xl overflow-hidden shadow-xs">
              {DENSITY_OPTIONS.map((d) => (
                <button
                  key={d.key}
                  className={`join-item btn btn-sm font-medium ${
                    density === d.key
                      ? "btn-primary"
                      : "btn-ghost bg-base-100 hover:bg-base-200"
                  }`}
                  onClick={() => handleSelectDensity(d.key)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reduce Motion */}
          <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-base-200/50 border border-base-200">
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-base-200 text-primary shrink-0">
                <Zap size={16} />
              </span>
              <div>
                <div className="text-sm font-semibold text-base-content">
                  Reduce Motion & Animations
                </div>
                <div className="text-xs text-base-content/50 mt-0.5">
                  Disables smooth page transitions and micro-animations for high performance.
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary shrink-0"
              checked={reduceMotion}
              onChange={(e) => setReduceMotion(e.target.checked)}
              aria-label="Reduce motion"
            />
          </div>

          {/* Auto collapse sidebar on smaller screens */}
          <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-base-200/50 border border-base-200">
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-base-200 text-primary shrink-0">
                <Layout size={16} />
              </span>
              <div>
                <div className="text-sm font-semibold text-base-content">
                  Compact Sidebar by Default
                </div>
                <div className="text-xs text-base-content/50 mt-0.5">
                  Keep navigation rail collapsed to maximize workspace area.
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary shrink-0"
              checked={sidebarAutoCollapse}
              onChange={(e) => handleSidebarCollapseToggle(e.target.checked)}
              aria-label="Compact sidebar by default"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
