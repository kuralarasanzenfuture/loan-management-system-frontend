import React from "react";
import { useLocation } from "react-router-dom";
import {
  FileText,
  Landmark,
  Users,
  Wallet,
  BarChart3,
  FolderOpen,
  Settings,
  HelpCircle,
  Plus,
} from "lucide-react";

const CONFIGS = {
  reports: {
    title: "Financial Reports",
    subtitle: "Consolidated performance data, risk analysis, and ledger statistics.",
    icon: BarChart3,
    color: "text-primary bg-primary/10",
  },
  applications: {
    title: "Loan Applications",
    subtitle: "Manage, review, and score incoming credit requests.",
    icon: FileText,
    color: "text-info bg-info/10",
  },
  loans: {
    title: "Active Loans Portfolio",
    subtitle: "Track disbursements, interest schedules, and repayment statuses.",
    icon: Landmark,
    color: "text-success bg-success/10",
  },
  repayments: {
    title: "Repayments & Amortization",
    subtitle: "Record deposits, view payment schedules, and clear invoices.",
    icon: Wallet,
    color: "text-warning bg-warning/10",
  },
  borrowers: {
    title: "Borrowers Registry",
    subtitle: "View customer credit histories, KYC verifications, and profiles.",
    icon: Users,
    color: "text-secondary bg-secondary/10",
  },
  documents: {
    title: "Document Vault",
    subtitle: "Stored contracts, electronic signatures, and collateral proofs.",
    icon: FolderOpen,
    color: "text-accent bg-accent/10",
  },
  settings: {
    title: "System Settings",
    subtitle: "Adjust loan underwriting boundaries, APR defaults, and webhooks.",
    icon: Settings,
    color: "text-neutral bg-neutral/10",
  },
};

export default function PlaceholderPage() {
  const location = useLocation();
  const path = location.pathname.split("/").pop() || "";
  const config = CONFIGS[path] || {
    title: path.charAt(0).toUpperCase() + path.slice(1),
    subtitle: "Manage all operations related to this module.",
    icon: HelpCircle,
    color: "text-primary bg-primary/10",
  };

  const Icon = config.icon;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-2xl shrink-0 ${config.color}`}>
            <Icon size={24} className="stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-base-content">
              {config.title}
            </h1>
            <p className="text-xs md:text-sm text-base-content/50 mt-1">
              {config.subtitle}
            </p>
          </div>
        </div>
        
        {/* Primary Action Button */}
        <div>
          <button className="btn btn-primary btn-sm rounded-xl gap-1.5 shadow-md shadow-primary/20">
            <Plus size={16} />
            <span>Create {config.title.split(" ").pop() || "Record"}</span>
          </button>
        </div>
      </div>

      {/* Placeholder Body (gorgeous skeletal view) */}
      <div className="card bg-base-100 border border-base-300 shadow-xs rounded-2xl p-8 md:p-12 text-center max-w-2xl mx-auto space-y-4">
        <div className={`mx-auto p-4 rounded-full w-14 h-14 flex items-center justify-center ${config.color}`}>
          <Icon size={24} className="animate-pulse" />
        </div>
        
        <div className="space-y-1">
          <h2 className="text-base font-bold text-base-content">
            No active entries found
          </h2>
          <p className="text-xs text-base-content/50 max-w-sm mx-auto leading-relaxed">
            There are no real database records stored for this prototype screen yet. Use the action button above to start seeding mock data.
          </p>
        </div>
        
        <div>
          <button className="btn btn-ghost btn-sm text-xs font-bold text-primary hover:bg-primary/5 rounded-lg">
            Import Excel/CSV Template
          </button>
        </div>
      </div>
    </div>
  );
}
