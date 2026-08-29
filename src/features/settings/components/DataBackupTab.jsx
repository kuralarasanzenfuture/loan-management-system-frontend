import React, { useState, useRef } from "react";
import {
  Database,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  Check,
  AlertTriangle,
  HardDrive,
  FileJson,
} from "lucide-react";
import { applyFont } from "./PreferencesTab.jsx";

export default function DataBackupTab() {
  const fileInputRef = useRef(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [confirmResetModal, setConfirmResetModal] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Estimate local storage usage
  const getStorageSizeKB = () => {
    let total = 0;
    for (let x in localStorage) {
      if (localStorage.hasOwnProperty(x)) {
        total += ((localStorage[x].length + x.length) * 2);
      }
    }
    return (total / 1024).toFixed(1);
  };

  // Export settings as JSON
  const handleExportSettings = () => {
    const backupData = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      theme: localStorage.getItem("meridian-theme") || "meridian-dark",
      font: localStorage.getItem("meridian-font") || "inter",
      density: localStorage.getItem("meridian-density") || "comfortable",
      language: localStorage.getItem("meridian-language") || "en",
      timezone: localStorage.getItem("meridian-timezone") || "Asia/Kolkata",
      numberFormat: localStorage.getItem("meridian-number-format") || "en-IN",
      dateFormat: localStorage.getItem("meridian-date-format") || "dd-mm-yyyy",
      notificationPrefs: localStorage.getItem("meridian-notification-prefs")
        ? JSON.parse(localStorage.getItem("meridian-notification-prefs"))
        : {},
      systemDefaults: localStorage.getItem("meridian-system-defaults")
        ? JSON.parse(localStorage.getItem("meridian-system-defaults"))
        : {},
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `loan_system_settings_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast("Settings exported and downloaded as JSON backup!");
  };

  // Import settings from JSON
  const handleImportSettings = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.theme) {
          localStorage.setItem("meridian-theme", parsed.theme);
          document.documentElement.setAttribute("data-theme", parsed.theme);
        }
        if (parsed.font) {
          localStorage.setItem("meridian-font", parsed.font);
          applyFont(parsed.font);
        }
        if (parsed.density) {
          localStorage.setItem("meridian-density", parsed.density);
          document.documentElement.setAttribute("data-density", parsed.density);
        }
        if (parsed.language) localStorage.setItem("meridian-language", parsed.language);
        if (parsed.timezone) localStorage.setItem("meridian-timezone", parsed.timezone);
        if (parsed.numberFormat) localStorage.setItem("meridian-number-format", parsed.numberFormat);
        if (parsed.dateFormat) localStorage.setItem("meridian-date-format", parsed.dateFormat);
        if (parsed.notificationPrefs) {
          localStorage.setItem("meridian-notification-prefs", JSON.stringify(parsed.notificationPrefs));
        }
        if (parsed.systemDefaults) {
          localStorage.setItem("meridian-system-defaults", JSON.stringify(parsed.systemDefaults));
        }

        showToast("Settings successfully restored from backup! Refreshing page...");
        setTimeout(() => window.location.reload(), 1200);
      } catch (err) {
        showToast("Error: Invalid settings backup file format.");
      }
    };
    reader.readAsText(file);
  };

  // Clear local storage cache
  const handleClearCache = () => {
    setClearingCache(true);
    setTimeout(() => {
      // Keep auth token if present
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      const user = localStorage.getItem("user");
      localStorage.clear();
      if (token) localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", user);

      setClearingCache(false);
      showToast("Local cache and temporary state cleared successfully!");
    }, 600);
  };

  // Reset all preferences to default
  const handleConfirmReset = () => {
    const defaults = {
      theme: "meridian-dark",
      font: "inter",
      density: "comfortable",
      language: "en",
      timezone: "Asia/Kolkata",
      numberFormat: "en-IN",
      dateFormat: "dd-mm-yyyy",
    };

    localStorage.setItem("meridian-theme", defaults.theme);
    localStorage.setItem("meridian-font", defaults.font);
    localStorage.setItem("meridian-density", defaults.density);
    localStorage.setItem("meridian-language", defaults.language);
    localStorage.setItem("meridian-timezone", defaults.timezone);
    localStorage.setItem("meridian-number-format", defaults.numberFormat);
    localStorage.setItem("meridian-date-format", defaults.dateFormat);
    localStorage.removeItem("meridian-notification-prefs");
    localStorage.removeItem("meridian-system-defaults");

    document.documentElement.setAttribute("data-theme", defaults.theme);
    document.documentElement.setAttribute("data-density", defaults.density);
    applyFont(defaults.font);

    setConfirmResetModal(false);
    showToast("Preferences reset to factory defaults! Refreshing...");
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="alert alert-success shadow-lg text-sm flex items-center justify-between py-2.5 px-4 rounded-xl sticky top-20 z-30 transition-all">
          <div className="flex items-center gap-2">
            <Check size={16} />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 1. Export & Import Configuration */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <h3 className="font-semibold text-base flex items-center gap-2 text-base-content mb-1">
          <Database size={18} className="text-primary" />
          Settings Backup & Migration
        </h3>
        <p className="text-xs text-base-content/60 mb-5">
          Export your UI preferences, theme styles, and calculation rules to transfer between browsers or workstations.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-base-300 bg-base-200/40 flex flex-col justify-between">
            <div className="flex items-start gap-3 mb-4">
              <span className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <Download size={18} />
              </span>
              <div>
                <h4 className="text-sm font-semibold text-base-content">Export Configuration</h4>
                <p className="text-xs text-base-content/50 mt-0.5">
                  Save all custom themes, fonts, notification rules, and system defaults to a .json file.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleExportSettings}
              className="btn btn-primary btn-sm rounded-lg gap-2 self-start text-xs"
            >
              <Download size={14} />
              Export JSON Backup
            </button>
          </div>

          <div className="p-4 rounded-xl border border-base-300 bg-base-200/40 flex flex-col justify-between">
            <div className="flex items-start gap-3 mb-4">
              <span className="p-2 rounded-lg bg-info/10 text-info shrink-0">
                <Upload size={18} />
              </span>
              <div>
                <h4 className="text-sm font-semibold text-base-content">Restore from Backup</h4>
                <p className="text-xs text-base-content/50 mt-0.5">
                  Upload a previously exported .json file to restore your full configuration instantly.
                </p>
              </div>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportSettings}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-outline btn-sm rounded-lg gap-2 text-xs"
              >
                <Upload size={14} />
                Select File & Restore
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Offline Storage & Cache Maintenance */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <h3 className="font-semibold text-base flex items-center gap-2 text-base-content mb-1">
          <HardDrive size={18} className="text-primary" />
          Client Cache & Storage Health
        </h3>
        <p className="text-xs text-base-content/60 mb-5">
          Manage local storage data, cached filter queries, and temporary form drafts.
        </p>

        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-base-200/40 border border-base-200 flex-wrap">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-lg bg-base-200 text-base-content/70 shrink-0">
              <FileJson size={18} />
            </span>
            <div>
              <div className="text-sm font-semibold text-base-content">
                Local Storage Allocation
              </div>
              <div className="text-xs text-base-content/50 mt-0.5">
                Currently utilizing <span className="font-mono font-bold text-primary">{getStorageSizeKB()} KB</span> of browser storage.
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={clearingCache}
            onClick={handleClearCache}
            className="btn btn-ghost btn-sm text-warning hover:bg-warning/10 rounded-lg gap-1.5 text-xs"
          >
            <Trash2 size={14} />
            {clearingCache ? "Clearing..." : "Clear Local Cache"}
          </button>
        </div>
      </div>

      {/* 3. Danger Zone: Factory Reset */}
      <div className="rounded-2xl border border-error/30 bg-error/5 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-lg bg-error/15 text-error shrink-0">
              <AlertTriangle size={18} />
            </span>
            <div>
              <h4 className="text-sm font-bold text-error">
                Reset All Settings to Factory Default
              </h4>
              <p className="text-xs text-base-content/60 mt-1 max-w-md">
                This will reset your selected color theme, typography font, date format, and custom system rules back to initial platform defaults.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setConfirmResetModal(true)}
            className="btn btn-error btn-sm rounded-lg gap-2 text-xs"
          >
            <RotateCcw size={14} />
            Reset All Preferences
          </button>
        </div>
      </div>

      {/* Confirm Reset Modal */}
      {confirmResetModal && (
        <div className="modal modal-open">
          <div className="modal-box rounded-2xl max-w-sm border border-base-300 bg-base-100 p-6">
            <div className="flex items-center gap-3 text-error mb-2">
              <AlertTriangle size={24} />
              <h3 className="font-bold text-base">Reset All Preferences?</h3>
            </div>
            <p className="text-xs text-base-content/70">
              Are you sure you want to reset all themes, typography, notification preferences, and system defaults?
            </p>

            <div className="modal-action flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setConfirmResetModal(false)}
                className="btn btn-sm btn-ghost rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="btn btn-sm btn-error rounded-lg"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
