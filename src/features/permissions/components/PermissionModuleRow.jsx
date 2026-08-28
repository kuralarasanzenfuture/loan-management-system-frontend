import React, { useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Shield,
  Sparkles,
  Ban,
  Lock,
} from "lucide-react";
import {
  collectActionIds,
  getModuleCheckState,
} from "../utils/permissionHelpers.js";

/**
 * PermissionModuleRow
 * Props:
 * - module (object)          : { id, name, code, actions: [], children: [] }
 * - allowedIds (Set)         : Currently allowed action IDs
 * - roleAllowedIds (Set)     : (Optional) Action IDs granted by the user's role
 * - roleName (string)        : (Optional) Name of the user's role (e.g. 'Manager')
 * - onToggleAction (fn)      : (actionId, checked) => void
 * - onToggleModule (fn)      : (module, checked) => void
 * - depth (number)
 * - defaultOpen (bool)
 * - readOnly (bool)          : If true, checkboxes are disabled (e.g. for Admin users)
 */
export default function PermissionModuleRow({
  module,
  allowedIds,
  roleAllowedIds,
  roleName,
  onToggleAction,
  onToggleModule,
  depth = 0,
  defaultOpen = true,
  readOnly = false,
}) {
  const [open, setOpen] = useState(defaultOpen);

  // Sync open state when defaultOpen changes (e.g. on Expand All / Collapse All)
  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  const hasChildren = Boolean(module.children && module.children.length > 0);
  const hasActions = Boolean(module.actions && module.actions.length > 0);
  const canExpand = hasChildren || hasActions;

  const checkState = getModuleCheckState(module, allowedIds);

  const checkboxRef = useRef(null);
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = checkState === "some";
    }
  }, [checkState]);

  const actionCount = module.actions?.length || 0;
  const allowedCount = (module.actions || []).filter((a) => allowedIds.has(a.id)).length;

  return (
    <div className="border-b border-base-200/60 last:border-b-0 py-1 transition-all">
      {/* Module Header Bar */}
      <div
        className={`flex items-center gap-2 py-2 hover:bg-base-200/60 rounded-xl px-2.5 transition-colors select-none ${
          open && canExpand ? "bg-base-200/30" : ""
        }`}
        style={{ paddingLeft: `${depth * 22 + 10}px` }}
      >
        {/* Expand / Collapse Dropdown Button for ANY module with children OR actions */}
        {canExpand ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="btn btn-ghost btn-xs btn-square shrink-0 text-base-content/70 hover:bg-base-300/70 rounded-lg"
            title={open ? "Collapse" : "Expand"}
          >
            {open ? (
              <ChevronDown size={16} className="text-primary font-bold transition-transform" />
            ) : (
              <ChevronRight size={16} className="transition-transform" />
            )}
          </button>
        ) : (
          <span className="w-6 shrink-0" />
        )}

        {/* Module-level select-all checkbox */}
        <input
          ref={checkboxRef}
          type="checkbox"
          checked={checkState === "all"}
          disabled={readOnly}
          onChange={(e) => onToggleModule(module, e.target.checked)}
          className={`checkbox checkbox-sm checkbox-primary rounded-md shrink-0 ${
            readOnly ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
          }`}
          title={readOnly ? "Admin permissions cannot be modified" : "Toggle all permissions in this module"}
        />

        {/* Module Title & Code (Clickable to toggle expand/collapse) */}
        <div
          className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer group"
          onClick={() => canExpand && setOpen((v) => !v)}
        >
          {open && canExpand ? (
            <FolderOpen size={16} className="text-primary shrink-0" />
          ) : (
            <Folder size={16} className="text-primary/70 shrink-0 group-hover:text-primary transition-colors" />
          )}

          <span className="text-sm font-bold text-base-content/90 group-hover:text-base-content truncate">
            {module.name}
          </span>

          <span className="text-[10px] text-base-content/40 font-mono bg-base-200/80 px-1.5 py-0.5 rounded">
            {module.code}
          </span>
        </div>

        {/* Counter Badge */}
        {hasActions && (
          <div
            className="flex items-center gap-2 ml-auto shrink-0 cursor-pointer"
            onClick={() => canExpand && setOpen((v) => !v)}
          >
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition-colors ${
                allowedCount > 0
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-base-200/80 border-base-300/60 text-base-content/50"
              }`}
            >
              {allowedCount}/{actionCount} allowed
            </span>
          </div>
        )}
      </div>

      {/* Expanded Content (Actions and/or Submodules) */}
      {open && canExpand && (
        <div className="mt-1 mb-2 animate-fadeIn">
          {/* Actions Grid for this module */}
          {hasActions && (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 py-2"
              style={{ paddingLeft: `${depth * 22 + 42}px`, paddingRight: "10px" }}
            >
              {module.actions.map((action) => {
                const checked = allowedIds.has(action.id);
                const hasRoleGrant = roleAllowedIds
                  ? roleAllowedIds.has(action.id)
                  : false;

                // Determine classification tag and styling
                let cardStyle = "border-base-300 bg-base-100/80 text-base-content/70 hover:bg-base-200/60";
                let badge = null;

                if (roleAllowedIds) {
                  if (checked && hasRoleGrant) {
                    // Inherited from Role
                    cardStyle =
                      "border-indigo-300/90 bg-indigo-50/80 text-indigo-950 shadow-sm shadow-indigo-500/5 dark:bg-indigo-950/30 dark:border-indigo-800 dark:text-indigo-200 font-medium";
                    badge = (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-100/90 text-indigo-800 dark:bg-indigo-900/70 dark:text-indigo-300 px-1.5 py-0.5 rounded-md ml-auto shrink-0 border border-indigo-200 dark:border-indigo-800">
                        <Shield size={10} />
                        {roleName || "Role"}
                      </span>
                    );
                  } else if (checked && !hasRoleGrant) {
                    // Custom User Override (Added Grant)
                    cardStyle =
                      "border-emerald-400 bg-emerald-50/90 text-emerald-950 shadow-sm shadow-emerald-500/10 ring-1 ring-emerald-400/50 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-200 font-bold";
                    badge = (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-900/80 dark:text-emerald-200 px-1.5 py-0.5 rounded-md ml-auto shrink-0 border border-emerald-300 dark:border-emerald-700">
                        <Sparkles size={10} />
                        Override
                      </span>
                    );
                  } else if (!checked && hasRoleGrant) {
                    // Revoked Override (Role had it, but user revoked it)
                    cardStyle =
                      "border-rose-300/80 bg-rose-50/70 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300 opacity-80";
                    badge = (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/70 dark:text-rose-300 px-1.5 py-0.5 rounded-md ml-auto shrink-0 border border-rose-200 dark:border-rose-800">
                        <Ban size={10} />
                        Revoked
                      </span>
                    );
                  } else {
                    // Not granted
                    cardStyle = "border-base-300/80 bg-base-100/50 text-base-content/50 hover:bg-base-200/50";
                  }
                } else {
                  // Standard Role matrix mode
                  if (checked) {
                    cardStyle = "border-primary/40 bg-primary/5 text-primary font-semibold shadow-sm";
                  }
                }

                if (readOnly) {
                  cardStyle += " cursor-not-allowed opacity-90";
                } else {
                  cardStyle += " cursor-pointer";
                }

                return (
                  <label
                    key={action.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-all duration-150 ${cardStyle}`}
                    title={
                      readOnly
                        ? "Admin permissions are permanent and cannot be modified"
                        : action.name
                    }
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={readOnly}
                      onChange={(e) =>
                        onToggleAction(action.id, e.target.checked)
                      }
                      className={`checkbox checkbox-xs rounded-md ${
                        checked ? "checkbox-primary" : "checkbox-ghost"
                      } ${readOnly ? "cursor-not-allowed" : "cursor-pointer"}`}
                    />

                    <span className="font-medium truncate flex-1 min-w-0">
                      {action.name}
                    </span>

                    {readOnly && (
                      <Lock size={11} className="text-amber-500/80 shrink-0 ml-auto" />
                    )}

                    {!readOnly && badge}
                  </label>
                );
              })}
            </div>
          )}

          {/* Child Submodules (Recursive) */}
          {hasChildren &&
            module.children.map((child) => (
              <PermissionModuleRow
                key={child.id}
                module={child}
                allowedIds={allowedIds}
                roleAllowedIds={roleAllowedIds}
                roleName={roleName}
                onToggleAction={onToggleAction}
                onToggleModule={onToggleModule}
                depth={depth + 1}
                defaultOpen={defaultOpen}
                readOnly={readOnly}
              />
            ))}
        </div>
      )}
    </div>
  );
}
