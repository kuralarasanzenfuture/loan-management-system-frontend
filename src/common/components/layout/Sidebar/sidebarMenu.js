import {
  LayoutDashboard,
  BarChart3,
  Users,
  UserCog,
  ShieldCheck,
  Building2,
  GitBranch,
  Wallet,
  Landmark,
  FileText,
  ClipboardCheck,
  Receipt,
  CalendarDays,
  BadgeDollarSign,
  AlertTriangle,
  Bell,
  FolderOpen,
  FileArchive,
  CreditCard,
  Banknote,
  Calculator,
  PiggyBank,
  History,
  Settings,
  Database,
  Activity,
  KeyRound,
  ScrollText,
  Mail,
  Smartphone,
} from "lucide-react";

export const NAV_SECTIONS = [
  {
    label: "Dashboard",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
      },
      {
        label: "Analytics",
        icon: BarChart3,
        path: "/analytics",
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
      },
      {
        label: "Customer Documents",
        icon: FolderOpen,
        path: "/customer-documents",
      },
      {
        label: "Guarantors",
        icon: UserCog,
        path: "/guarantors",
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
        badge: "18",
      },
      {
        label: "Loan Approval",
        icon: ClipboardCheck,
        path: "/loan-approval",
      },
      {
        label: "Active Loans",
        icon: Landmark,
        path: "/active-loans",
      },
      {
        label: "Loan Plans",
        icon: PiggyBank,
        path: "/loan-plans",
      },
      {
        label: "Loan Types",
        icon: Calculator,
        path: "/loan-types",
      },
      {
        label: "Interest Rates",
        icon: BadgeDollarSign,
        path: "/interest-rates",
      },
      {
        label: "Penalty Rules",
        icon: AlertTriangle,
        path: "/penalty-rules",
      },
      {
        label: "Loan Closure",
        icon: FileArchive,
        path: "/loan-closure",
      },
    ],
  },

  {
    label: "Collections",
    items: [
      {
        label: "EMI Collection",
        icon: Wallet,
        path: "/emi-collection",
      },
      {
        label: "Receipts",
        icon: Receipt,
        path: "/receipts",
      },
      {
        label: "Due Collections",
        icon: CalendarDays,
        path: "/due-collections",
      },
      {
        label: "Penalty Collection",
        icon: AlertTriangle,
        path: "/penalty-collection",
      },
    ],
  },

  {
    label: "Finance",
    items: [
      {
        label: "Income",
        icon: Banknote,
        path: "/income",
      },
      {
        label: "Expenses",
        icon: CreditCard,
        path: "/expenses",
      },
      {
        label: "Cash Book",
        icon: PiggyBank,
        path: "/cash-book",
      },
      {
        label: "Transactions",
        icon: History,
        path: "/transactions",
      },
    ],
  },

  {
    label: "Organization",
    items: [
      {
        label: "Branches",
        icon: GitBranch,
        path: "/branches",
      },
      {
        label: "Companies",
        icon: Building2,
        path: "/companies-details",
      },
      {
        label: "bank Accounts",
        icon: Banknote,
        path: "/bank-accounts",
      },
      {
        label: "bank Transactions",
        icon: ScrollText,
        path: "/bank-transactions",
      },
      {
        label: "Assets categories",
        icon: Database,
        path: "/asset-categories",
      },
      {
        label: "Assets",
        icon: Landmark,
        path: "/assets",
      }
    ],
  },

  {
    label: "Administration",
    items: [
      {
        label: "Users",
        icon: UserCog,
        path: "/users",
      },
      {
        label: "Roles",
        icon: ShieldCheck,
        path: "/roles",
      },
      {
        label: "Role Permissions",
        icon: KeyRound,
        path: "/role-permissions",
      },
      {
        label: "Audit Logs",
        icon: Activity,
        path: "/audit-logs",
      },
    ],
  },

  {
    label: "Communication",
    items: [
      {
        label: "SMS",
        icon: Smartphone,
        path: "/sms",
      },
      {
        label: "Email",
        icon: Mail,
        path: "/email",
      },
      {
        label: "Notifications",
        icon: Bell,
        path: "/notifications",
      },
    ],
  },

  {
    label: "Reports",
    items: [
      {
        label: "Loan Reports",
        icon: BarChart3,
        path: "/reports/loans",
      },
      {
        label: "Collection Reports",
        icon: Receipt,
        path: "/reports/collections",
      },
      {
        label: "Customer Reports",
        icon: Users,
        path: "/reports/customers",
      },
      {
        label: "Financial Reports",
        icon: Wallet,
        path: "/reports/finance",
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
      },
      {
        label: "Database Backup",
        icon: Database,
        path: "/database-backup",
      },
      {
        label: "Activity Logs",
        icon: ScrollText,
        path: "/activity-logs",
      },
    ],
  },
];
