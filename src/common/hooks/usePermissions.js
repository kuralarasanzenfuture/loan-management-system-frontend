/**
 * src/common/hooks/usePermissions.js
 * Custom React hook providing RBAC and PBAC functions and user permission state.
 */

import { useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  isAdmin as checkIsAdmin,
  hasPermission as checkHasPermission,
  hasRole as checkHasRole,
  canAccess as checkCanAccess,
  extractUserPermissions,
} from "../utils/permissionUtils.js";

/**
 * Hook to access and evaluate user permissions and roles.
 */
export function usePermissions() {
  const { user, accessToken, isAuthenticated, loading } = useSelector(
    (state) => state.auth || {}
  );

  const isAdmin = useMemo(() => checkIsAdmin(user), [user]);

  const permissionsSet = useMemo(() => extractUserPermissions(user), [user]);

  const permissions = useMemo(() => Array.from(permissionsSet), [permissionsSet]);

  const hasPermission = useCallback(
    (requiredPermission, matchMode = "any") => {
      return checkHasPermission(user, requiredPermission, matchMode);
    },
    [user]
  );

  const hasRole = useCallback(
    (requiredRole) => {
      return checkHasRole(user, requiredRole);
    },
    [user]
  );

  const canAccess = useCallback(
    (options) => {
      return checkCanAccess(user, options);
    },
    [user]
  );

  return {
    user,
    accessToken,
    isAuthenticated: Boolean(accessToken || isAuthenticated),
    isAdmin,
    permissions,
    permissionsSet,
    hasPermission,
    hasRole,
    canAccess,
    can: hasPermission,
    loading,
  };
}

export default usePermissions;
