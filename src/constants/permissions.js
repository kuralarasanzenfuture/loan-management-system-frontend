// Adjust this list to match the actual permission keys your backend expects.
// Each entry: { key: <sent to API>, label: <shown in UI> }
export const AVAILABLE_PERMISSIONS = [
  { key: "view_dashboard", label: "View Dashboard" },
  { key: "manage_loans", label: "Manage Loans" },
  { key: "view_loans", label: "View Loans" },
  { key: "manage_borrowers", label: "Manage Borrowers" },
  { key: "view_borrowers", label: "View Borrowers" },
  { key: "manage_repayments", label: "Manage Repayments" },
  { key: "view_reports", label: "View Reports" },
  { key: "manage_users", label: "Manage Users & Roles" },
];
