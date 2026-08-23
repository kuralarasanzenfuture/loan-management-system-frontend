export const STATUS_STYLES = {
  pending: "badge-ghost",
  partial: "badge-warning badge-outline",
  paid: "badge-success badge-outline",
  overdue: "badge-error badge-outline",
};

export function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getFullName(row) {
  return [row.first_name, row.last_name].filter(Boolean).join(" ");
}

export function exportToCsv(rows, filename = "installment-report.csv") {
  const headers = [
    "Loan No",
    "Customer",
    "Mobile",
    "Installment #",
    "Due Date",
    "Total Due",
    "Paid Amount",
    "Balance",
    "Status",
    "Paid Date",
  ];
  const lines = rows.map((r) =>
    [
      r.loan_no,
      getFullName(r),
      r.mobile,
      r.installment_no,
      r.due_date,
      r.total_due,
      r.paid_amount,
      r.balance_amount,
      r.status,
      r.paid_date || "",
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
