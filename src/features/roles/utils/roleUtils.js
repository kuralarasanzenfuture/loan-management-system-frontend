/**
 * Utility functions for role-related checks and formatting.
 */

/**
 * Checks whether a given role is a protected system role.
 * Considers is_system flag (boolean, 1, "1") and reserved system role names (ADMIN, SUPER_ADMIN).
 *
 * @param {object} role - Role object
 * @returns {boolean}
 */
export const isSystemRole = (role) => {
  if (!role || typeof role !== "object") return false;

  const isFlagged =
    Boolean(role.is_system) ||
    role.is_system === 1 ||
    role.is_system === "1" ||
    role.is_system === true;

  const roleName = (role.name || "").trim().toUpperCase();
  const isNamedSystemRole = roleName === "ADMIN" || roleName === "SUPER_ADMIN";

  return isFlagged || isNamedSystemRole;
};
