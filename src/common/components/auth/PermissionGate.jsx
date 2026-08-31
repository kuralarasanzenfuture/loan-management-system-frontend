/**
 * src/common/components/auth/PermissionGate.jsx
 * Declarative component for guarding UI elements (buttons, sections, tabs) based on permission or role.
 */

import React from "react";
import usePermissions from "../../hooks/usePermissions.js";

/**
 * PermissionGate
 *
 * @param {object} props
 * @param {string|string[]} [props.permission] - Required permission(s)
 * @param {string|string[]} [props.role] - Required role(s)
 * @param {'any'|'all'} [props.matchMode='any'] - Match mode for permissions
 * @param {React.ReactNode} [props.fallback=null] - Component/node to show when access is denied
 * @param {React.ReactNode} props.children - Child components to render when authorized
 */
export function PermissionGate({
  permission,
  role,
  matchMode = "any",
  fallback = null,
  children,
}) {
  const { canAccess } = usePermissions();

  const allowed = canAccess({
    permission,
    role,
    matchMode,
  });

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Ergonomic aliases for intuitive usage
export const Can = ({
  do: permission,
  permission: permAlias,
  role,
  matchMode = "any",
  fallback = null,
  children,
}) => (
  <PermissionGate
    permission={permission || permAlias}
    role={role}
    matchMode={matchMode}
    fallback={fallback}
  >
    {children}
  </PermissionGate>
);

export const CanAccess = PermissionGate;

export default PermissionGate;
