import dayjs from "dayjs";

/**
 * Formats a numeric value into INR currency format (e.g., ₹1,500.00).
 * Handles null, undefined, strings, and numbers safely.
 */
export const formatCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Formats a date string into readable DD MMM YYYY, hh:mm A.
 */
export const formatDateTime = (date) => {
  if (!date) return "—";
  const d = dayjs(date);
  return d.isValid() ? d.format("DD MMM YYYY, hh:mm A") : "—";
};

/**
 * Formats a date string into readable DD MMM YYYY.
 */
export const formatDate = (date) => {
  if (!date) return "—";
  const d = dayjs(date);
  return d.isValid() ? d.format("DD MMM YYYY") : "—";
};

/**
 * Returns customer full name safely from a row.
 */
export const getFullName = (row) => {
  if (!row) return "—";
  const first = (row.first_name || "").trim();
  const last = (row.last_name || "").trim();
  const full = `${first} ${last}`.trim();
  return full || "Unknown Customer";
};

/**
 * Exports interest collection reports data to CSV.
 */
export const exportInterestCollectionToCsv = (data = [], filename = "interest-collection-report.csv") => {
  if (!Array.isArray(data) || data.length === 0) {
    alert("No data available to export.");
    return;
  }

  const headers = [
    "Payment #",
    "Date & Time",
    "Customer Name",
    "Customer ID",
    "Mobile",
    "Loan Number",
    "Plan Name",
    "Payment Mode",
    "Total Paid (INR)",
    "Interest Paid (INR)",
    "Principal Paid (INR)",
    "Reference No",
    "Cheque No",
    "Received By",
    "Remarks",
  ];

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = data.map((r) => [
    escapeCsv(`#${r.payment_no || ""}`),
    escapeCsv(formatDateTime(r.payment_date)),
    escapeCsv(getFullName(r)),
    escapeCsv(r.customer_no || r.customer_id || ""),
    escapeCsv(r.mobile || ""),
    escapeCsv(r.loan_no || ""),
    escapeCsv(r.plan_name || ""),
    escapeCsv(r.payment_mode ? r.payment_mode.toUpperCase() : "CASH"),
    escapeCsv(Number(r.payment_amount || 0).toFixed(2)),
    escapeCsv(Number(r.interest_amount || 0).toFixed(2)),
    escapeCsv(Number(r.principal_amount || 0).toFixed(2)),
    escapeCsv(r.transaction_reference || ""),
    escapeCsv(r.cheque_number || ""),
    escapeCsv(r.received_by_name || ""),
    escapeCsv(r.remarks || ""),
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8,\uFEFF" +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
