/**
 * Recursively accumulates action IDs into a single flat array.
 * Avoids repeated array allocations (.concat) for high performance.
 */
export function collectActionIds(module, acc = []) {
  if (!module) return acc;

  if (Array.isArray(module.actions)) {
    for (let i = 0; i < module.actions.length; i++) {
      if (module.actions[i]?.id != null) {
        acc.push(module.actions[i].id);
      }
    }
  }

  if (Array.isArray(module.children)) {
    for (let i = 0; i < module.children.length; i++) {
      collectActionIds(module.children[i], acc);
    }
  }

  return acc;
}

/**
 * Traverses a module tree and executes a callback on every module and action.
 */
export function walkTree(tree, callback) {
  if (!Array.isArray(tree)) return;

  const stack = [...tree];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node) continue;

    callback(node);

    if (Array.isArray(node.children) && node.children.length > 0) {
      stack.push(...node.children);
    }
  }
}

/**
 * Returns all action IDs present in the entire tree.
 */
export function collectAllActionIds(tree) {
  const ids = [];
  walkTree(tree, (module) => {
    if (Array.isArray(module.actions)) {
      module.actions.forEach((a) => {
        if (a?.id != null) ids.push(a.id);
      });
    }
  });
  return ids;
}

/**
 * Returns tri-state checkbox status for a module: "all" | "some" | "none".
 */
export function getModuleCheckState(module, allowedIds = new Set()) {
  const ids = collectActionIds(module);
  if (ids.length === 0) return "none";

  let checkedCount = 0;
  for (let i = 0; i < ids.length; i++) {
    if (allowedIds.has(ids[i])) {
      checkedCount++;
    }
  }

  if (checkedCount === 0) return "none";
  if (checkedCount === ids.length) return "all";
  return "some";
}

/**
 * Counts total actions and checked actions across the whole tree.
 */
export function getTreeStats(tree, allowedIds = new Set()) {
  let total = 0;
  let checked = 0;

  walkTree(tree, (module) => {
    if (Array.isArray(module.actions)) {
      module.actions.forEach((action) => {
        total++;
        if (allowedIds.has(action.id)) checked++;
      });
    }
  });

  return { total, checked };
}

/**
 * Breakdown of user permissions vs role permissions:
 * - total: all system actions
 * - allowed: total currently allowed for user
 * - inherited: granted by role and allowed
 * - overrides: granted specifically to user (not in role)
 * - revoked: in role but explicitly revoked for user
 * - notAllowed: neither role nor user granted
 */
export function getUserPermissionStats(
  tree,
  allowedIds = new Set(),
  roleAllowedIds = new Set(),
) {
  let total = 0;
  let allowed = 0;
  let inherited = 0;
  let overrides = 0;
  let revoked = 0;
  let notAllowed = 0;

  walkTree(tree, (module) => {
    if (Array.isArray(module.actions)) {
      module.actions.forEach((action) => {
        total++;
        const isAllowed = allowedIds.has(action.id);
        const inRole = roleAllowedIds.has(action.id);

        if (isAllowed) {
          allowed++;
          if (inRole) {
            inherited++;
          } else {
            overrides++;
          }
        } else {
          if (inRole) {
            revoked++;
          } else {
            notAllowed++;
          }
        }
      });
    }
  });

  return { total, allowed, inherited, overrides, revoked, notAllowed };
}

/**
 * Converts saved permission records into a Set<action_id> for allowed ones.
 * Safely handles numeric (1/0), boolean (true/false), and string ("1"/"true") inputs.
 */
export function buildAllowedSet(permissionRows = []) {
  if (!Array.isArray(permissionRows)) return new Set();

  const allowedSet = new Set();
  for (let i = 0; i < permissionRows.length; i++) {
    const row = permissionRows[i];
    const isAllowed =
      row.is_allowed === true ||
      row.is_allowed === 1 ||
      row.is_allowed === "1" ||
      row.is_allowed === "true";

    if (isAllowed && row.action_id != null) {
      allowedSet.add(row.action_id);
    }
  }

  return allowedSet;
}

/**
 * Diffs current allowedIds Set against original AllowedIds Set.
 * If allActionIds is not passed, automatically extracts them from tree.
 */
export function diffPermissions(
  originalAllowedIds = new Set(),
  currentAllowedIds = new Set(),
  allActionIdsOrTree = [],
) {
  const actionIds =
    Array.isArray(allActionIdsOrTree) &&
    typeof allActionIdsOrTree[0] === "object"
      ? collectAllActionIds(allActionIdsOrTree)
      : allActionIdsOrTree;

  const changes = [];
  for (let i = 0; i < actionIds.length; i++) {
    const actionId = actionIds[i];
    const was = originalAllowedIds.has(actionId);
    const is = currentAllowedIds.has(actionId);

    if (was !== is) {
      changes.push({ action_id: actionId, is_allowed: is });
    }
  }

  return changes;
}
