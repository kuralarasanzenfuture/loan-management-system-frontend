// import React, { useState, useEffect, useRef } from "react";
// import {
//   Settings as SettingsIcon,
//   ShieldCheck,
//   Smartphone,
//   Bell,
//   Mail,
//   Globe,
//   Moon,
//   Sun,
//   LogOut,
//   Check,
//   ChevronDown,
// } from "lucide-react";

// // All themes available in the daisyUI config (tailwind.config.js)
// const AVAILABLE_THEMES = [
//   "meridian-light",
//   "meridian-dark",
//   "light",
//   "dark",
//   "cupcake",
//   "corporate",
//   "business",
//   "night",
//   "forest",
//   "luxury",
//   "dracula",
//   "winter",
//   "dim",
//   "nord",
// ];

// const TABS = [
//   { key: "security", label: "Security", icon: ShieldCheck },
//   { key: "notifications", label: "Notifications", icon: Bell },
//   { key: "preferences", label: "Preferences", icon: Globe },
// ];

// // Placeholder — replace with real active-session data from your API.
// const MOCK_SESSIONS = [
//   {
//     id: 1,
//     device: "Chrome on macOS",
//     location: "Salem, Tamil Nadu",
//     current: true,
//     lastActive: "Active now",
//   },
//   {
//     id: 2,
//     device: "Safari on iPhone",
//     location: "Salem, Tamil Nadu",
//     current: false,
//     lastActive: "2 days ago",
//   },
// ];

// export default function SettingsPage() {
//   const [activeTab, setActiveTab] = useState("security");

//   return (
//     <div className="max-w-4xl">
//       <div className="mb-6">
//         <h1 className="text-xl font-semibold flex items-center gap-2">
//           <SettingsIcon size={20} className="text-primary" />
//           Account Settings
//         </h1>
//         <p className="text-sm text-base-content/50 mt-1">
//           Manage security, notifications, and how the platform looks for you.
//         </p>
//       </div>

//       {/* Tabs */}
//       <div role="tablist" className="tabs tabs-boxed bg-base-200 w-fit mb-6">
//         {TABS.map(({ key, label, icon: Icon }) => (
//           <button
//             key={key}
//             role="tab"
//             className={`tab gap-1.5 ${activeTab === key ? "tab-active" : ""}`}
//             onClick={() => setActiveTab(key)}
//           >
//             <Icon size={14} />
//             {label}
//           </button>
//         ))}
//       </div>

//       {activeTab === "security" && <SecurityTab />}
//       {activeTab === "notifications" && <NotificationsTab />}
//       {activeTab === "preferences" && <PreferencesTab />}
//     </div>
//   );
// }

// /* ---------------- Security ---------------- */
// function SecurityTab() {
//   const [twoFactor, setTwoFactor] = useState(false);
//   const [saved, setSaved] = useState(false);

//   const handleToggle2FA = () => {
//     // TODO: wire to your real thunk, e.g. dispatch(setTwoFactor(!twoFactor))
//     setTwoFactor((v) => !v);
//     setSaved(true);
//     setTimeout(() => setSaved(false), 2000);
//   };

//   return (
//     <div className="space-y-6">
//       <div className="rounded-2xl border border-base-300 bg-base-100 p-6">
//         <div className="flex items-start justify-between gap-4 flex-wrap">
//           <div className="flex items-start gap-3">
//             <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary shrink-0">
//               <Smartphone size={16} />
//             </span>
//             <div>
//               <h3 className="font-semibold text-sm">
//                 Two-factor authentication
//               </h3>
//               <p className="text-xs text-base-content/50 mt-0.5 max-w-md">
//                 Add an extra layer of security by requiring a verification code
//                 in addition to your password when signing in.
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             {saved && (
//               <span className="text-xs text-success flex items-center gap-1">
//                 <Check size={13} /> Saved
//               </span>
//             )}
//             <input
//               type="checkbox"
//               className="toggle toggle-primary"
//               checked={twoFactor}
//               onChange={handleToggle2FA}
//               aria-label="Toggle two-factor authentication"
//             />
//           </div>
//         </div>
//       </div>

//       <div className="rounded-2xl border border-base-300 bg-base-100 p-6">
//         <h3 className="font-semibold text-sm mb-1">Active sessions</h3>
//         <p className="text-xs text-base-content/50 mb-4">
//           Devices currently signed in to your account.
//         </p>

//         <div className="space-y-2">
//           {MOCK_SESSIONS.map((s) => (
//             <div
//               key={s.id}
//               className="flex items-center justify-between gap-3 rounded-lg border border-base-200 px-4 py-3"
//             >
//               <div>
//                 <div className="text-sm font-medium flex items-center gap-2">
//                   {s.device}
//                   {s.current && (
//                     <span className="badge badge-success badge-outline badge-xs">
//                       This device
//                     </span>
//                   )}
//                 </div>
//                 <div className="text-xs text-base-content/40 mt-0.5">
//                   {s.location} · {s.lastActive}
//                 </div>
//               </div>
//               {!s.current && (
//                 <button className="btn btn-ghost btn-xs text-error gap-1">
//                   <LogOut size={12} />
//                   Revoke
//                 </button>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ---------------- Notifications ---------------- */
// function NotificationsTab() {
//   const [prefs, setPrefs] = useState({
//     emailApplications: true,
//     emailRepayments: true,
//     emailReports: false,
//     smsAlerts: true,
//   });

//   const toggle = (key) => {
//     // TODO: wire to your real thunk, e.g. dispatch(updateNotificationPrefs({...}))
//     setPrefs((p) => ({ ...p, [key]: !p[key] }));
//   };

//   const rows = [
//     {
//       key: "emailApplications",
//       icon: Mail,
//       title: "New loan applications",
//       desc: "Get an email whenever a new application is submitted.",
//     },
//     {
//       key: "emailRepayments",
//       icon: Mail,
//       title: "Repayment reminders",
//       desc: "Email alerts for upcoming and overdue repayments.",
//     },
//     {
//       key: "emailReports",
//       icon: Mail,
//       title: "Weekly portfolio report",
//       desc: "A summary of portfolio performance every Monday.",
//     },
//     {
//       key: "smsAlerts",
//       icon: Bell,
//       title: "SMS alerts",
//       desc: "Critical alerts (fraud flags, failed payments) via SMS.",
//     },
//   ];

//   return (
//     <div className="rounded-2xl border border-base-300 bg-base-100 p-6">
//       <h3 className="font-semibold text-sm mb-1">Notification preferences</h3>
//       <p className="text-xs text-base-content/50 mb-5">
//         Choose what you want to be notified about, and how.
//       </p>

//       <div className="divide-y divide-base-200">
//         {rows.map(({ key, icon: Icon, title, desc }) => (
//           <div
//             key={key}
//             className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
//           >
//             <div className="flex items-start gap-3">
//               <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-base-200 text-base-content/50 shrink-0">
//                 <Icon size={15} />
//               </span>
//               <div>
//                 <div className="text-sm font-medium">{title}</div>
//                 <div className="text-xs text-base-content/50 mt-0.5 max-w-sm">
//                   {desc}
//                 </div>
//               </div>
//             </div>
//             <input
//               type="checkbox"
//               className="toggle toggle-primary shrink-0"
//               checked={prefs[key]}
//               onChange={() => toggle(key)}
//               aria-label={title}
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// /* ---------------- Preferences ---------------- */
// function PreferencesTab() {
//   const [theme, setTheme] = useState(
//     () => localStorage.getItem("meridian-theme") || "meridian-dark",
//   );
//   const [themeOpen, setThemeOpen] = useState(false);
//   const themeRef = useRef(null);
//   const [language, setLanguage] = useState("en");
//   const [timezone, setTimezone] = useState("Asia/Kolkata");

//   // Apply the selected theme to the document root and persist it,
//   // mirroring the behaviour of the ThemeSelector component.
//   useEffect(() => {
//     document.documentElement.setAttribute("data-theme", theme);
//     localStorage.setItem("meridian-theme", theme);
//   }, [theme]);

//   // Close the theme dropdown when clicking outside
//   useEffect(() => {
//     if (!themeOpen) return;
//     const handleClick = (e) => {
//       if (themeRef.current && !themeRef.current.contains(e.target))
//         setThemeOpen(false);
//     };
//     const handleEsc = (e) => e.key === "Escape" && setThemeOpen(false);
//     document.addEventListener("mousedown", handleClick);
//     document.addEventListener("keydown", handleEsc);
//     return () => {
//       document.removeEventListener("mousedown", handleClick);
//       document.removeEventListener("keydown", handleEsc);
//     };
//   }, [themeOpen]);

//   return (
//     <div className="rounded-2xl border border-base-300 bg-base-100 p-6">
//       <h3 className="font-semibold text-sm mb-1">Display & region</h3>
//       <p className="text-xs text-base-content/50 mb-5">
//         These preferences only affect how the platform looks for you.
//       </p>

//       <div className="space-y-5">
//         <div className="form-control">
//           <label className="label pb-1" htmlFor="pref-theme">
//             <span className="label-text text-xs font-semibold">Theme</span>
//           </label>
//           <div ref={themeRef} className="relative">
//             <button
//               id="pref-theme"
//               type="button"
//               onClick={() => setThemeOpen((v) => !v)}
//               className="btn btn-sm btn-outline w-full justify-between normal-case"
//               aria-expanded={themeOpen}
//             >
//               <span className="flex items-center gap-2">
//                 {theme === "light" || theme === "meridian-light" ? (
//                   <Sun size={14} />
//                 ) : (
//                   <Moon size={14} />
//                 )}
//                 {theme.replace("meridian-", "")}
//               </span>
//               <ChevronDown size={14} className="shrink-0" />
//             </button>

//             {themeOpen && (
//               <ul className="absolute right-0 left-0 top-full mt-2 max-h-60 overflow-y-auto rounded-xl border border-base-300 bg-base-100 shadow-dropdown p-1 z-50">
//                 {AVAILABLE_THEMES.map((t) => (
//                   <li key={t}>
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setTheme(t);
//                         setThemeOpen(false);
//                       }}
//                       className={`flex items-center justify-between w-full text-xs font-medium py-2 px-3 rounded-lg transition-colors ${
//                         theme === t
//                           ? "bg-primary/10 text-primary font-semibold"
//                           : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
//                       }`}
//                     >
//                       <span className="capitalize">
//                         {t.replace("meridian-", "")}
//                       </span>
//                       {theme === t && <Check size={13} className="text-primary" />}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         </div>

//         <div className="form-control max-w-xs">
//           <label className="label pb-1" htmlFor="pref-language">
//             <span className="label-text text-xs font-semibold">Language</span>
//           </label>
//           <select
//             id="pref-language"
//             className="select select-bordered select-sm rounded-lg"
//             value={language}
//             onChange={(e) => setLanguage(e.target.value)}
//           >
//             <option value="en">English</option>
//             <option value="ta">Tamil</option>
//             <option value="hi">Hindi</option>
//           </select>
//         </div>

//         <div className="form-control max-w-xs">
//           <label className="label pb-1" htmlFor="pref-timezone">
//             <span className="label-text text-xs font-semibold">Timezone</span>
//           </label>
//           <select
//             id="pref-timezone"
//             className="select select-bordered select-sm rounded-lg"
//             value={timezone}
//             onChange={(e) => setTimezone(e.target.value)}
//           >
//             <option value="Asia/Kolkata">India Standard Time (IST)</option>
//             <option value="America/New_York">Eastern Time (ET)</option>
//             <option value="Europe/London">Greenwich Mean Time (GMT)</option>
//           </select>
//         </div>
//       </div>
//     </div>
//   );
// }

/*=========================================*/

import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Smartphone,
  Bell,
  Mail,
  Globe,
  LogOut,
  Check,
} from "lucide-react";
import {
  THEMES,
  THEME_LABELS,
  ThemeSwatch,
} from "../../../config/Themeconfig.jsx";

const TABS = [
  { key: "security", label: "Security", icon: ShieldCheck },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "preferences", label: "Preferences", icon: Globe },
];

// Placeholder — replace with real active-session data from your API.
const MOCK_SESSIONS = [
  {
    id: 1,
    device: "Chrome on macOS",
    location: "Salem, Tamil Nadu",
    current: true,
    lastActive: "Active now",
  },
  {
    id: 2,
    device: "Safari on iPhone",
    location: "Salem, Tamil Nadu",
    current: false,
    lastActive: "2 days ago",
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("security");

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <SettingsIcon size={20} className="text-primary" />
          Account Settings
        </h1>
        <p className="text-sm text-base-content/50 mt-1">
          Manage security, notifications, and how the platform looks for you.
        </p>
      </div>

      {/* Tabs */}
      <div role="tablist" className="tabs tabs-boxed bg-base-200 w-fit mb-6">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            role="tab"
            className={`tab gap-1.5 ${activeTab === key ? "tab-active" : ""}`}
            onClick={() => setActiveTab(key)}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "security" && <SecurityTab />}
      {activeTab === "notifications" && <NotificationsTab />}
      {activeTab === "preferences" && <PreferencesTab />}
    </div>
  );
}

/* ---------------- Security ---------------- */
function SecurityTab() {
  const [twoFactor, setTwoFactor] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle2FA = () => {
    // TODO: wire to your real thunk, e.g. dispatch(setTwoFactor(!twoFactor))
    setTwoFactor((v) => !v);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary shrink-0">
              <Smartphone size={16} />
            </span>
            <div>
              <h3 className="font-semibold text-sm">
                Two-factor authentication
              </h3>
              <p className="text-xs text-base-content/50 mt-0.5 max-w-md">
                Add an extra layer of security by requiring a verification code
                in addition to your password when signing in.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="text-xs text-success flex items-center gap-1">
                <Check size={13} /> Saved
              </span>
            )}
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={twoFactor}
              onChange={handleToggle2FA}
              aria-label="Toggle two-factor authentication"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-base-300 bg-base-100 p-6">
        <h3 className="font-semibold text-sm mb-1">Active sessions</h3>
        <p className="text-xs text-base-content/50 mb-4">
          Devices currently signed in to your account.
        </p>

        <div className="space-y-2">
          {MOCK_SESSIONS.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-base-200 px-4 py-3"
            >
              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  {s.device}
                  {s.current && (
                    <span className="badge badge-success badge-outline badge-xs">
                      This device
                    </span>
                  )}
                </div>
                <div className="text-xs text-base-content/40 mt-0.5">
                  {s.location} · {s.lastActive}
                </div>
              </div>
              {!s.current && (
                <button className="btn btn-ghost btn-xs text-error gap-1">
                  <LogOut size={12} />
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Notifications ---------------- */
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    emailApplications: true,
    emailRepayments: true,
    emailReports: false,
    smsAlerts: true,
  });

  const toggle = (key) => {
    // TODO: wire to your real thunk, e.g. dispatch(updateNotificationPrefs({...}))
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  const rows = [
    {
      key: "emailApplications",
      icon: Mail,
      title: "New loan applications",
      desc: "Get an email whenever a new application is submitted.",
    },
    {
      key: "emailRepayments",
      icon: Mail,
      title: "Repayment reminders",
      desc: "Email alerts for upcoming and overdue repayments.",
    },
    {
      key: "emailReports",
      icon: Mail,
      title: "Weekly portfolio report",
      desc: "A summary of portfolio performance every Monday.",
    },
    {
      key: "smsAlerts",
      icon: Bell,
      title: "SMS alerts",
      desc: "Critical alerts (fraud flags, failed payments) via SMS.",
    },
  ];

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-6">
      <h3 className="font-semibold text-sm mb-1">Notification preferences</h3>
      <p className="text-xs text-base-content/50 mb-5">
        Choose what you want to be notified about, and how.
      </p>

      <div className="divide-y divide-base-200">
        {rows.map(({ key, icon: Icon, title, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
          >
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-base-200 text-base-content/50 shrink-0">
                <Icon size={15} />
              </span>
              <div>
                <div className="text-sm font-medium">{title}</div>
                <div className="text-xs text-base-content/50 mt-0.5 max-w-sm">
                  {desc}
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary shrink-0"
              checked={prefs[key]}
              onChange={() => toggle(key)}
              aria-label={title}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Preferences ---------------- */
function PreferencesTab() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("meridian-theme") || "meridian-dark",
  );
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  // Apply the selected theme to the document root and persist it,
  // mirroring the behaviour of the ThemeSelector component.
  const handleSelectTheme = (t) => {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("meridian-theme", t);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6">
        <h3 className="font-semibold text-sm mb-1">Theme</h3>
        <p className="text-xs text-base-content/50 mb-4">
          Every available theme, shown with its actual color palette — pick
          whichever fits.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-96 overflow-y-auto p-1 -m-1">
          {THEMES.map((t) => {
            const isActive = theme === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => handleSelectTheme(t)}
                className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  isActive
                    ? "border-primary bg-primary/10"
                    : "border-base-300 hover:bg-base-200"
                }`}
              >
                <ThemeSwatch theme={t} size="w-6 h-6" />
                <span
                  className={`flex-1 text-xs font-medium truncate ${
                    isActive ? "text-primary" : "text-base-content/80"
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
        </div>
      </div>

      <div className="rounded-2xl border border-base-300 bg-base-100 p-6">
        <h3 className="font-semibold text-sm mb-1">Region</h3>
        <p className="text-xs text-base-content/50 mb-4">
          Language and timezone for this account.
        </p>

        <div className="flex flex-wrap gap-4">
          <div className="form-control max-w-xs">
            <label className="label pb-1" htmlFor="pref-language">
              <span className="label-text text-xs font-semibold">Language</span>
            </label>
            <select
              id="pref-language"
              className="select select-bordered select-sm rounded-lg"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="ta">Tamil</option>
              <option value="hi">Hindi</option>
            </select>
          </div>

          <div className="form-control max-w-xs">
            <label className="label pb-1" htmlFor="pref-timezone">
              <span className="label-text text-xs font-semibold">Timezone</span>
            </label>
            <select
              id="pref-timezone"
              className="select select-bordered select-sm rounded-lg"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              <option value="Asia/Kolkata">India Standard Time (IST)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="Europe/London">Greenwich Mean Time (GMT)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
