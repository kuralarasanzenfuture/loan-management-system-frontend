/**
 * Utility functions for user-related checks and formatting.
 */

/**
 * Checks whether a given user has a protected system role or is a reserved system user.
 * Considers is_system / is_system_role flags, role names (ADMIN, SUPER_ADMIN),
 * and reserved system usernames (admin, superadmin).
 *
 * @param {object} user - User object
 * @returns {boolean}
 */
export const isSystemUser = (user) => {
  if (!user || typeof user !== "object") return false;

  const isFlagged =
    Boolean(user.is_system) ||
    user.is_system === 1 ||
    user.is_system === "1" ||
    user.is_system === true ||
    Boolean(user.is_system_role) ||
    user.is_system_role === 1 ||
    user.is_system_role === "1" ||
    user.is_system_role === true;

  const roleName = (
    user.role_name ||
    user.roleName ||
    user.role?.name ||
    ""
  )
    .trim()
    .toUpperCase();

  const isNamedSystemRole =
    roleName === "ADMIN" ||
    roleName === "SUPER_ADMIN" ||
    roleName === "SUPERADMIN" ||
    roleName === "ADMINISTRATOR";

  const username = (user.username || "").trim().toLowerCase();
  const isReservedUsername =
    username === "admin" ||
    username === "superadmin" ||
    username === "administrator";

  return isFlagged || isNamedSystemRole || isReservedUsername;
};
