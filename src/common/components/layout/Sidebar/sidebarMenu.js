import {
  LayoutDashboard,
  BarChart3,
  Users,
  FileText,
  PiggyBank,
  KeyRound,
  CalendarDays,
  Building2,
  Banknote,
  ScrollText,
  Database,
  Landmark,
  UserCog,
  ShieldCheck,
  Receipt,
  Settings,
  HandCoins,
  Wallet,
  Percent,
  Coins,
} from "lucide-react";
import { PERMISSIONS, ROLES } from "../../../../constants/permissions.js";

export const NAV_SECTIONS = [
  {
    label: "Dashboard",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
      {
        label: "Analytics",
        icon: BarChart3,
        path: "/analytics",
        permission: PERMISSIONS.ANALYTICS_VIEW,
      },
    ],
  },

  {
    label: "Customer Management",
    items: [
      {
        label: "Customers",
        icon: Users,
        path: "/customers",
        permission: PERMISSIONS.CUSTOMER_VIEW,
      },
    ],
  },

  {
    label: "Loan Management",
    items: [
      {
        label: "Loan Applications",
        icon: FileText,
        path: "/loan-applications",
        permission: PERMISSIONS.LOAN_APPLICATION_VIEW,
      },
      {
        label: "Loan Plans",
        icon: PiggyBank,
        path: "/loan-plans",
        permission: PERMISSIONS.LOAN_PLAN_VIEW,
      },
      {
        label: "Hand Loans",
        icon: HandCoins,
        path: "/hand-loans",
        permission: PERMISSIONS.HAND_LOAN_VIEW,
      },
      {
        label: "Personal Chits",
        icon: Wallet,
        path: "/personal-chits",
        permission: PERMISSIONS.PERSONAL_CHIT_VIEW,
      },
      {
        label: "Interest-Only Loan Plans",
        icon: Percent,
        path: "/interest-loan-plans",
        permission: [
          PERMISSIONS.INTEREST_LOAN_PLAN_VIEW,
          PERMISSIONS.LOAN_PLAN_VIEW,
        ],
      },
      {
        label: "Customer Interest Loans",
        icon: Receipt,
        path: "/interest-only-loans",
        permission: [
          PERMISSIONS.INTEREST_ONLY_LOAN_VIEW,
          PERMISSIONS.LOAN_VIEW,
        ],
      },
    ],
  },

  {
    label: "Collections",
    items: [
      {
        label: "Loan Collections",
        icon: KeyRound,
        path: "/loan-collections",
        permission: PERMISSIONS.LOAN_COLLECTION_VIEW,
      },
      {
        label: "Due Collections",
        icon: CalendarDays,
        path: "/due-collections",
        permission: PERMISSIONS.DUE_COLLECTION_VIEW,
      },
      {
        label: "Interest Collections",
        icon: Coins,
        path: "/interest-collections",
        permission: [
          PERMISSIONS.INTEREST_COLLECTION_VIEW,
          PERMISSIONS.LOAN_COLLECTION_VIEW,
          PERMISSIONS.COLLECTION_VIEW,
          PERMISSIONS.INTEREST_ONLY_LOAN_VIEW,
        ],
      },
    ],
  },

  {
    label: "Organization",
    items: [
      {
        label: "Companies",
        icon: Building2,
        path: "/companies-details",
        permission: PERMISSIONS.COMPANY_VIEW,
      },
      {
        label: "Bank Accounts",
        icon: Banknote,
        path: "/bank-accounts",
        permission: PERMISSIONS.BANK_ACCOUNT_VIEW,
      },
      {
        label: "Bank Transactions",
        icon: ScrollText,
        path: "/bank-transactions",
        permission: PERMISSIONS.BANK_TRANSACTION_VIEW,
      },
      {
        label: "Asset Categories",
        icon: Database,
        path: "/asset-categories",
        permission: PERMISSIONS.ASSET_CATEGORY_VIEW,
      },
      {
        label: "Assets",
        icon: Landmark,
        path: "/assets",
        permission: PERMISSIONS.ASSET_VIEW,
      },
    ],
  },

  // {
  //   label: "Administration",
  //   items: [
  //     {
  //       label: "Users",
  //       icon: UserCog,
  //       path: "/users",
  //       permission: PERMISSIONS.USER_VIEW,
  //     },
  //     {
  //       label: "Roles",
  //       icon: ShieldCheck,
  //       path: "/roles",
  //       permission: PERMISSIONS.ROLE_VIEW,
  //     },
  //     {
  //       label: "Role Permissions",
  //       icon: KeyRound,
  //       path: "/role-permissions",
  //       permission: PERMISSIONS.ROLE_PERMISSION_VIEW,
  //     },
  //     {
  //       label: "User Permissions",
  //       icon: KeyRound,
  //       path: "/user-permissions",
  //       permission: PERMISSIONS.USER_PERMISSION_VIEW,
  //     },
  //   ],
  // },

  {
    label: "Administration",
    items: [
      {
        label: "Users",
        icon: UserCog,
        path: "/users",
        roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
      },
      {
        label: "Roles",
        icon: ShieldCheck,
        path: "/roles",
        roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
      },
      {
        label: "Role Permissions",
        icon: KeyRound,
        path: "/role-permissions",
        roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
      },
      {
        label: "User Permissions",
        icon: KeyRound,
        path: "/user-permissions",
        roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
      },
    ],
  },

  {
    label: "Reports",
    items: [
      {
        label: "Loan Reports",
        icon: BarChart3,
        path: "/loan-reports",
        permission: PERMISSIONS.LOAN_REPORT_VIEW,
      },
      {
        label: "Loan Installment Reports",
        icon: CalendarDays,
        path: "/installment-reports",
        permission: PERMISSIONS.LOAN_INSTALLMENT_REPORT_VIEW,
      },
      {
        label: "Collection Reports",
        icon: Receipt,
        path: "/reports/loan-collections",
        permission: PERMISSIONS.COLLECTION_REPORT_VIEW,
      },
      {
        label: "Interest Collection Reports",
        icon: Coins,
        path: "/reports/interest-collections",
        permission: [
          PERMISSIONS.INTEREST_COLLECTION_REPORT_VIEW,
          PERMISSIONS.COLLECTION_REPORT_VIEW,
          PERMISSIONS.INTEREST_COLLECTION_VIEW,
          PERMISSIONS.INTEREST_ONLY_LOAN_VIEW,
        ],
      },
      {
        label: "Customer Reports",
        icon: Users,
        path: "/customer-reports",
        permission: PERMISSIONS.CUSTOMER_REPORT_VIEW,
      },
    ],
  },

  {
    label: "System",
    items: [
      {
        label: "Settings",
        icon: Settings,
        path: "/settings",
        permission: PERMISSIONS.SETTINGS_VIEW,
      },
    ],
  },
];
