import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  Shield,
  Crown,
  Info,
  CheckCircle2,
  AlertCircle,
  Users,
  ArrowLeft,
} from "lucide-react";
import { fetchModulesActionsTree } from "../../../redux/modulesActions/modulesActionsSlice.js";
import { fetchRoles } from "../../../redux/roles/roleSlice.js";
import {
  fetchRolePermissions,
  saveRolePermissions,
  clearRolePermissionError,
} from "../../../redux/rolePermissions/rolePermissionSlice.js";
import PermissionMatrix from "../components/PermissionMatrix.jsx";
import {
  buildAllowedSet,
  diffPermissions,
  collectActionIds,
  getTreeStats,
} from "../utils/permissionHelpers.js";

export default function RolePermissionsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { roleId: paramRoleId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const { tree = [], treeLoading } = useSelector(
    (state) => state.modulesActions || {}
  );
  const { roles = [], loading: rolesLoading } = useSelector(
    (state) => state.roles || {}
  );
  const {
    permissions: rolePermissions = [],
    loading: permLoading,
    saving,
    error,
    saveError,
    saveSuccess,
  } = useSelector((state) => state.rolePermissions || {});

  const activeRoleId = useMemo(() => {
    return (
      paramRoleId ||
      searchParams.get("roleId") ||
      location.state?.roleId ||
      ""
    );
  }, [paramRoleId, searchParams, location.state]);

  const [selectedRoleId, setSelectedRoleId] = useState(activeRoleId);
  const [allowedIds, setAllowedIds] = useState(new Set());
  const [originalAllowedIds, setOriginalAllowedIds] = useState(new Set());

  // Load initial modules tree and roles
  useEffect(() => {
    dispatch(fetchModulesActionsTree());
    dispatch(fetchRoles());
  }, [dispatch]);

  // Sync if incoming URL parameter changes
  useEffect(() => {
    if (activeRoleId !== selectedRoleId) {
      setSelectedRoleId(activeRoleId);
    }
  }, [activeRoleId]);

  const selectedRole = useMemo(
    () => roles.find((r) => String(r.id) === String(selectedRoleId)),
    [roles, selectedRoleId]
  );

  // Check if selected role is an Admin or protected system role
  const isAdminRole = useMemo(() => {
    if (!selectedRole) return false;
    const name = (selectedRole.name || "").trim().toUpperCase();
    return name === "ADMIN" || name === "ADMINISTRATOR" || Boolean(selectedRole.is_system);
  }, [selectedRole]);

  // When selectedRoleId changes, fetch role permissions
  useEffect(() => {
    if (selectedRoleId) {
      dispatch(clearRolePermissionError());
      dispatch(fetchRolePermissions(selectedRoleId));
    }
  }, [dispatch, selectedRoleId]);

  // Update allowedIds when rolePermissions or isAdminRole changes
  useEffect(() => {
    if (isAdminRole) {
      // Admin has all permissions active
      let allIds = [];
      tree.forEach((m) => (allIds = allIds.concat(collectActionIds(m))));
      const fullSet = new Set(allIds);
      setAllowedIds(fullSet);
      setOriginalAllowedIds(fullSet);
    } else {
      const set = buildAllowedSet(rolePermissions);
      setAllowedIds(set);
      setOriginalAllowedIds(set);
    }
  }, [rolePermissions, isAdminRole, tree]);

  const allActionIds = useMemo(() => {
    let ids = [];
    tree.forEach((m) => (ids = ids.concat(collectActionIds(m))));
    return ids;
  }, [tree]);

  const hasChanges = useMemo(() => {
    if (isAdminRole) return false;
    return (
      diffPermissions(originalAllowedIds, allowedIds, allActionIds).length > 0
    );
  }, [originalAllowedIds, allowedIds, allActionIds, isAdminRole]);

  const stats = useMemo(() => {
    return getTreeStats(tree, allowedIds);
  }, [tree, allowedIds]);

  const handleRoleSelectChange = (newId) => {
    setSelectedRoleId(newId);
    if (newId) {
      navigate(`/role-permissions/${newId}`);
    } else {
      navigate("/role-permissions");
    }
  };

  const handleSave = async () => {
    if (isAdminRole) return;

    const changes = diffPermissions(
      originalAllowedIds,
      allowedIds,
      allActionIds
    );
    if (changes.length === 0) return;

    // Backend Joi schema expects: { role_id: number, permissions: [{ action_id, is_allowed }] }
    const action = await dispatch(
      saveRolePermissions({
        role_id: Number(selectedRoleId),
        permissions: changes,
      })
    );

    if (saveRolePermissions.fulfilled.match(action)) {
      setOriginalAllowedIds(new Set(allowedIds));
    }
  };

  const handleReset = () => {
    setAllowedIds(new Set(originalAllowedIds));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              type="button"
              onClick={() => navigate("/roles")}
              className="btn btn-ghost btn-xs gap-1 text-base-content/60 hover:text-primary pl-0"
              title="Back to Roles list"
            >
              <ArrowLeft size={14} /> Back to Roles
            </button>
          </div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-base-content">
            <ShieldCheck size={22} className="text-primary" />
            Role Permissions
          </h1>
          <p className="text-sm text-base-content/60 mt-0.5">
            Configure default access control and allowed actions for each user role across the platform.
          </p>
        </div>
      </div>

      {/* Role Selection Card */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <label className="label py-0 pb-1.5">
              <span className="label-text text-xs font-bold uppercase tracking-wider text-base-content/60">
                Select Role
              </span>
            </label>
            <select
              value={selectedRoleId}
              onChange={(e) => handleRoleSelectChange(e.target.value)}
              className="select select-bordered select-sm rounded-xl w-full font-medium"
            >
              <option value="" disabled>
                Choose a role to configure permissions…
              </option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Role Details Banner */}
          {selectedRole && (
            <div className="flex items-center gap-3.5 bg-base-200/50 rounded-2xl p-3.5 border border-base-200 flex-1 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                  isAdminRole
                    ? "bg-amber-500 text-white"
                    : "bg-primary/15 text-primary"
                }`}
              >
                {isAdminRole ? <Crown size={20} /> : <Shield size={20} />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-base-content truncate">
                    {selectedRole.name}
                  </span>
                  <span
                    className={`badge badge-sm font-bold gap-1 ${
                      isAdminRole
                        ? "badge-warning"
                        : "badge-outline badge-primary"
                    }`}
                  >
                    <Shield size={11} />
                    {isAdminRole ? "System Role" : "Custom Role"}
                  </span>
                  {selectedRole.status && (
                    <span
                      className={`badge badge-xs ${
                        selectedRole.status === "active"
                          ? "badge-success"
                          : "badge-ghost"
                      }`}
                    >
                      {selectedRole.status}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-base-content/50 truncate mt-0.5">
                  {selectedRole.description || `Role ID: #${selectedRole.id}`}
                </p>
              </div>

              {/* Counter Badge */}
              <div className="hidden lg:flex items-center gap-2 shrink-0">
                <div className="text-center px-3 py-1 bg-base-100 rounded-xl border border-base-300/80">
                  <div className="text-[10px] text-base-content/40 font-semibold uppercase">
                    Permissions
                  </div>
                  <div className="text-xs font-bold text-primary">
                    {stats.checked} / {stats.total}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Protection Banner */}
      {selectedRole && isAdminRole && (
        <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4.5 text-amber-950 dark:text-amber-200 flex items-start gap-3.5 shadow-sm">
          <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5 shadow-sm">
            <Crown size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100 flex items-center gap-1.5">
              Administrator Role (System Protected)
            </h4>
            <p className="text-xs mt-1 text-amber-800/90 dark:text-amber-200/80 leading-relaxed">
              The <strong>{selectedRole.name}</strong> role is a core system role with permanent, full access across all platform modules. Modifying permissions for this role is restricted by system policy.
            </p>
          </div>
        </div>
      )}

      {/* Role Policy Info Banner */}
      {selectedRole && !isAdminRole && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-base-content/80 flex items-start gap-3">
          <Info size={16} className="text-primary shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            Configuring permissions for <strong>{selectedRole.name}</strong>. All users assigned to this role will inherit these permissions by default. You can also grant user-specific overrides on the User Permissions page.
          </div>
        </div>
      )}

      {/* Error and Success Alerts */}
      {(error || saveError) && (
        <div className="alert alert-error text-sm py-2.5 rounded-2xl shadow-sm">
          <AlertCircle size={16} />
          <span>
            {typeof (error || saveError) === "string"
              ? error || saveError
              : "Failed to update role permissions."}
          </span>
        </div>
      )}

      {saveSuccess && (
        <div className="alert alert-success text-sm py-2.5 rounded-2xl shadow-sm text-white font-medium">
          <CheckCircle2 size={16} />
          <span>Role permissions saved successfully!</span>
        </div>
      )}

      {/* Main Permission Matrix */}
      {selectedRoleId ? (
        <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden shadow-sm">
          <PermissionMatrix
            tree={tree}
            allowedIds={allowedIds}
            onChange={setAllowedIds}
            onSave={handleSave}
            onReset={handleReset}
            saving={saving}
            hasChanges={hasChanges}
            loading={treeLoading || permLoading}
            readOnly={isAdminRole}
            readOnlyMessage="Administrator role permissions are permanent and cannot be modified."
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-base-300 bg-base-100 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center text-base-content/40">
            <ShieldCheck size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-base-content/80">
              No Role Selected
            </p>
            <p className="text-xs text-base-content/50 mt-1 max-w-sm">
              Please select a role from the dropdown above to view and configure its system access permissions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
