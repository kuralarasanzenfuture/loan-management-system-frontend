import { Navigate, Outlet } from "react-router-dom";
import { usePermissions } from "../common/hooks/usePermissions";
import { ROLES } from "../constants/permissions";

// Guard Component
export function AdminOnlyRoute({ children }) {
  const { hasRole, isAdmin } = usePermissions();
  const isAuthorized = isAdmin || hasRole(["ADMIN", "SUPER_ADMIN"]);

  if (!isAuthorized) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
}

// Router Configuration
const routes = [
  {
    element: <AdminOnlyRoute />,
    children: [
      { path: "/roles", element: <RolesPage /> },
      { path: "/users", element: <UsersPage /> },
      { path: "/role-permissions", element: <RolePermissionsPage /> },
      { path: "/role-permissions/:roleId", element: <RolePermissionsPage /> },
      { path: "/user-permissions", element: <UserPermissionsPage /> },
      { path: "/user-permissions/:userId", element: <UserPermissionsPage /> },
    ],
  },
];
