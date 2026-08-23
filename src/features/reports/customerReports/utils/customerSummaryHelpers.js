export function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getFullName(row) {
  if (!row) return "—";
  if (row.name && row.name.trim()) return row.name;
  const name = [row.first_name, row.last_name].filter(Boolean).join(" ");
  return name.trim() || `Customer #${row.id || row.customer_id || "—"}`;
}

export function getPendingPercent(row) {
  if (!row) return 0;
  const total = Number(row.total_loan ?? row.total_amount ?? 0);
  if (total <= 0) return 0;
  const pending = Number(row.total_pending || 0);
  return Math.min(100, Math.max(0, Math.round((pending / total) * 100)));
}

export function exportToCsv(rows = [], filename = "customer-loan-summary.csv") {
  const safeRows = Array.isArray(rows) ? rows : [];
  const headers = [
    "Customer",
    "Mobile",
    "Total Loans",
    "Total Loan Amount",
    "Total Paid",
    "Total Pending",
  ];
  const lines = safeRows.map((r) =>
    [
      getFullName(r),
      r.mobile || "",
      r.total_loans ?? 0,
      r.total_loan ?? r.total_amount ?? 0,
      r.total_paid ?? 0,
      r.total_pending ?? 0,
    ]
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(","),
  );
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
