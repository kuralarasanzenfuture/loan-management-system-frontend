// import { Navigate, Outlet } from "react-router-dom";
// import { useSelector } from "react-redux";

// const ProtectedRoute = () => {
//   const { accessToken } = useSelector((state) => state.auth);

//   return accessToken ? <Outlet /> : <Navigate to="/login" replace />;
// };

// export default ProtectedRoute;

/**
 * src/routes/ProtectedRoute.jsx
 * Robust route protection component supporting authentication, role checks, and permission checks.
 */

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { canAccess } from "../common/utils/permissionUtils.js";

/**
 * ProtectedRoute
 * Guards routes against unauthenticated and unauthorized access.
 *
 * @param {object} props
 * @param {string|string[]} [props.requiredPermission] - Permission key or array of keys required to view route
 * @param {string|string[]} [props.requiredRole] - Role name or array of roles allowed to view route
 * @param {'any'|'all'} [props.matchMode='any'] - Match mode for permissions
 * @param {string} [props.unauthorizedRedirect='/unauthorized'] - Redirect path on authorization failure
 * @param {string} [props.loginRedirect='/login'] - Redirect path when unauthenticated
 * @param {React.ReactNode} [props.children] - Optional wrapped component (renders Outlet if omitted)
 */
const ProtectedRoute = ({
  requiredPermission,
  requiredRole,
  matchMode = "any",
  unauthorizedRedirect = "/unauthorized",
  loginRedirect = "/login",
  children,
}) => {
  const location = useLocation();
  const { accessToken, user, loading } = useSelector(
    (state) => state.auth || {},
  );

  // 1. Authentication Check
  if (!accessToken) {
    return <Navigate to={loginRedirect} state={{ from: location }} replace />;
  }

  // 2. Loading State: If token exists but user profile is actively fetching, show smooth loader
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200/50">
        <div className="flex flex-col items-center gap-3">
          <span className="loading loading-spinner loading-lg text-primary" />
          <p className="text-sm font-medium text-base-content/60">
            Verifying permissions...
          </p>
        </div>
      </div>
    );
  }

  // 3. Authorization (Role & Permission) Check using Universal Engine
  const hasAccess = canAccess(user, {
    permission: requiredPermission,
    role: requiredRole,
    matchMode,
  });

  if (!hasAccess) {
    return <Navigate to={unauthorizedRedirect} replace />;
  }

  // Render children if provided, otherwise render nested routes via Outlet
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
