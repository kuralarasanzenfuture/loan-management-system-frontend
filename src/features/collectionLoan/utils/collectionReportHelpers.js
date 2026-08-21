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

// CSV export — client-side, matches exactly the columns shown in the table
export function exportToCsv(rows, filename = "collection-report.csv") {
  const headers = [
    "Loan No",
    "Customer",
    "Mobile",
    "Installment #",
    "Paid Amount",
    "Paid Date",
  ];
  const lines = rows.map((r) =>
    [
      r.loan_no,
      getFullName(r),
      r.mobile,
      r.installment_no,
      r.paid_amount,
      r.paid_date ? new Date(r.paid_date).toLocaleDateString("en-IN") : "",
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
