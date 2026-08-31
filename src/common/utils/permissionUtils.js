// /**
//  * src/common/utils/permissionUtils.js
//  * Universal, highly resilient Role and Permission evaluation engine.
//  */

// import { ROLES, PERMISSIONS } from "../../constants/permissions.js";

// // Module aliases dictionary to normalize between backend DB codes and frontend permission keys
// const MODULE_ALIASES = {
//   MOD_DASHBOARD: ["DASHBOARD", "MOD_DASHBOARD"],
//   MOD_ANALYTICS: ["ANALYTICS", "MOD_ANALYTICS"],
//   MOD_CUSTOMERS: ["CUSTOMER", "CUSTOMERS", "MOD_CUSTOMERS"],
//   MOD_CUSTOMER_DOCS: ["CUSTOMER_DOCUMENT", "CUSTOMER_DOCUMENTS", "CUSTOMER_DOCS"],
//   MOD_GUARANTORS: ["GUARANTOR", "GUARANTORS"],
//   MOD_LOAN_APPS: ["LOAN_APPLICATION", "LOAN_APPLICATIONS", "LOAN_APPS", "LOAN_APP"],
//   MOD_LOAN_PLANS: ["LOAN_PLAN", "LOAN_PLANS"],
//   MOD_LOAN_APPROVAL: ["LOAN_APPROVAL"],
//   MOD_ACTIVE_LOANS: ["LOAN", "LOANS", "ACTIVE_LOANS"],
//   MOD_LOANS: ["LOAN", "LOANS"],
//   MOD_HAND_LOANS: ["HAND_LOAN", "HAND_LOANS"],
//   MOD_PERSONAL_CHITS: ["PERSONAL_CHIT", "PERSONAL_CHITS"],
//   MOD_LOAN_COLLECTIONS: ["LOAN_COLLECTION", "LOAN_COLLECTIONS"],
//   MOD_DUE_COLLECTIONS: ["DUE_COLLECTION", "DUE_COLLECTIONS"],
//   MOD_EMI_COLLECTION: ["EMI_COLLECTION", "DUE_COLLECTION", "LOAN_COLLECTION"],
//   MOD_COMPANIES: ["COMPANY", "COMPANIES"],
//   MOD_BANK_ACCOUNTS: ["BANK_ACCOUNT", "BANK_ACCOUNTS"],
//   MOD_BANK_TRANSACTIONS: ["BANK_TRANSACTION", "BANK_TRANSACTIONS"],
//   MOD_ASSET_CATEGORIES: ["ASSET_CATEGORY", "ASSET_CATEGORIES"],
//   MOD_ASSETS: ["ASSET", "ASSETS"],
//   MOD_USERS: ["USER", "USERS"],
//   MOD_ROLES: ["ROLE", "ROLES"],
//   MOD_ROLE_PERMISSIONS: ["ROLE_PERMISSION", "ROLE_PERMISSIONS"],
//   MOD_USER_PERMISSIONS: ["USER_PERMISSION", "USER_PERMISSIONS"],
//   MOD_REP_LOANS: ["LOAN_REPORT", "LOAN_REPORTS", "REP_LOANS"],
//   MOD_REP_INSTALLMENTS: ["LOAN_INSTALLMENT_REPORT", "INSTALLMENT_REPORT", "INSTALLMENT_REPORTS", "REP_INSTALLMENTS"],
//   MOD_REP_COLLECTIONS: ["COLLECTION_REPORT", "COLLECTION_REPORTS", "REP_COLLECTIONS"],
//   MOD_REP_CUSTOMERS: ["CUSTOMER_REPORT", "CUSTOMER_REPORTS", "REP_CUSTOMERS"],
//   MOD_SETTINGS: ["SETTINGS", "SETTING"],
// };

// // Manager permissions bundle
// const MANAGER_DEFAULT_PERMISSIONS = [
//   PERMISSIONS.DASHBOARD_VIEW,
//   PERMISSIONS.ANALYTICS_VIEW,

//   // Customer Management
//   PERMISSIONS.CUSTOMER_VIEW,
//   PERMISSIONS.CUSTOMER_CREATE,
//   PERMISSIONS.CUSTOMER_EDIT,
//   PERMISSIONS.CUSTOMER_DELETE,
//   PERMISSIONS.CUSTOMER_DOCUMENTS_VIEW,
//   PERMISSIONS.GUARANTORS_VIEW,

//   // Loan Plans
//   PERMISSIONS.LOAN_PLAN_VIEW,
//   PERMISSIONS.LOAN_PLAN_CREATE,
//   PERMISSIONS.LOAN_PLAN_EDIT,
//   PERMISSIONS.LOAN_PLAN_DELETE,

//   // Loan Applications & Loans
//   PERMISSIONS.LOAN_APPLICATION_VIEW,
//   PERMISSIONS.LOAN_APPLICATION_CREATE,
//   PERMISSIONS.LOAN_APPLICATION_EDIT,
//   PERMISSIONS.LOAN_APPLICATION_DELETE,
//   PERMISSIONS.LOAN_VIEW,
//   PERMISSIONS.LOAN_CREATE,
//   PERMISSIONS.LOAN_EDIT,
//   PERMISSIONS.LOAN_DELETE,
//   PERMISSIONS.LOAN_APPROVAL_VIEW,
//   PERMISSIONS.LOAN_APPROVAL_ACTION,

//   // Hand Loans & Personal Chits
//   PERMISSIONS.HAND_LOAN_VIEW,
//   PERMISSIONS.HAND_LOAN_CREATE,
//   PERMISSIONS.HAND_LOAN_EDIT,
//   PERMISSIONS.HAND_LOAN_DELETE,
//   PERMISSIONS.PERSONAL_CHIT_VIEW,
//   PERMISSIONS.PERSONAL_CHIT_CREATE,
//   PERMISSIONS.PERSONAL_CHIT_EDIT,
//   PERMISSIONS.PERSONAL_CHIT_DELETE,

//   // Collections
//   PERMISSIONS.LOAN_COLLECTION_VIEW,
//   PERMISSIONS.LOAN_COLLECTION_CREATE,
//   PERMISSIONS.DUE_COLLECTION_VIEW,

//   // Companies & Banks
//   PERMISSIONS.COMPANY_VIEW,
//   PERMISSIONS.BANK_ACCOUNT_VIEW,
//   PERMISSIONS.BANK_TRANSACTION_VIEW,

//   // Assets
//   PERMISSIONS.ASSET_CATEGORY_VIEW,
//   PERMISSIONS.ASSET_VIEW,

//   // System Administration
//   PERMISSIONS.USER_VIEW,
//   PERMISSIONS.USER_CREATE,
//   PERMISSIONS.USER_EDIT,
//   PERMISSIONS.USER_DELETE,
//   PERMISSIONS.ROLE_VIEW,
//   PERMISSIONS.ROLE_CREATE,
//   PERMISSIONS.ROLE_EDIT,
//   PERMISSIONS.ROLE_DELETE,
//   PERMISSIONS.USER_PERMISSION_VIEW,
//   PERMISSIONS.USER_PERMISSION_EDIT,
//   PERMISSIONS.ROLE_PERMISSION_VIEW,
//   PERMISSIONS.ROLE_PERMISSION_EDIT,

//   // Reports
//   PERMISSIONS.LOAN_REPORT_VIEW,
//   PERMISSIONS.LOAN_INSTALLMENT_REPORT_VIEW,
//   PERMISSIONS.COLLECTION_REPORT_VIEW,
//   PERMISSIONS.CUSTOMER_REPORT_VIEW,
//   PERMISSIONS.SETTINGS_VIEW,
// ];

// // Fallback role default permissions map
// const ROLE_DEFAULT_PERMISSIONS = {
//   [ROLES.MANAGER]: MANAGER_DEFAULT_PERMISSIONS,
//   BRANCH_MANAGER: MANAGER_DEFAULT_PERMISSIONS,
//   GENERAL_MANAGER: MANAGER_DEFAULT_PERMISSIONS,
//   AREA_MANAGER: MANAGER_DEFAULT_PERMISSIONS,

//   [ROLES.LOAN_OFFICER]: [
//     PERMISSIONS.DASHBOARD_VIEW,
//     PERMISSIONS.CUSTOMER_VIEW,
//     PERMISSIONS.CUSTOMER_CREATE,
//     PERMISSIONS.CUSTOMER_EDIT,
//     PERMISSIONS.CUSTOMER_DOCUMENTS_VIEW,
//     PERMISSIONS.LOAN_APPLICATION_VIEW,
//     PERMISSIONS.LOAN_APPLICATION_CREATE,
//     PERMISSIONS.LOAN_APPLICATION_EDIT,
//     PERMISSIONS.LOAN_VIEW,
//     PERMISSIONS.LOAN_PLAN_VIEW,
//     PERMISSIONS.HAND_LOAN_VIEW,
//     PERMISSIONS.PERSONAL_CHIT_VIEW,
//     PERMISSIONS.LOAN_COLLECTION_VIEW,
//     PERMISSIONS.DUE_COLLECTION_VIEW,
//     PERMISSIONS.LOAN_REPORT_VIEW,
//     PERMISSIONS.CUSTOMER_REPORT_VIEW,
//   ],
//   [ROLES.COLLECTION_AGENT]: [
//     PERMISSIONS.DASHBOARD_VIEW,
//     PERMISSIONS.CUSTOMER_VIEW,
//     PERMISSIONS.LOAN_VIEW,
//     PERMISSIONS.LOAN_COLLECTION_VIEW,
//     PERMISSIONS.LOAN_COLLECTION_CREATE,
//     PERMISSIONS.DUE_COLLECTION_VIEW,
//     PERMISSIONS.COLLECTION_REPORT_VIEW,
//   ],
//   [ROLES.ACCOUNTANT]: [
//     PERMISSIONS.DASHBOARD_VIEW,
//     PERMISSIONS.ANALYTICS_VIEW,
//     PERMISSIONS.CUSTOMER_VIEW,
//     PERMISSIONS.BANK_ACCOUNT_VIEW,
//     PERMISSIONS.BANK_TRANSACTION_VIEW,
//     PERMISSIONS.LOAN_COLLECTION_VIEW,
//     PERMISSIONS.DUE_COLLECTION_VIEW,
//     PERMISSIONS.LOAN_REPORT_VIEW,
//     PERMISSIONS.LOAN_INSTALLMENT_REPORT_VIEW,
//     PERMISSIONS.COLLECTION_REPORT_VIEW,
//   ],
//   [ROLES.USER]: [
//     PERMISSIONS.DASHBOARD_VIEW,
//     PERMISSIONS.CUSTOMER_VIEW,
//     PERMISSIONS.LOAN_VIEW,
//   ],
// };

// /**
//  * Normalizes a permission key to uppercase standard format.
//  */
// export const normalizePermissionKey = (key) => {
//   if (!key || typeof key !== "string") return "";
//   return key.trim().replace(/[\.\:\-\s]+/g, "_").toUpperCase();
// };

// /**
//  * Normalizes a role name to uppercase standard format.
//  */
// export const normalizeRoleName = (role) => {
//   if (!role || typeof role !== "string") return "";
//   return role.trim().toUpperCase();
// };

// /**
//  * Checks whether a user possesses administrative/superuser privileges.
//  */
// export const isAdmin = (user) => {
//   if (!user || typeof user !== "object") return false;

//   const roleName = normalizeRoleName(
//     user.role_name ||
//       user.roleName ||
//       user.role?.name ||
//       (typeof user.role === "string" ? user.role : "")
//   );

//   const username = (user.username || "").trim().toLowerCase();
//   const email = (user.email || "").trim().toLowerCase();

//   const isExplicitAdminRole =
//     roleName === ROLES.ADMIN ||
//     roleName === ROLES.ADMINISTRATOR ||
//     roleName === ROLES.SUPER_ADMIN ||
//     roleName === "SUPERADMIN" ||
//     roleName.includes("ADMIN");

//   const isExplicitAdminIdentity =
//     username === "admin" ||
//     username === "administrator" ||
//     email.startsWith("admin@");

//   const isFlaggedAdmin =
//     Boolean(user.is_admin) ||
//     Boolean(user.isAdmin) ||
//     Boolean(user.is_superuser) ||
//     Boolean(user.isSuperuser) ||
//     Boolean(user.is_system) ||
//     Boolean(user.isSystem);

//   return isExplicitAdminRole || isExplicitAdminIdentity || isFlaggedAdmin;
// };

// /**
//  * Helper to recursively extract permission string codes from nested structures,
//  * arrays of objects, or key-value permission maps.
//  */
// const collectCodes = (source, acc = new Set()) => {
//   if (!source) return acc;

//   if (typeof source === "string") {
//     const normalized = normalizePermissionKey(source);
//     if (normalized) acc.add(normalized);
//     return acc;
//   }

//   if (Array.isArray(source)) {
//     for (const item of source) {
//       if (typeof item === "string") {
//         const normalized = normalizePermissionKey(item);
//         if (normalized) acc.add(normalized);
//       } else if (item && typeof item === "object") {
//         const isAllowed =
//           item.is_allowed === undefined ||
//           item.is_allowed === true ||
//           item.is_allowed === 1 ||
//           item.is_allowed === "1" ||
//           item.is_allowed === "true";

//         if (isAllowed) {
//           const moduleCode = item.module_code || item.module?.code;
//           const actionCode = item.action_code || item.action?.code || item.code || item.name;

//           // 1. Direct code
//           if (typeof actionCode === "string") {
//             const normalizedAction = normalizePermissionKey(actionCode);
//             if (normalizedAction) acc.add(normalizedAction);
//           }

//           // 2. Combined module + action (e.g. MOD_CUSTOMERS + VIEW => CUSTOMER_VIEW, CUSTOMERS_VIEW, MOD_CUSTOMERS_VIEW)
//           if (moduleCode && actionCode) {
//             const rawMod = normalizePermissionKey(moduleCode);
//             const rawAct = normalizePermissionKey(actionCode);

//             // Expand action synonyms (e.g., UPDATE <=> EDIT, ADD <=> CREATE, REMOVE <=> DELETE)
//             const actionVariants = [rawAct];
//             if (rawAct === "UPDATE" || rawAct === "MODIFY") actionVariants.push("EDIT");
//             if (rawAct === "EDIT") actionVariants.push("UPDATE");
//             if (rawAct === "ADD" || rawAct === "NEW" || rawAct === "INSERT") actionVariants.push("CREATE");
//             if (rawAct === "CREATE") actionVariants.push("ADD");
//             if (rawAct === "REMOVE" || rawAct === "DESTROY") actionVariants.push("DELETE");
//             if (rawAct === "DELETE") actionVariants.push("REMOVE");
//             if (rawAct === "READ" || rawAct === "SHOW" || rawAct === "LIST") actionVariants.push("VIEW");
//             if (rawAct === "VIEW") actionVariants.push("READ", "LIST");

//             const moduleVariants = [
//               rawMod,
//               rawMod.replace(/^MOD_/, ""),
//               ...(MODULE_ALIASES[rawMod] || []),
//             ];

//             for (const m of moduleVariants) {
//               for (const a of actionVariants) {
//                 acc.add(`${m}_${a}`);
//               }
//             }
//           }
//         }
//       }
//     }
//     return acc;
//   }

//   if (typeof source === "object") {
//     for (const [key, value] of Object.entries(source)) {
//       const isAllowed =
//         value === true ||
//         value === 1 ||
//         value === "1" ||
//         value === "true";

//       if (isAllowed) {
//         const normalized = normalizePermissionKey(key);
//         if (normalized) acc.add(normalized);
//       } else if (Array.isArray(value) || typeof value === "object") {
//         collectCodes(value, acc);
//       }
//     }
//   }

//   return acc;
// };

// /**
//  * Extracts and compiles all effective permissions granted to a user.
//  */
// export const extractUserPermissions = (user) => {
//   const permissionsSet = new Set();

//   // Always grant dashboard view to any authenticated session
//   permissionsSet.add(PERMISSIONS.DASHBOARD_VIEW);

//   if (!user || typeof user !== "object") return permissionsSet;

//   // Direct permissions collection
//   collectCodes(user.permissions, permissionsSet);
//   collectCodes(user.effective_permissions, permissionsSet);
//   collectCodes(user.effectivePermissions, permissionsSet);
//   collectCodes(user.user_permissions, permissionsSet);
//   collectCodes(user.userPermissions, permissionsSet);
//   collectCodes(user.actions, permissionsSet);
//   collectCodes(user.role_permissions, permissionsSet);
//   collectCodes(user.rolePermissions, permissionsSet);
//   collectCodes(user.role?.permissions, permissionsSet);

//   // If no explicit permissions exist in database yet, apply default role capabilities
//   if (permissionsSet.size <= 1) {
//     const roleName = normalizeRoleName(
//       user.role_name ||
//         user.roleName ||
//         user.role?.name ||
//         (typeof user.role === "string" ? user.role : "")
//     );

//     let defaults = ROLE_DEFAULT_PERMISSIONS[roleName];

//     // Pattern-based fallback matching
//     if (!defaults) {
//       if (roleName.includes("MANAGER")) {
//         defaults = MANAGER_DEFAULT_PERMISSIONS;
//       } else if (roleName.includes("OFFICER") || roleName.includes("LOAN")) {
//         defaults = ROLE_DEFAULT_PERMISSIONS[ROLES.LOAN_OFFICER];
//       } else if (roleName.includes("COLLECT") || roleName.includes("AGENT")) {
//         defaults = ROLE_DEFAULT_PERMISSIONS[ROLES.COLLECTION_AGENT];
//       } else if (roleName.includes("ACCOUNT") || roleName.includes("CASHIER")) {
//         defaults = ROLE_DEFAULT_PERMISSIONS[ROLES.ACCOUNTANT];
//       } else {
//         defaults = ROLE_DEFAULT_PERMISSIONS[ROLES.USER];
//       }
//     }

//     if (Array.isArray(defaults)) {
//       for (const perm of defaults) {
//         permissionsSet.add(perm);
//       }
//     }
//   }

//   return permissionsSet;
// };

// /**
//  * Checks if a user has the required permission(s).
//  */
// export const hasPermission = (user, requiredPermission, matchMode = "any") => {
//   if (!requiredPermission || (Array.isArray(requiredPermission) && requiredPermission.length === 0)) {
//     return true;
//   }

//   // Admins bypass specific permission checks
//   if (isAdmin(user)) {
//     return true;
//   }

//   // Dashboard is accessible by any authenticated user
//   const requiredList = Array.isArray(requiredPermission)
//     ? requiredPermission
//     : [requiredPermission];

//   const normalizedRequired = requiredList
//     .map(normalizePermissionKey)
//     .filter(Boolean);

//   if (normalizedRequired.length === 0) return true;

//   if (
//     normalizedRequired.includes("DASHBOARD_VIEW") ||
//     normalizedRequired.includes(PERMISSIONS.DASHBOARD_VIEW)
//   ) {
//     return true;
//   }

//   if (!user) return false;

//   const userPerms = extractUserPermissions(user);

//   if (matchMode === "all") {
//     return normalizedRequired.every((perm) => userPerms.has(perm));
//   }

//   // Default: 'any'
//   return normalizedRequired.some((perm) => userPerms.has(perm));
// };

// /**
//  * Checks if a user has the specified role(s).
//  */
// export const hasRole = (user, requiredRole) => {
//   if (!requiredRole || (Array.isArray(requiredRole) && requiredRole.length === 0)) {
//     return true;
//   }

//   if (isAdmin(user)) {
//     return true;
//   }

//   if (!user) return false;

//   const userRole = normalizeRoleName(
//     user.role_name ||
//       user.roleName ||
//       user.role?.name ||
//       (typeof user.role === "string" ? user.role : "")
//   );

//   const rolesList = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
//   const normalizedRequiredRoles = rolesList.map(normalizeRoleName).filter(Boolean);

//   return normalizedRequiredRoles.includes(userRole);
// };

// /**
//  * Universal Access Control evaluation evaluating both role and permission criteria.
//  */
// export const canAccess = (user, { permission, role, matchMode = "any" } = {}) => {
//   if (!permission && !role) return true;
//   if (isAdmin(user)) return true;

//   // Dashboard view is granted to any authenticated session
//   if (
//     permission === PERMISSIONS.DASHBOARD_VIEW ||
//     permission === "DASHBOARD_VIEW" ||
//     (Array.isArray(permission) && permission.includes(PERMISSIONS.DASHBOARD_VIEW))
//   ) {
//     return true;
//   }

//   if (!user) return false;

//   const rolePassed = role ? hasRole(user, role) : true;
//   const permissionPassed = permission ? hasPermission(user, permission, matchMode) : true;

//   return rolePassed && permissionPassed;
// };

// /**
//  * Filters navigation sections and items dynamically according to user permissions.
//  */
// export const filterNavSections = (navSections = [], user = null) => {
//   if (!Array.isArray(navSections)) return [];

//   // Admins see all items
//   if (isAdmin(user)) {
//     return navSections;
//   }

//   return navSections
//     .map((section) => {
//       const filteredItems = (section.items || []).filter((item) => {
//         return canAccess(user, {
//           permission: item.permission,
//           role: item.role || item.roles,
//         });
//       });

//       return {
//         ...section,
//         items: filteredItems,
//       };
//     })
//     .filter((section) => section.items && section.items.length > 0);
// };

// export default {
//   isAdmin,
//   hasPermission,
//   hasRole,
//   canAccess,
//   extractUserPermissions,
//   normalizePermissionKey,
//   normalizeRoleName,
//   filterNavSections,
// };

/* ========================================== */

/**
 * src/common/utils/permissionUtils.js
 * Universal, highly resilient Role and Permission evaluation engine.
 */

import { PERMISSIONS } from "../../constants/permissions.js";

// Module aliases dictionary to normalize between backend DB codes and frontend permission keys
const MODULE_ALIASES = {
  MOD_DASHBOARD: ["DASHBOARD", "MOD_DASHBOARD"],
  MOD_ANALYTICS: ["ANALYTICS", "MOD_ANALYTICS"],
  MOD_CUSTOMERS: ["CUSTOMER", "CUSTOMERS", "MOD_CUSTOMERS"],
  MOD_CUSTOMER_DOCS: [
    "CUSTOMER_DOCUMENT",
    "CUSTOMER_DOCUMENTS",
    "CUSTOMER_DOCS",
  ],
  MOD_GUARANTORS: ["GUARANTOR", "GUARANTORS"],
  MOD_LOAN_APPS: [
    "LOAN_APPLICATION",
    "LOAN_APPLICATIONS",
    "LOAN_APPS",
    "LOAN_APP",
  ],
  MOD_LOAN_PLANS: ["LOAN_PLAN", "LOAN_PLANS"],
  MOD_LOAN_APPROVAL: ["LOAN_APPROVAL"],
  MOD_ACTIVE_LOANS: ["LOAN", "LOANS", "ACTIVE_LOANS"],
  MOD_LOANS: ["LOAN", "LOANS"],
  MOD_HAND_LOANS: ["HAND_LOAN", "HAND_LOANS"],
  MOD_PERSONAL_CHITS: ["PERSONAL_CHIT", "PERSONAL_CHITS"],
  MOD_LOAN_COLLECTIONS: ["LOAN_COLLECTION", "LOAN_COLLECTIONS"],
  MOD_DUE_COLLECTIONS: ["DUE_COLLECTION", "DUE_COLLECTIONS"],
  MOD_EMI_COLLECTION: ["EMI_COLLECTION", "DUE_COLLECTION", "LOAN_COLLECTION"],
  MOD_COMPANIES: ["COMPANY", "COMPANIES"],
  MOD_BANK_ACCOUNTS: ["BANK_ACCOUNT", "BANK_ACCOUNTS"],
  MOD_BANK_TRANSACTIONS: ["BANK_TRANSACTION", "BANK_TRANSACTIONS"],
  MOD_ASSET_CATEGORIES: ["ASSET_CATEGORY", "ASSET_CATEGORIES"],
  MOD_ASSETS: ["ASSET", "ASSETS"],
  MOD_USERS: ["USER", "USERS"],
  MOD_ROLES: ["ROLE", "ROLES"],
  MOD_ROLE_PERMISSIONS: ["ROLE_PERMISSION", "ROLE_PERMISSIONS"],
  MOD_USER_PERMISSIONS: ["USER_PERMISSION", "USER_PERMISSIONS"],
  MOD_REP_LOANS: ["LOAN_REPORT", "LOAN_REPORTS", "REP_LOANS"],
  MOD_REP_INSTALLMENTS: [
    "LOAN_INSTALLMENT_REPORT",
    "INSTALLMENT_REPORT",
    "INSTALLMENT_REPORTS",
    "REP_INSTALLMENTS",
  ],
  MOD_REP_COLLECTIONS: [
    "COLLECTION_REPORT",
    "COLLECTION_REPORTS",
    "REP_COLLECTIONS",
  ],
  MOD_REP_CUSTOMERS: ["CUSTOMER_REPORT", "CUSTOMER_REPORTS", "REP_CUSTOMERS"],
  MOD_SETTINGS: ["SETTINGS", "SETTING"],
};

/**
 * Normalizes a permission key to uppercase standard format.
 */
export const normalizePermissionKey = (key) => {
  if (!key || typeof key !== "string") return "";
  return key
    .trim()
    .replace(/[\.\:\-\s]+/g, "_")
    .toUpperCase();
};

/**
 * Normalizes a role name to uppercase standard format.
 */
export const normalizeRoleName = (role) => {
  if (!role || typeof role !== "string") return "";
  return role.trim().toUpperCase();
};

/**
 * Checks whether a user possesses administrative/superuser privileges.
 */
export const isAdmin = (user) => {
  if (!user || typeof user !== "object") return false;

  const roleName = normalizeRoleName(
    user.role_name ||
      user.roleName ||
      user.role?.name ||
      (typeof user.role === "string" ? user.role : ""),
  );

  const username = (user.username || "").trim().toLowerCase();
  const email = (user.email || "").trim().toLowerCase();

  const isExplicitAdminRole =
    roleName === "ADMIN" ||
    roleName === "ADMINISTRATOR" ||
    roleName === "SUPER_ADMIN" ||
    roleName === "SUPERADMIN" ||
    roleName.includes("ADMIN");

  const isExplicitAdminIdentity =
    username === "admin" ||
    username === "administrator" ||
    email.startsWith("admin@");

  const isFlaggedAdmin =
    Boolean(user.is_admin) ||
    Boolean(user.isAdmin) ||
    Boolean(user.is_superuser) ||
    Boolean(user.isSuperuser) ||
    Boolean(user.is_system) ||
    Boolean(user.isSystem);

  return isExplicitAdminRole || isExplicitAdminIdentity || isFlaggedAdmin;
};

/**
 * Helper to recursively extract permission string codes from nested structures,
 * arrays of objects, or key-value permission maps.
 */
const collectCodes = (source, acc = new Set()) => {
  if (!source) return acc;

  if (typeof source === "string") {
    const normalized = normalizePermissionKey(source);
    if (normalized) acc.add(normalized);
    return acc;
  }

  if (Array.isArray(source)) {
    for (const item of source) {
      if (typeof item === "string") {
        const normalized = normalizePermissionKey(item);
        if (normalized) acc.add(normalized);
      } else if (item && typeof item === "object") {
        const isAllowed =
          item.is_allowed === undefined ||
          item.is_allowed === true ||
          item.is_allowed === 1 ||
          item.is_allowed === "1" ||
          item.is_allowed === "true";

        if (isAllowed) {
          const moduleCode = item.module_code || item.module?.code;
          const actionCode =
            item.action_code || item.action?.code || item.code || item.name;

          // 1. Direct code
          if (typeof actionCode === "string") {
            const normalizedAction = normalizePermissionKey(actionCode);
            if (normalizedAction) acc.add(normalizedAction);
          }

          // 2. Combined module + action
          if (moduleCode && actionCode) {
            const rawMod = normalizePermissionKey(moduleCode);
            const rawAct = normalizePermissionKey(actionCode);

            // Expand action synonyms
            const actionVariants = [rawAct];
            if (rawAct === "UPDATE" || rawAct === "MODIFY")
              actionVariants.push("EDIT");
            if (rawAct === "EDIT") actionVariants.push("UPDATE");
            if (rawAct === "ADD" || rawAct === "NEW" || rawAct === "INSERT")
              actionVariants.push("CREATE");
            if (rawAct === "CREATE") actionVariants.push("ADD");
            if (rawAct === "REMOVE" || rawAct === "DESTROY")
              actionVariants.push("DELETE");
            if (rawAct === "DELETE") actionVariants.push("REMOVE");
            if (rawAct === "READ" || rawAct === "SHOW" || rawAct === "LIST")
              actionVariants.push("VIEW");
            if (rawAct === "VIEW") actionVariants.push("READ", "LIST");

            const moduleVariants = [
              rawMod,
              rawMod.replace(/^MOD_/, ""),
              ...(MODULE_ALIASES[rawMod] || []),
            ];

            for (const m of moduleVariants) {
              for (const a of actionVariants) {
                acc.add(`${m}_${a}`);
              }
            }
          }
        }
      }
    }
    return acc;
  }

  if (typeof source === "object") {
    for (const [key, value] of Object.entries(source)) {
      const isAllowed =
        value === true || value === 1 || value === "1" || value === "true";

      if (isAllowed) {
        const normalized = normalizePermissionKey(key);
        if (normalized) acc.add(normalized);
      } else if (Array.isArray(value) || typeof value === "object") {
        collectCodes(value, acc);
      }
    }
  }

  return acc;
};

/**
 * Extracts and compiles all effective permissions granted ONLY by the backend.
 */
export const extractUserPermissions = (user) => {
  const permissionsSet = new Set();

  // Always grant dashboard view to any authenticated session
  permissionsSet.add(PERMISSIONS.DASHBOARD_VIEW);

  if (!user || typeof user !== "object") return permissionsSet;

  // Direct permissions collection exclusively from backend response payload
  collectCodes(user.permissions, permissionsSet);
  collectCodes(user.effective_permissions, permissionsSet);
  collectCodes(user.effectivePermissions, permissionsSet);
  collectCodes(user.user_permissions, permissionsSet);
  collectCodes(user.userPermissions, permissionsSet);
  collectCodes(user.actions, permissionsSet);
  collectCodes(user.role_permissions, permissionsSet);
  collectCodes(user.rolePermissions, permissionsSet);
  collectCodes(user.role?.permissions, permissionsSet);

  return permissionsSet;
};

/**
 * Checks if a user has the required permission(s).
 */
export const hasPermission = (user, requiredPermission, matchMode = "any") => {
  if (
    !requiredPermission ||
    (Array.isArray(requiredPermission) && requiredPermission.length === 0)
  ) {
    return true;
  }

  // Admins bypass specific permission checks
  if (isAdmin(user)) {
    return true;
  }

  const requiredList = Array.isArray(requiredPermission)
    ? requiredPermission
    : [requiredPermission];

  const normalizedRequired = requiredList
    .map(normalizePermissionKey)
    .filter(Boolean);

  if (normalizedRequired.length === 0) return true;

  if (
    normalizedRequired.includes("DASHBOARD_VIEW") ||
    normalizedRequired.includes(PERMISSIONS.DASHBOARD_VIEW)
  ) {
    return true;
  }

  if (!user) return false;

  const userPerms = extractUserPermissions(user);

  if (matchMode === "all") {
    return normalizedRequired.every((perm) => userPerms.has(perm));
  }

  return normalizedRequired.some((perm) => userPerms.has(perm));
};

/**
 * Checks if a user has the specified role(s).
 */
export const hasRole = (user, requiredRole) => {
  if (
    !requiredRole ||
    (Array.isArray(requiredRole) && requiredRole.length === 0)
  ) {
    return true;
  }

  if (isAdmin(user)) {
    return true;
  }

  if (!user) return false;

  const userRole = normalizeRoleName(
    user.role_name ||
      user.roleName ||
      user.role?.name ||
      (typeof user.role === "string" ? user.role : ""),
  );

  const rolesList = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const normalizedRequiredRoles = rolesList
    .map(normalizeRoleName)
    .filter(Boolean);

  return normalizedRequiredRoles.includes(userRole);
};

/**
 * Universal Access Control evaluation evaluating both role and permission criteria.
 */
export const canAccess = (
  user,
  { permission, role, matchMode = "any" } = {},
) => {
  if (!permission && !role) return true;
  if (isAdmin(user)) return true;

  if (
    permission === PERMISSIONS.DASHBOARD_VIEW ||
    permission === "DASHBOARD_VIEW" ||
    (Array.isArray(permission) &&
      permission.includes(PERMISSIONS.DASHBOARD_VIEW))
  ) {
    return true;
  }

  if (!user) return false;

  const rolePassed = role ? hasRole(user, role) : true;
  const permissionPassed = permission
    ? hasPermission(user, permission, matchMode)
    : true;

  return rolePassed && permissionPassed;
};

/**
 * Filters navigation sections and items dynamically according to user permissions.
 */
export const filterNavSections = (navSections = [], user = null) => {
  if (!Array.isArray(navSections)) return [];

  if (isAdmin(user)) {
    return navSections;
  }

  return navSections
    .map((section) => {
      const filteredItems = (section.items || []).filter((item) => {
        return canAccess(user, {
          permission: item.permission,
          role: item.role || item.roles,
        });
      });

      return {
        ...section,
        items: filteredItems,
      };
    })
    .filter((section) => section.items && section.items.length > 0);
};

export default {
  isAdmin,
  hasPermission,
  hasRole,
  canAccess,
  extractUserPermissions,
  normalizePermissionKey,
  normalizeRoleName,
  filterNavSections,
};
