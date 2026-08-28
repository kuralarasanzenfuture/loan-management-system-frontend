import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  UserCog,
  Shield,
  ShieldAlert,
  Sparkles,
  Info,
  Crown,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Search,
} from "lucide-react";
import { fetchModulesActionsTree } from "../../../redux/modulesActions/modulesActionsSlice.js";
import { fetchUsers } from "../../../redux/users/userSlice.js";
import {
  fetchUserPermissions,
  saveUserPermissions,
  clearUserPermissionError,
} from "../../../redux/userPermissions/userPermissionSlice.js";
import { fetchRolePermissions } from "../../../redux/rolePermissions/rolePermissionSlice.js";
import PermissionMatrix from "../components/PermissionMatrix.jsx";
import {
  buildAllowedSet,
  diffPermissions,
  collectActionIds,
  getUserPermissionStats,
} from "../utils/permissionHelpers.js";

function getInitials(name = "") {
  if (!name) return "U";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function UserPermissionsPage() {
  const dispatch = useDispatch();

  const { tree, treeLoading } = useSelector((state) => state.modulesActions || {});
  const { users = [], loading: usersLoading } = useSelector((state) => state.users || {});
  const {
    permissions: userPermissions = [],
    loading: permLoading,
    saving,
    error,
    saveError,
    saveSuccess,
  } = useSelector((state) => state.userPermissions || {});

  const { permissions: rolePermissions = [] } = useSelector(
    (state) => state.rolePermissions || {}
  );

  const [selectedUserId, setSelectedUserId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [allowedIds, setAllowedIds] = useState(new Set());
  const [originalAllowedIds, setOriginalAllowedIds] = useState(new Set());

  // Load initial modules tree and users
  useEffect(() => {
    dispatch(fetchModulesActionsTree());
    dispatch(fetchUsers());
  }, [dispatch]);

  const selectedUser = useMemo(
    () => users.find((u) => String(u.id) === String(selectedUserId)),
    [users, selectedUserId]
  );

  // Check if selected user is an Admin
  const isAdminUser = useMemo(() => {
    if (!selectedUser) return false;
    const role = (selectedUser.role_name || "").trim().toUpperCase();
    const uname = (selectedUser.username || "").trim().toLowerCase();
    return role === "ADMIN" || uname === "admin" || Boolean(selectedUser.is_system);
  }, [selectedUser]);

  // When a user is selected, fetch user permissions & their role's permissions
  useEffect(() => {
    if (selectedUserId) {
      dispatch(clearUserPermissionError());
      dispatch(fetchUserPermissions(selectedUserId));

      if (selectedUser?.role_id) {
        dispatch(fetchRolePermissions(selectedUser.role_id));
      }
    }
  }, [dispatch, selectedUserId, selectedUser?.role_id]);

  // Build role allowed Set
  const roleAllowedIds = useMemo(() => {
    return buildAllowedSet(rolePermissions);
  }, [rolePermissions]);

  // Update allowedIds when userPermissions or rolePermissions load
  useEffect(() => {
    if (isAdminUser) {
      // Admin has all permissions active
      let allIds = [];
      tree.forEach((m) => (allIds = allIds.concat(collectActionIds(m))));
      const fullSet = new Set(allIds);
      setAllowedIds(fullSet);
      setOriginalAllowedIds(fullSet);
    } else {
      const userSet = buildAllowedSet(userPermissions);
      setAllowedIds(userSet);
      setOriginalAllowedIds(userSet);
    }
  }, [userPermissions, isAdminUser, tree]);

  const allActionIds = useMemo(() => {
    let ids = [];
    tree.forEach((m) => (ids = ids.concat(collectActionIds(m))));
    return ids;
  }, [tree]);

  const hasChanges = useMemo(() => {
    if (isAdminUser) return false;
    return diffPermissions(originalAllowedIds, allowedIds, allActionIds).length > 0;
  }, [originalAllowedIds, allowedIds, allActionIds, isAdminUser]);

  const stats = useMemo(() => {
    return getUserPermissionStats(tree, allowedIds, roleAllowedIds);
  }, [tree, allowedIds, roleAllowedIds]);

  const handleSave = async () => {
    if (isAdminUser) return;

    const changes = diffPermissions(
      originalAllowedIds,
      allowedIds,
      allActionIds
    );
    if (changes.length === 0) return;

    // Correct payload matching Joi validation: { user_id: number, permissions: [{ action_id, is_allowed }] }
    const action = await dispatch(
      saveUserPermissions({
        user_id: Number(selectedUserId),
        permissions: changes,
      })
    );

    if (saveUserPermissions.fulfilled.match(action)) {
      setOriginalAllowedIds(new Set(allowedIds));
    }
  };

  const handleReset = () => {
    setAllowedIds(new Set(originalAllowedIds));
  };

  const handleResetToRole = () => {
    setAllowedIds(new Set(roleAllowedIds));
  };

  // Filter user list for quick search
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role_name?.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-base-content">
            <UserCog size={22} className="text-primary" />
            User Permissions
          </h1>
          <p className="text-sm text-base-content/60 mt-0.5">
            Grant or restrict specific module actions for individual users, overriding their role defaults.
          </p>
        </div>
      </div>

      {/* User Selection Card */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <label className="label py-0 pb-1.5">
              <span className="label-text text-xs font-bold uppercase tracking-wider text-base-content/60">
                Select User
              </span>
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="select select-bordered select-sm rounded-xl w-full font-medium"
            >
              <option value="" disabled>
                Choose a user to manage permissions…
              </option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} ({u.role_name || "No Role"})
                </option>
              ))}
            </select>
          </div>

          {/* Selected User Details Banner */}
          {selectedUser && (
            <div className="flex items-center gap-3.5 bg-base-200/50 rounded-2xl p-3.5 border border-base-200 flex-1 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                  isAdminUser
                    ? "bg-amber-500 text-white"
                    : "bg-primary/15 text-primary"
                }`}
              >
                {isAdminUser ? <Crown size={20} /> : getInitials(selectedUser.username)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-base-content truncate">
                    {selectedUser.username}
                  </span>
                  <span
                    className={`badge badge-sm font-bold gap-1 ${
                      isAdminUser
                        ? "badge-warning"
                        : "badge-outline badge-primary"
                    }`}
                  >
                    <Shield size={11} />
                    {selectedUser.role_name || "Custom Role"}
                  </span>
                  {selectedUser.status && (
                    <span
                      className={`badge badge-xs ${
                        selectedUser.status === "active"
                          ? "badge-success"
                          : "badge-ghost"
                      }`}
                    >
                      {selectedUser.status}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-base-content/50 truncate mt-0.5">
                  {selectedUser.email || selectedUser.mobile || "ID: #" + selectedUser.id}
                </p>
              </div>

              {/* Quick Counter Badges */}
              {!isAdminUser && (
                <div className="hidden lg:flex items-center gap-2 shrink-0">
                  <div className="text-center px-2.5 py-1 bg-base-100 rounded-xl border border-base-300/80">
                    <div className="text-[10px] text-base-content/40 font-semibold uppercase">
                      From Role
                    </div>
                    <div className="text-xs font-bold text-indigo-600">
                      {stats.inherited}
                    </div>
                  </div>
                  <div className="text-center px-2.5 py-1 bg-base-100 rounded-xl border border-base-300/80">
                    <div className="text-[10px] text-base-content/40 font-semibold uppercase">
                      Overrides
                    </div>
                    <div className="text-xs font-bold text-emerald-600">
                      +{stats.overrides}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Admin Protection Banner */}
      {selectedUser && isAdminUser && (
        <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4.5 text-amber-950 dark:text-amber-200 flex items-start gap-3.5 shadow-sm">
          <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5 shadow-sm">
            <Crown size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100 flex items-center gap-1.5">
              Administrator Account (Protected)
            </h4>
            <p className="text-xs mt-1 text-amber-800/90 dark:text-amber-200/80 leading-relaxed">
              <strong>{selectedUser.username}</strong> holds an <strong>ADMIN</strong> role. System administrators have full, unrestricted permissions across all platform modules by default. Permission overrides cannot and should not be modified for Admin accounts.
            </p>
          </div>
        </div>
      )}

      {/* Regular User Override Info Banner */}
      {selectedUser && !isAdminUser && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 dark:bg-indigo-950/20 dark:border-indigo-900/60 p-4 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-3">
          <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            Viewing permissions for <strong>{selectedUser.username}</strong>. Permissions shown in{" "}
            <span className="font-bold text-indigo-700 dark:text-indigo-300">purple</span> are inherited from their{" "}
            <strong>{selectedUser.role_name || "assigned role"}</strong>. You can toggle any action to grant a custom{" "}
            <span className="font-bold text-emerald-700 dark:text-emerald-300">user override</span> or revoke a role permission specifically for this user.
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
              : "Failed to update permissions."}
          </span>
        </div>
      )}

      {saveSuccess && (
        <div className="alert alert-success text-sm py-2.5 rounded-2xl shadow-sm text-white font-medium">
          <CheckCircle2 size={16} />
          <span>User permission overrides saved successfully!</span>
        </div>
      )}

      {/* Main Matrix Container */}
      {selectedUserId ? (
        <div className="rounded-2xl border border-base-300 bg-base-100 overflow-hidden shadow-sm">
          <PermissionMatrix
            tree={tree}
            allowedIds={allowedIds}
            roleAllowedIds={roleAllowedIds}
            roleName={selectedUser?.role_name || "Role"}
            onChange={setAllowedIds}
            onSave={handleSave}
            onReset={handleReset}
            onResetToRole={handleResetToRole}
            saving={saving}
            hasChanges={hasChanges}
            loading={treeLoading || permLoading}
            readOnly={isAdminUser}
            readOnlyMessage="Administrator permissions are permanent and cannot be modified."
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-base-300 bg-base-100 text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center text-base-content/40">
            <UserCog size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-base-content/80">
              No User Selected
            </p>
            <p className="text-xs text-base-content/50 mt-1 max-w-sm">
              Please select a user from the dropdown above to view and configure their role and custom permission overrides.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
