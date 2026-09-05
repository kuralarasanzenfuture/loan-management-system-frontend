/**
 * printInterestReceipt.js
 * Prints a clean, official single-page A5 landscape Cash Receipt / Invoice
 * for an Interest-Only Loan repayment or interest collection.
 */

export function printInterestReceipt({
  loan = {},
  payment = {},
  allocations = [],
  customer = null,
  company = {},
  remainingOutstanding = null,
}) {
  if (!payment && !loan) return;

  // 1. Company Information
  const companyName =
    company?.company_name ||
    company?.legal_name ||
    "LOAN MANAGEMENT FINANCE";
  const addressParts = [
    company?.address_line_1,
    company?.address_line_2,
    company?.city,
    company?.state
      ? `${company.state} ${company?.pincode || ""}`
      : company?.pincode,
  ].filter(Boolean);
  const fullAddress = addressParts.length
    ? addressParts.join(", ")
    : "Head Office Commercial Complex";
  const companyPhone = company?.phone || "+91 98765 43210";
  const companyEmail = company?.email || "support@loanmgmt.com";
  const taxIdRow = [
    company?.gst_number ? `GSTIN: ${company.gst_number}` : "",
    company?.pan_number ? `PAN: ${company.pan_number}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

  // 2. Customer & Loan Information
  const customerName =
    customer?.customer_name ||
    customer?.name ||
    payment?.customer_name ||
    loan?.customer_name ||
    "Valued Borrower";

  const customerNo =
    customer?.customer_no ||
    payment?.customer_no ||
    loan?.customer_no ||
    (customer?.id ? `CUST-${customer.id}` : loan?.customer_id ? `CUST-${loan.customer_id}` : "—");

  const customerMobile =
    customer?.mobile ||
    customer?.customer_mobile ||
    payment?.customer_mobile ||
    loan?.customer_mobile ||
    loan?.mobile ||
    "—";

  const loanNo =
    loan?.loan_no ||
    payment?.loan_no ||
    (loan?.id ? `IOL-${loan.id}` : "—");

  const interestRate = loan?.interest_rate
    ? `${loan.interest_rate}% / ${loan?.interest_frequency || "month"}`
    : "—";

  // 3. Payment Details
  const paymentAmount = Number(
    payment?.payment_amount || payment?.amount || 0
  );
  const paymentNo = payment?.payment_no || payment?.id || "1";
  const receiptNo =
    payment?.receipt_no ||
    `REC-${loanNo.replace(/[^a-zA-Z0-9]/g, "")}-${paymentNo}-${Date.now().toString().slice(-4)}`;

  const paymentDate = payment?.payment_date
    ? new Date(payment.payment_date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

  const paymentMode = (payment?.payment_mode || "cash").toUpperCase();
  const reference =
    payment?.transaction_reference ||
    (payment?.cheque_number ? `Cheque #${payment.cheque_number}` : null);
  const receivedBy = payment?.received_by_name || "Authorized Cashier";

  // 4. Allocations Breakdown
  const allocList =
    Array.isArray(allocations) && allocations.length > 0
      ? allocations
      : Array.isArray(payment?.allocations) && payment.allocations.length > 0
      ? payment.allocations
      : [];

  let interestAllocated = 0;
  let principalAllocated = 0;

  allocList.forEach((a) => {
    const amt = Number(a.amount || 0);
    if (a.allocation_type === "interest" || a.type === "interest") {
      interestAllocated += amt;
    } else if (
      a.allocation_type === "principal" ||
      a.type === "principal"
    ) {
      principalAllocated += amt;
    }
  });

  // If no allocations breakdown was returned, infer from payment
  if (allocList.length === 0) {
    interestAllocated = paymentAmount;
  }

  // 5. Remaining Balances
  const remInterest =
    payment?.remaining_interest !== undefined
      ? Number(payment.remaining_interest)
      : Number(loan?.outstanding_interest || 0);

  const remPrincipal =
    payment?.remaining_principal !== undefined
      ? Number(payment.remaining_principal)
      : Number(loan?.outstanding_principal || 0);

  const totalOutstandingRemaining =
    remainingOutstanding !== null && remainingOutstanding !== undefined
      ? Number(remainingOutstanding)
      : payment?.remaining_outstanding !== undefined
      ? Number(payment.remaining_outstanding)
      : Number((remInterest + remPrincipal).toFixed(2));

  const loanStatus =
    payment?.loan_status || loan?.status || (totalOutstandingRemaining <= 0 ? "completed" : "active");

  const fmtCurrency = (n) =>
    `₹${Number(n || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Payment Receipt - ${receiptNo}</title>
  <style>
    @page {
      size: A5 landscape;
      margin: 8mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    }
    body {
      background: #fff;
      color: #0f172a;
      padding: 12px;
      font-size: 11px;
      line-height: 1.35;
    }
    .receipt-container {
      border: 2px solid #0f172a;
      border-radius: 8px;
      padding: 14px 16px;
      max-width: 780px;
      margin: 0 auto;
      background: #fff;
    }
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }
    .company-title {
      font-size: 16px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
    }
    .company-sub {
      font-size: 10px;
      color: #475569;
      margin-top: 1px;
    }
    .receipt-badge {
      text-align: right;
    }
    .badge-title {
      font-size: 11px;
      font-weight: 800;
      background: #0f172a;
      color: #fff;
      padding: 3px 10px;
      border-radius: 4px;
      display: inline-block;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .receipt-no {
      font-size: 11px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 3px;
      font-family: monospace;
    }

    /* Hero Amount Bar */
    .hero-banner {
      background: #f0fdf4;
      border: 1.5px solid #16a34a;
      border-radius: 6px;
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .hero-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      color: #15803d;
      letter-spacing: 0.5px;
    }
    .hero-meta {
      font-size: 10px;
      color: #166534;
      margin-top: 1px;
    }
    .hero-amount {
      font-size: 20px;
      font-weight: 900;
      color: #14532d;
      font-family: monospace;
    }
    .status-tag {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      background: #16a34a;
      color: #fff;
      margin-top: 2px;
    }

    /* Two Columns */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 10px;
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 7px 10px;
    }
    .card-title {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 4px;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 2px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
      font-size: 10.5px;
    }
    .info-row:last-child {
      margin-bottom: 0;
    }
    .label {
      color: #64748b;
    }
    .val {
      font-weight: 600;
      color: #0f172a;
    }

    /* Allocations Table */
    .alloc-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      font-size: 10.5px;
    }
    .alloc-table th {
      background: #f1f5f9;
      color: #475569;
      text-align: left;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 4px 8px;
      border: 1px solid #cbd5e1;
    }
    .alloc-table td {
      padding: 4px 8px;
      border: 1px solid #e2e8f0;
      color: #1e293b;
    }
    .alloc-table tr:nth-child(even) td {
      background: #f8fafc;
    }
    .alloc-table tfoot td {
      font-weight: 700;
      background: #f1f5f9;
      border-top: 1.5px solid #94a3b8;
    }

    /* Signatures */
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 18px;
      padding-top: 10px;
      border-top: 1px dashed #cbd5e1;
    }
    .sign-box {
      text-align: center;
      width: 160px;
    }
    .sign-line {
      border-top: 1px solid #0f172a;
      margin-top: 28px;
      margin-bottom: 3px;
    }
    .sign-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      color: #475569;
    }

    /* Footer */
    .footer {
      text-align: center;
      font-size: 8.5px;
      color: #94a3b8;
      margin-top: 8px;
    }

    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="company-title">${companyName}</div>
        <div class="company-sub">${fullAddress}</div>
        <div class="company-sub">Phone: ${companyPhone} | Email: ${companyEmail}</div>
        ${taxIdRow ? `<div class="company-sub">${taxIdRow}</div>` : ""}
      </div>
      <div class="receipt-badge">
        <div class="badge-title">Official Payment Receipt</div>
        <div class="receipt-no">${receiptNo}</div>
        <div class="company-sub" style="margin-top: 2px;">Date: ${paymentDate}</div>
      </div>
    </div>

    <!-- Amount Hero Banner -->
    <div class="hero-banner">
      <div>
        <div class="hero-label">Total Amount Collected</div>
        <div class="hero-meta">
          Mode: <strong>${paymentMode}</strong> ${reference ? `(${reference})` : ""} · Cashier: ${receivedBy}
        </div>
      </div>
      <div style="text-align: right;">
        <div class="hero-amount">${fmtCurrency(paymentAmount)}</div>
        <span class="status-tag">Payment Successful</span>
      </div>
    </div>

    <!-- 2 Column Overview -->
    <div class="grid-2">
      <!-- Customer Info -->
      <div class="info-card">
        <div class="card-title">Borrower & Loan Details</div>
        <div class="info-row">
          <span class="label">Customer Name:</span>
          <span class="val">${customerName}</span>
        </div>
        <div class="info-row">
          <span class="label">Customer ID / Mobile:</span>
          <span class="val">${customerNo} · ${customerMobile}</span>
        </div>
        <div class="info-row">
          <span class="label">Loan Account #:</span>
          <span class="val" style="font-family: monospace;">${loanNo}</span>
        </div>
        <div class="info-row">
          <span class="label">Interest Scheme:</span>
          <span class="val">${interestRate}</span>
        </div>
      </div>

      <!-- Balance Snapshot -->
      <div class="info-card">
        <div class="card-title">Post-Payment Outstanding Balance</div>
        <div class="info-row">
          <span class="label">Outstanding Interest:</span>
          <span class="val" style="color: ${remInterest > 0 ? "#b45309" : "#15803d"}; font-weight: 700;">
            ${fmtCurrency(remInterest)}
          </span>
        </div>
        <div class="info-row">
          <span class="label">Outstanding Principal:</span>
          <span class="val">${fmtCurrency(remPrincipal)}</span>
        </div>
        <div class="info-row" style="border-top: 1px dashed #cbd5e1; padding-top: 2px; margin-top: 2px;">
          <span class="label" style="font-weight: 700; color: #0f172a;">Total Remaining Due:</span>
          <span class="val" style="font-weight: 800; color: ${totalOutstandingRemaining > 0 ? "#b91c1c" : "#15803d"};">
            ${fmtCurrency(totalOutstandingRemaining)}
          </span>
        </div>
        <div class="info-row">
          <span class="label">Loan Status:</span>
          <span class="val" style="text-transform: capitalize;">${loanStatus}</span>
        </div>
      </div>
    </div>

    <!-- Breakdown Table -->
    <table class="alloc-table">
      <thead>
        <tr>
          <th style="width: 50%;">Payment Allocation Description</th>
          <th style="width: 25%;">Allocation Category</th>
          <th style="width: 25%; text-align: right;">Amount Allocated</th>
        </tr>
      </thead>
      <tbody>
        ${
          allocList.length > 0
            ? allocList
                .map(
                  (a) => `
          <tr>
            <td>
              Schedule ${a.schedule_no ? `#${a.schedule_no}` : (a.schedule_id ? `#${a.schedule_id}` : "Installment")}
              ${a.due_date ? `(Due: ${new Date(a.due_date).toLocaleDateString("en-IN")})` : ""}
            </td>
            <td style="text-transform: capitalize;">${a.allocation_type || a.type || "Interest"}</td>
            <td style="text-align: right; font-weight: 600;">${fmtCurrency(a.amount)}</td>
          </tr>`
                )
                .join("")
            : `
          <tr>
            <td>Interest Repayment Allocation</td>
            <td>Interest Dues</td>
            <td style="text-align: right; font-weight: 600;">${fmtCurrency(interestAllocated)}</td>
          </tr>
          ${
            principalAllocated > 0
              ? `
          <tr>
            <td>Principal Balance Repayment</td>
            <td>Principal</td>
            <td style="text-align: right; font-weight: 600;">${fmtCurrency(principalAllocated)}</td>
          </tr>`
              : ""
          }
        `
        }
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2">Total Payment Credited</td>
          <td style="text-align: right;">${fmtCurrency(paymentAmount)}</td>
        </tr>
      </tfoot>
    </table>

    <!-- Signatures -->
    <div class="signatures">
      <div class="sign-box">
        <div class="sign-line"></div>
        <div class="sign-label">Customer / Depositor</div>
      </div>
      <div class="sign-box">
        <div class="sign-line"></div>
        <div class="sign-label">Authorized Cashier / Officer</div>
      </div>
    </div>

    <!-- Footer Note -->
    <div class="footer">
      This is a computer generated official payment receipt and invoice acknowledgment. Thank you for your payment.
    </div>
  </div>

  <script>
    window.addEventListener("DOMContentLoaded", function() {
      setTimeout(function() {
        window.print();
      }, 350);
    });
  </script>
</body>
</html>
  `;

  try {
    const printWindow = window.open(
      "",
      "_blank",
      "width=880,height=720,menubar=no,toolbar=no,location=no,status=no"
    );
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      return;
    }
  } catch (err) {
    console.warn("Direct window.open restricted:", err);
  }

  // Fallback hidden iframe
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  iframe.contentWindow.focus();
  setTimeout(() => {
    iframe.contentWindow.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1500);
  }, 400);
}
