import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronsDown,
  ChevronsUp,
  CheckSquare,
  Square,
  Loader2,
  Save,
  RotateCcw,
  Shield,
  Sparkles,
  Ban,
  Lock,
  Undo,
} from "lucide-react";
import PermissionModuleRow from "./PermissionModuleRow.jsx";
import {
  collectActionIds,
  getTreeStats,
  getUserPermissionStats,
} from "../utils/permissionHelpers.js";

/**
 * PermissionMatrix
 * Reusable permission-editing UI for both roles and user-level overrides.
 *
 * Props:
 * - tree (array)              : module tree from fetchModulesActionsTree
 * - allowedIds (Set)          : current checked action IDs (controlled)
 * - roleAllowedIds (Set)      : (Optional) Action IDs granted by role
 * - roleName (string)         : (Optional) Role name for visual badge
 * - onChange (fn)             : (newAllowedIds: Set) => void
 * - onSave (fn)               : () => void
 * - onReset (fn)              : () => void — discard unsaved changes
 * - onResetToRole (fn)        : () => void — reset overrides to role defaults
 * - saving (bool)
 * - hasChanges (bool)
 * - loading (bool)
 * - readOnly (bool)           : If true, editing is disabled (e.g. Admin users)
 * - readOnlyMessage (string)  : Message to show when in read-only mode
 */
export default function PermissionMatrix({
  tree,
  allowedIds,
  roleAllowedIds,
  roleName,
  onChange,
  onSave,
  onReset,
  onResetToRole,
  saving,
  hasChanges,
  loading,
  readOnly = false,
  readOnlyMessage,
}) {
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // 'all' | 'granted' | 'overrides' | 'revoked'
  const [allOpen, setAllOpen] = useState(true);
  const [renderKey, setRenderKey] = useState(0);

  const allActionIds = useMemo(() => {
    let ids = [];
    tree.forEach((m) => (ids = ids.concat(collectActionIds(m))));
    return ids;
  }, [tree]);

  const stats = useMemo(() => {
    if (roleAllowedIds) {
      return getUserPermissionStats(tree, allowedIds, roleAllowedIds);
    }
    return getTreeStats(tree, allowedIds);
  }, [tree, allowedIds, roleAllowedIds]);

  const filteredTree = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filterModule = (module) => {
      const matchedActions = (module.actions || []).filter((a) => {
        // Search text filter
        const matchesSearch = !q || a.name.toLowerCase().includes(q) || (a.code && a.code.toLowerCase().includes(q));
        if (!matchesSearch) return false;

        // Classification filter tab
        if (filterMode === "all") return true;
        const isAllowed = allowedIds.has(a.id);
        const inRole = roleAllowedIds ? roleAllowedIds.has(a.id) : false;

        if (filterMode === "granted") return isAllowed;
        if (filterMode === "overrides") return isAllowed && !inRole;
        if (filterMode === "revoked") return !isAllowed && inRole;
        if (filterMode === "not_allowed") return !isAllowed;
        return true;
      });

      const filteredChildren = (module.children || [])
        .map(filterModule)
        .filter(Boolean);

      const moduleNameMatches = !q || module.name.toLowerCase().includes(q) || (module.code && module.code.toLowerCase().includes(q));

      if (matchedActions.length > 0 || filteredChildren.length > 0) {
        return {
          ...module,
          actions: matchedActions,
          children: filteredChildren,
        };
      }

      if (moduleNameMatches && filterMode === "all" && !q) {
        return module;
      }

      return null;
    };

    return tree.map(filterModule).filter(Boolean);
  }, [tree, search, filterMode, allowedIds, roleAllowedIds]);

  const handleToggleAction = (action, checked, isCtrl = false) => {
    if (readOnly) return;
    const next = new Set(allowedIds);
    const actionId = typeof action === "object" ? action.id : action;

    if (isCtrl && typeof action === "object") {
      // Ctrl+Click: bulk toggle all matching actions with same name across all modules
      const targetName = (action.name || action.action_name || "").trim().toLowerCase();
      const walk = (modules) => {
        modules.forEach((m) => {
          (m.actions || []).forEach((a) => {
            const aName = (a.name || a.action_name || "").trim().toLowerCase();
            if (aName === targetName) {
              if (checked) next.add(a.id);
              else next.delete(a.id);
            }
          });
          if (m.children?.length) walk(m.children);
        });
      };
      walk(tree);
    } else {
      if (checked) next.add(actionId);
      else next.delete(actionId);
    }
    onChange(next);
  };

  const handleToggleModule = (module, checked) => {
    if (readOnly) return;
    const ids = collectActionIds(module);
    const next = new Set(allowedIds);
    ids.forEach((id) => (checked ? next.add(id) : next.delete(id)));
    onChange(next);
  };

  const handleSelectAll = () => {
    if (readOnly) return;
    onChange(new Set(allActionIds));
  };

  const handleSelectNone = () => {
    if (readOnly) return;
    onChange(new Set());
  };

  const toggleExpandAll = () => {
    setAllOpen((v) => !v);
    setRenderKey((k) => k + 1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-base-content/40 gap-3">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-sm font-medium">Loading permissions matrix…</p>
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <p className="text-sm font-semibold text-base-content/70">
          No permission modules found
        </p>
        <p className="text-xs text-base-content/40">
          Please set up modules and actions in system configuration.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-base-100">
      {/* ReadOnly Notice (e.g. for Admin Users) */}
      {readOnly && (
        <div className="flex items-center gap-3 bg-amber-500/10 border-b border-amber-500/20 px-5 py-3 text-amber-900 dark:text-amber-200">
          <Lock size={16} className="text-amber-500 shrink-0" />
          <span className="text-xs font-semibold">
            {readOnlyMessage || "Administrator permissions are fully enabled by system policy and cannot be altered."}
          </span>
        </div>
      )}

      {/* Legend & Stats Banner (when role comparison is active) */}
      {roleAllowedIds && (
        <div className="px-5 py-3 bg-base-200/40 border-b border-base-200 flex items-center justify-between flex-wrap gap-3">
          {/* Legend Badges */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[11px] font-bold text-base-content/40 uppercase tracking-wider mr-1">
              Legend:
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-semibold dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300">
              <Shield size={12} />
              From Role ({roleName || "Role"})
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-semibold dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-200">
              <Sparkles size={12} />
              Custom User Override (+Grant)
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
              <Ban size={12} />
              Revoked Role Access
            </span>
          </div>

          {/* Quick Counter */}
          <div className="flex items-center gap-3 text-xs font-medium text-base-content/60">
            <span>
              Total Allowed: <strong className="text-base-content">{stats.allowed || stats.checked}</strong> / {stats.total}
            </span>
            {stats.overrides > 0 && (
              <span className="badge badge-success badge-sm font-bold gap-1">
                +{stats.overrides} custom
              </span>
            )}
            {stats.revoked > 0 && (
              <span className="badge badge-error badge-sm font-bold gap-1">
                -{stats.revoked} revoked
              </span>
            )}
          </div>
        </div>
      )}

      {/* Toolbar: Search, Filter Tabs, Action Buttons */}
      <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-3 border-b border-base-200 bg-base-100">
        <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
          <label className="input input-sm input-bordered flex items-center gap-2 rounded-xl bg-base-100 w-full">
            <Search size={14} className="text-base-content/40 shrink-0" />
            <input
              type="text"
              className="grow text-xs"
              placeholder="Filter modules or actions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>

        {/* Filter Tabs if role permissions are present */}
        {roleAllowedIds && (
          <div className="join bg-base-200/60 p-0.5 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`join-item btn btn-xs rounded-lg ${
                filterMode === "all"
                  ? "btn-primary shadow-sm"
                  : "btn-ghost text-base-content/60 hover:text-base-content"
              }`}
            >
              All ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("granted")}
              className={`join-item btn btn-xs rounded-lg ${
                filterMode === "granted"
                  ? "btn-primary shadow-sm"
                  : "btn-ghost text-base-content/60 hover:text-base-content"
              }`}
            >
              Allowed ({stats.allowed})
            </button>
            {stats.overrides > 0 && (
              <button
                type="button"
                onClick={() => setFilterMode("overrides")}
                className={`join-item btn btn-xs rounded-lg ${
                  filterMode === "overrides"
                    ? "btn-success text-white shadow-sm"
                    : "btn-ghost text-emerald-600 font-semibold"
                }`}
              >
                Overrides ({stats.overrides})
              </button>
            )}
            {stats.revoked > 0 && (
              <button
                type="button"
                onClick={() => setFilterMode("revoked")}
                className={`join-item btn btn-xs rounded-lg ${
                  filterMode === "revoked"
                    ? "btn-error text-white shadow-sm"
                    : "btn-ghost text-rose-600 font-semibold"
                }`}
              >
                Revoked ({stats.revoked})
              </button>
            )}
          </div>
        )}

        {/* Global Controls */}
        <div className="flex items-center gap-1.5 ml-auto">
          {!readOnly && (
            <>
              <button
                type="button"
                onClick={handleSelectAll}
                className="btn btn-ghost btn-xs rounded-lg gap-1 font-semibold text-base-content/70 hover:text-primary"
                title="Grant all actions"
              >
                <CheckSquare size={13} />
                All
              </button>
              <button
                type="button"
                onClick={handleSelectNone}
                className="btn btn-ghost btn-xs rounded-lg gap-1 font-semibold text-base-content/70 hover:text-error"
                title="Revoke all actions"
              >
                <Square size={13} />
                None
              </button>
              {onResetToRole && roleAllowedIds && (
                <button
                  type="button"
                  onClick={onResetToRole}
                  className="btn btn-ghost btn-xs rounded-lg gap-1 text-indigo-600 font-semibold hover:bg-indigo-50"
                  title="Reset to role default permissions"
                >
                  <Undo size={12} />
                  Reset to Role
                </button>
              )}
            </>
          )}
          <button
            type="button"
            onClick={toggleExpandAll}
            className="btn btn-ghost btn-xs rounded-lg gap-1 font-semibold text-base-content/70"
          >
            {allOpen ? <ChevronsUp size={13} /> : <ChevronsDown size={13} />}
            {allOpen ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      {/* Tree Content */}
      <div
        className="flex-1 overflow-y-auto px-5 py-3 space-y-1"
        style={{ maxHeight: "58vh" }}
      >
        {filteredTree.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-base-content/60">
              No matching permissions found
            </p>
            <p className="text-xs text-base-content/40 mt-1">
              Try adjusting your search query or filter tab.
            </p>
          </div>
        ) : (
          filteredTree.map((module) => (
            <PermissionModuleRow
              key={`${module.id}-${renderKey}`}
              module={module}
              allowedIds={allowedIds}
              roleAllowedIds={roleAllowedIds}
              roleName={roleName}
              onToggleAction={handleToggleAction}
              onToggleModule={handleToggleModule}
              defaultOpen={allOpen}
              readOnly={readOnly}
            />
          ))
        )}
      </div>

      {/* Save Action Footer */}
      {!readOnly && (
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-base-200 bg-base-100">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                hasChanges ? "bg-warning animate-pulse" : "bg-success"
              }`}
            />
            <span className="text-xs font-medium text-base-content/60">
              {hasChanges ? "You have unsaved permission changes." : "All permissions saved."}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReset}
              disabled={!hasChanges || saving}
              className="btn btn-ghost btn-sm rounded-xl gap-1.5 font-medium"
            >
              <RotateCcw size={14} />
              Discard
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={!hasChanges || saving}
              className="btn btn-primary btn-sm rounded-xl gap-1.5 font-bold shadow-md shadow-primary/20 px-4"
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              Save Permissions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
