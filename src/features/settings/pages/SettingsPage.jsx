import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Palette,
  ShieldCheck,
  Bell,
  Sliders,
  Database,
  Search,
} from "lucide-react";
import PreferencesTab from "../components/PreferencesTab.jsx";
import SecurityTab from "../components/SecurityTab.jsx";
import NotificationsTab from "../components/NotificationsTab.jsx";
import SystemDefaultsTab from "../components/SystemDefaultsTab.jsx";
import DataBackupTab from "../components/DataBackupTab.jsx";

const TABS = [
  {
    key: "preferences",
    label: "Appearance & Display",
    icon: Palette,
    badge: null,
    desc: "Theme, fonts, regional formats & density",
  },
  {
    key: "security",
    label: "Security & Access",
    icon: ShieldCheck,
    badge: null,
    desc: "2FA, passwords & active sessions",
  },
  // {
  //   key: "notifications",
  //   label: "Notifications & Alerts",
  //   icon: Bell,
  //   badge: null,
  //   desc: "Email, SMS, in-app & DND schedules",
  // },
  // {
  //   key: "system",
  //   label: "System & Loan Defaults",
  //   icon: Sliders,
  //   badge: null,
  //   desc: "Interest calculation, grace periods & enterprise links",
  // },
  // {
  //   key: "data",
  //   label: "Backup & Storage",
  //   icon: Database,
  //   badge: null,
  //   desc: "Export configuration, cache cleaner & reset",
  // },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("preferences");
  const [tabSearch, setTabSearch] = useState("");

  const filteredTabs = TABS.filter(
    (t) =>
      t.label.toLowerCase().includes(tabSearch.toLowerCase()) ||
      t.desc.toLowerCase().includes(tabSearch.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap pb-2 border-b border-base-300">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5 text-base-content">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <SettingsIcon size={22} />
            </span>
            System Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1">
            Manage your interface theme, typography, authentication security, notification rules, and default loan parameters.
          </p>
        </div>

        {/* Quick Tab Search Filter */}
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
          />
          <input
            type="text"
            placeholder="Search settings..."
            value={tabSearch}
            onChange={(e) => setTabSearch(e.target.value)}
            className="input input-bordered input-sm pl-9 pr-3 w-48 sm:w-60 rounded-xl"
          />
        </div>
      </div>

      {/* Nav Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-base-200 custom-scrollbar">
        {filteredTabs.map(({ key, label, icon: Icon, desc }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                isActive
                  ? "bg-primary text-primary-content shadow-sm shadow-primary/20 scale-[1.02]"
                  : "bg-base-100 border border-base-300 text-base-content/70 hover:bg-base-200 hover:text-base-content"
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="animate-fade-in transition-all">
        {activeTab === "preferences" && <PreferencesTab />}
        {activeTab === "security" && <SecurityTab />}
        {activeTab === "notifications" && <NotificationsTab />}
        {activeTab === "system" && <SystemDefaultsTab />}
        {activeTab === "data" && <DataBackupTab />}
      </div>
    </div>
  );
}
