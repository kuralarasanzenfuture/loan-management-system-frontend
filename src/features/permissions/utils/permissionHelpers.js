/**
 * Flattens the module tree into a lookup of all action IDs per module
 * (including descendant modules), so a parent module's checkbox can
 * reflect the combined checked-state of everything beneath it.
 */
export function collectActionIds(module) {
  let ids = (module.actions || []).map((a) => a.id);
  (module.children || []).forEach((child) => {
    ids = ids.concat(collectActionIds(child));
  });
  return ids;
}

/**
 * Given the current Set of allowed action IDs, returns the tri-state
 * checkbox status for a module: "all" | "some" | "none".
 */
export function getModuleCheckState(module, allowedIds) {
  const ids = collectActionIds(module);
  if (ids.length === 0) return "none";
  const checkedCount = ids.filter((id) => allowedIds.has(id)).length;
  if (checkedCount === 0) return "none";
  if (checkedCount === ids.length) return "all";
  return "some";
}

/**
 * Counts total actions and checked actions across the whole tree —
 * used for the top-level "X of Y permissions selected" summary.
 */
export function getTreeStats(tree, allowedIds) {
  let total = 0;
  let checked = 0;
  const walk = (modules) => {
    modules.forEach((m) => {
      (m.actions || []).forEach((a) => {
        total += 1;
        if (allowedIds.has(a.id)) checked += 1;
      });
      if (m.children?.length) walk(m.children);
    });
  };
  walk(tree);
  return { total, checked };
}

/**
 * Detailed breakdown of user permissions vs role permissions:
 * - total: all system actions
 * - allowed: total currently allowed for user
 * - inherited: granted by role and allowed
 * - overrides: granted specifically to user (not in role)
 * - revoked: in role but explicitly revoked for user
 * - notAllowed: neither role nor user granted
 */
export function getUserPermissionStats(tree, allowedIds, roleAllowedIds = new Set()) {
  let total = 0;
  let allowed = 0;
  let inherited = 0;
  let overrides = 0;
  let revoked = 0;
  let notAllowed = 0;

  const walk = (modules) => {
    modules.forEach((m) => {
      (m.actions || []).forEach((a) => {
        total += 1;
        const isAllowed = allowedIds.has(a.id);
        const inRole = roleAllowedIds.has(a.id);

        if (isAllowed) {
          allowed += 1;
          if (inRole) {
            inherited += 1;
          } else {
            overrides += 1;
          }
        } else {
          if (inRole) {
            revoked += 1;
          } else {
            notAllowed += 1;
          }
        }
      });
      if (m.children?.length) walk(m.children);
    });
  };
  walk(tree);

  return { total, allowed, inherited, overrides, revoked, notAllowed };
}

/** Converts a role/user's saved permission rows into a Set<action_id> for allowed ones. */
export function buildAllowedSet(permissionRows = []) {
  if (!Array.isArray(permissionRows)) return new Set();
  return new Set(
    permissionRows.filter((p) => Boolean(p.is_allowed)).map((p) => p.action_id),
  );
}

/**
 * Diffs the current allowedIds Set against the originally-loaded Set,
 * returning only the actions that changed — so the save payload is
 * minimal instead of resubmitting every permission every time.
 */
export function diffPermissions(
  originalAllowedIds,
  currentAllowedIds,
  allActionIds,
) {
  const changes = [];
  allActionIds.forEach((actionId) => {
    const was = originalAllowedIds.has(actionId);
    const is = currentAllowedIds.has(actionId);
    if (was !== is) {
      changes.push({ action_id: actionId, is_allowed: is });
    }
  });
  return changes;
}
