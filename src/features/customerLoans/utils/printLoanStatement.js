/**
 * printLoanStatement.js
 *
 * Provides distinct, professional print outputs for loan data:
 * 1. "statement" / "all": Full Loan Statement & Passbook (All Installments)
 * 2. "paid": Paid Payments Receipt (ONLY Paid Installments with payment dates & amounts)
 * 3. "pending": Outstanding Dues & Collection Demand (ONLY Unpaid & Overdue Installments)
 * 4. "summary": 1-Page Account Summary Slip (NO TABLE - Clean financial certificate)
 */

export function printLoanStatement({
  loan,
  installments = [],
  company = {},
  customer = null,
  plan = null,
  mode = "statement", // "statement" | "paid" | "pending" | "summary"
}) {
  if (!loan) return;

  // 1. Resolve Company Information
  const companyName =
    company?.company_name || company?.legal_name || "CM MICRO FINANCE PVT LTD";
  const tradeName = company?.trade_name || "";
  const addressParts = [
    company?.address_line_1,
    company?.address_line_2,
    company?.landmark,
    company?.city,
    company?.state ? `${company.state}${company?.pincode ? ` - ${company.pincode}` : ""}` : company?.pincode,
  ].filter(Boolean);
  const fullAddress = addressParts.length
    ? addressParts.join(", ")
    : "Main Road, Commercial Complex, Head Office";
  const companyPhone = company?.phone || company?.alternate_phone || "+91 98765 43210";
  const companyEmail = company?.email || "support@cmmicro.com";
  const gstNumber = company?.gst_number ? `GSTIN: ${company.gst_number}` : "";
  const panNumber = company?.pan_number ? `PAN: ${company.pan_number}` : "";
  const taxIdRow = [gstNumber, panNumber].filter(Boolean).join(" | ");

  // 2. Resolve Customer Information
  const customerFullName =
    customer?.customer_name ||
    customer?.name ||
    loan.customer_name ||
    [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") ||
    "—";

  const customerCode =
    customer?.customer_no || loan.customer_no || (loan.customer_id ? `CUST-${loan.customer_id}` : "—");
  const customerMobile =
    customer?.mobile || loan.customer_mobile || loan.mobile || "—";
  const customerAadhaar =
    customer?.aadhaar_no ? `•••• •••• ${customer.aadhaar_no.slice(-4)}` : "—";
  const customerAddress = [
    customer?.address || loan.address,
    customer?.city || loan.city,
    customer?.district,
    customer?.state,
    customer?.pincode,
  ]
    .filter(Boolean)
    .join(", ") || "—";
  const customerOccupation =
    customer?.occupation || loan.occupation || loan.business || "Business / Self-Employed";

  // 3. Format Helpers
  const formatMoney = (v) =>
    Number(v || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    });

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return String(d);
    }
  };

  const safeInstallments = Array.isArray(installments) ? installments : [];
  const totalInstallmentsCount = safeInstallments.length;
  const paidCount = safeInstallments.filter((i) => i.status === "paid" || Number(i.paid_amount) > 0).length;
  const overdueCount = safeInstallments.filter((i) => i.status === "overdue").length;
  const pendingCount = safeInstallments.filter((i) => i.status !== "paid" && (Number(i.paid_amount) || 0) <= 0).length;

  const totalSanctioned = Number(loan.loan_amount || 0);
  const netDisbursed = Number(loan.net_disbursed_amount || loan.loan_amount || 0);
  const totalRepayable = safeInstallments.reduce(
    (sum, i) => sum + (Number(i.total_due ?? i.principal_amount ?? i.installment_amount) || 0),
    0
  ) || Number(loan.total_repayment || totalSanctioned);

  const totalCollected = safeInstallments.reduce(
    (sum, i) => sum + (Number(i.paid_amount) || 0),
    0
  );
  const totalPenaltyPaid = safeInstallments.reduce(
    (sum, i) => sum + (i.status === "paid" ? (Number(i.penalty_amount) || 0) : 0),
    0
  );
  const totalPenaltyDue = safeInstallments.reduce(
    (sum, i) => sum + (i.status !== "paid" ? (Number(i.penalty_amount) || 0) : 0),
    0
  );
  const balanceOutstanding = Math.max(0, totalRepayable - totalCollected);
  const repaymentPercentage = totalRepayable > 0 ? Math.round((totalCollected / totalRepayable) * 100) : 0;

  const printTimestamp = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const docReference = `REF-${loan.loan_no || loan.id}-${Date.now().toString().slice(-6)}`;

  // =========================================================================
  // 4. DETERMINE MODE DATA & PRESENTATION
  // =========================================================================

  let documentTitle = "OFFICIAL LOAN STATEMENT & PASSBOOK";
  let documentSubtitle = "Complete account ledger, installment records, and transaction history";
  let modeBadge = "FULL STATEMENT (ALL DATA)";
  let filteredList = safeInstallments;

  if (mode === "paid") {
    documentTitle = "PAYMENT RECEIPTS & COLLECTION STATEMENT";
    documentSubtitle = "Certified record of cleared installments and received repayments";
    modeBadge = "PAID DATA ONLY";
    filteredList = safeInstallments.filter((i) => i.status === "paid" || Number(i.paid_amount) > 0);
  } else if (mode === "pending") {
    documentTitle = "OUTSTANDING DUES & COLLECTION DEMAND STATEMENT";
    documentSubtitle = "Notice of pending, due, and overdue repayment installments";
    modeBadge = "OUTSTANDING DUES ONLY";
    filteredList = safeInstallments.filter(
      (i) => i.status !== "paid" || (Number(i.total_due || i.principal_amount) > Number(i.paid_amount))
    );
  } else if (mode === "summary") {
    documentTitle = "LOAN ACCOUNT SUMMARY & BALANCE SLIP";
    documentSubtitle = "Executive credit certificate and financial status snapshot";
    modeBadge = "ACCOUNT SUMMARY SLIP";
    filteredList = []; // No table for summary slip!
  }

  // Generate Table HTML according to mode
  let tableSectionHtml = "";

  if (mode === "summary") {
    // NO TABLE for Summary Slip mode - render certificate & statement block
    tableSectionHtml = `
      <div class="summary-slip-card">
        <div class="slip-title">Official Account Balance Certificate</div>
        <p class="slip-body">
          This is to certify that <strong>${customerFullName}</strong> (Customer ID: <strong>${customerCode}</strong>)
          maintains Loan Facility <strong>#${loan.loan_no || loan.id}</strong> under 
          <strong>${loan.plan_name || plan?.plan_name || "Microfinance Credit Scheme"}</strong>.
        </p>

        <div class="progress-section">
          <div class="progress-header">
            <span>Repayment Recovery Progress</span>
            <span class="font-bold text-mono" style="color:#2563eb; font-size: 13px;">${repaymentPercentage}% Cleared</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${Math.min(100, Math.max(3, repaymentPercentage))}%;"></div>
          </div>
          <div class="progress-stats-line">
            <span><strong>${paidCount}</strong> Installments Cleared</span>
            <span><strong>${pendingCount + overdueCount}</strong> Installments Remaining</span>
            <span><strong>${overdueCount}</strong> Currently Overdue</span>
          </div>
        </div>

        <div class="standing-box ${overdueCount > 0 ? "standing-warning" : "standing-good"}">
          <div class="standing-title">
            ${overdueCount > 0 ? "ACCOUNT STATUS: ACTION REQUIRED" : "ACCOUNT STATUS: IN GOOD STANDING"}
          </div>
          <p style="margin-top: 4px; font-size: 10.5px;">
            ${
              overdueCount > 0
                ? `Account has <strong>${overdueCount}</strong> overdue installment(s) totaling <strong>₹${formatMoney(totalPenaltyDue)}</strong> in late fees. Immediate settlement is requested to maintain credit standing.`
                : balanceOutstanding <= 0
                ? `Congratulations! This loan facility has been <strong>FULLY SETTLED</strong>. All installments have been reconciled and cleared in full.`
                : `Account is operating normally with scheduled repayments on track. Total outstanding principal & interest balance is <strong>₹${formatMoney(balanceOutstanding)}</strong>.`
            }
          </p>
        </div>
      </div>
    `;
  } else if (mode === "paid") {
    // PAID DATA ONLY TABLE
    const paidRows = filteredList.length > 0
      ? filteredList
          .map((inst, idx) => {
            const installmentNo = inst.installment_no ?? idx + 1;
            const dueDate = formatDate(inst.due_date);
            const paidDate = formatDate(inst.paid_date);
            const paidAmt = Number(inst.paid_amount || inst.principal_amount || 0);
            const penaltyPaid = Number(inst.penalty_amount || 0);
            const receiptRef = inst.receipt_no || inst.transaction_id || `RCP-${loan.id}-${installmentNo}`;

            return `
              <tr>
                <td class="col-center text-mono font-bold">${idx + 1}</td>
                <td class="col-center text-mono">Inst #${installmentNo}</td>
                <td class="text-mono">${dueDate}</td>
                <td class="col-center text-mono font-semibold" style="color: #16a34a;">${paidDate}</td>
                <td class="text-mono col-center" style="font-size: 9px; color: #64748b;">${receiptRef}</td>
                <td class="col-right text-mono font-bold text-success">₹${formatMoney(paidAmt)}</td>
                <td class="col-right text-mono ${penaltyPaid > 0 ? "text-danger" : "text-muted"}">
                  ${penaltyPaid > 0 ? `₹${formatMoney(penaltyPaid)}` : "—"}
                </td>
                <td class="col-center"><span class="status-pill badge-paid">CLEARED</span></td>
              </tr>
            `;
          })
          .join("")
      : `
        <tr>
          <td colspan="8" class="col-center py-8 text-muted">
            <div style="font-size: 12px; font-weight: 600; color: #64748b;">No Paid Installments Yet</div>
            <div style="font-size: 10px; margin-top: 2px;">No payment collections have been recorded for this loan.</div>
          </td>
        </tr>
      `;

    tableSectionHtml = `
      <div class="table-container">
        <div class="table-title-row">
          <span>CLEARED REPAYMENTS & PAYMENT RECEIPTS LEDGER (${filteredList.length} Payments)</span>
          <span style="font-weight: 500; font-size: 10px; color: #16a34a;">
            Total Collected: ₹${formatMoney(totalCollected)}
          </span>
        </div>
        <table>
          <thead>
            <tr>
              <th class="col-center" style="width: 32px;">#</th>
              <th class="col-center" style="width: 75px;">Installment</th>
              <th style="width: 90px;">Scheduled Date</th>
              <th class="col-center" style="width: 95px;">Payment Date</th>
              <th class="col-center" style="width: 110px;">Receipt / Ref</th>
              <th class="col-right" style="width: 110px;">Amount Paid</th>
              <th class="col-right" style="width: 85px;">Penalty Paid</th>
              <th class="col-center" style="width: 80px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${paidRows}
          </tbody>
          <tfoot>
            <tr>
              <td class="col-center">—</td>
              <td colspan="4" style="font-weight: 800;">TOTAL REPAYMENTS CLEARED</td>
              <td class="col-right text-mono font-bold text-success">₹${formatMoney(totalCollected)}</td>
              <td class="col-right text-mono ${totalPenaltyPaid > 0 ? "text-danger" : ""}">₹${formatMoney(totalPenaltyPaid)}</td>
              <td class="col-center text-success font-bold">${paidCount} PAID</td>
            </tr>
          </tfoot>
        </table>
        <div style="margin-top: 8px; font-size: 9.5px; color: #64748b; font-style: italic;">
          * This statement verifies official receipt of the cleared amounts listed above.
        </div>
      </div>
    `;
  } else if (mode === "pending") {
    // OUTSTANDING / PENDING DATA ONLY TABLE
    const dueRows = filteredList.length > 0
      ? filteredList
          .map((inst, idx) => {
            const installmentNo = inst.installment_no ?? idx + 1;
            const dueDate = formatDate(inst.due_date);
            const emiAmt = Number(inst.total_due ?? inst.principal_amount ?? inst.installment_amount ?? 0);
            const penalty = Number(inst.penalty_amount || 0);
            const netPayable = emiAmt + penalty;
            const isOverdue = inst.status === "overdue";

            return `
              <tr class="${isOverdue ? "row-overdue" : ""}">
                <td class="col-center text-mono font-bold">${idx + 1}</td>
                <td class="col-center text-mono">Inst #${installmentNo}</td>
                <td class="text-mono ${isOverdue ? "font-bold text-danger" : ""}">${dueDate}</td>
                <td class="col-right text-mono font-medium">₹${formatMoney(emiAmt)}</td>
                <td class="col-right text-mono ${penalty > 0 ? "text-danger font-bold" : "text-muted"}">
                  ${penalty > 0 ? `₹${formatMoney(penalty)}` : "—"}
                </td>
                <td class="col-right text-mono font-bold" style="color: ${isOverdue ? "#dc2626" : "#2563eb"};">
                  ₹${formatMoney(netPayable)}
                </td>
                <td class="col-center">
                  <span class="status-pill ${isOverdue ? "badge-overdue" : "badge-pending"}">
                    ${isOverdue ? "OVERDUE" : "PENDING"}
                  </span>
                </td>
                <td class="col-center sign-cell"><span class="sign-box"></span></td>
              </tr>
            `;
          })
          .join("")
      : `
        <tr>
          <td colspan="8" class="col-center py-8 text-success">
            <div style="font-size: 13px; font-weight: 700;">No Outstanding Dues!</div>
            <div style="font-size: 10px; margin-top: 2px;">All installments have been cleared in full.</div>
          </td>
        </tr>
      `;

    const totalOutstandingEmi = filteredList.reduce(
      (sum, i) => sum + (Number(i.total_due ?? i.principal_amount ?? i.installment_amount) || 0),
      0
    );
    const totalPendingPenalty = filteredList.reduce(
      (sum, i) => sum + (Number(i.penalty_amount) || 0),
      0
    );

    tableSectionHtml = `
      <div class="table-container">
        <div class="table-title-row">
          <span>PENDING & OVERDUE INSTALLMENTS SCHEDULE (${filteredList.length} Dues)</span>
          <span style="font-weight: 600; font-size: 10px; color: #dc2626;">
            Total Outstanding: ₹${formatMoney(totalOutstandingEmi + totalPendingPenalty)}
          </span>
        </div>
        <table>
          <thead>
            <tr>
              <th class="col-center" style="width: 32px;">#</th>
              <th class="col-center" style="width: 75px;">Installment</th>
              <th style="width: 95px;">Due Date</th>
              <th class="col-right" style="width: 100px;">EMI Due</th>
              <th class="col-right" style="width: 85px;">Late Penalty</th>
              <th class="col-right" style="width: 105px;">Net Due Amount</th>
              <th class="col-center" style="width: 80px;">Status</th>
              <th class="col-center" style="width: 75px;">Paid Seal</th>
            </tr>
          </thead>
          <tbody>
            ${dueRows}
          </tbody>
          <tfoot>
            <tr>
              <td class="col-center">—</td>
              <td colspan="2" style="font-weight: 800;">TOTAL DUE PAYABLE</td>
              <td class="col-right text-mono font-bold">₹${formatMoney(totalOutstandingEmi)}</td>
              <td class="col-right text-mono text-danger font-bold">₹${formatMoney(totalPendingPenalty)}</td>
              <td class="col-right text-mono text-danger font-bold">₹${formatMoney(totalOutstandingEmi + totalPendingPenalty)}</td>
              <td colspan="2" class="col-center text-danger font-bold">${filteredList.length} DUES REMAINING</td>
            </tr>
          </tfoot>
        </table>
        <div style="margin-top: 10px; background: #fffbeb; border: 1px solid #fef3c7; padding: 8px 12px; border-radius: 6px; font-size: 10px; color: #92400e;">
          <strong>Borrower Notice:</strong> Please settle pending dues on or before their respective dates to avoid late payment penalties. Payments can be handed over to your assigned loan officer or paid at the branch office.
        </div>
      </div>
    `;
  } else {
    // ALL DATA TABLE (Default Statement & Passbook)
    const allRows = safeInstallments.length > 0
      ? safeInstallments
          .map((inst, index) => {
            const installmentNo = inst.installment_no ?? index + 1;
            const dueDate = formatDate(inst.due_date);
            const emiAmount = Number(inst.principal_amount || inst.installment_amount || inst.total_due || 0);
            const penalty = Number(inst.penalty_amount || 0);
            const paidAmt = Number(inst.paid_amount || 0);
            const paidDate = inst.paid_date ? formatDate(inst.paid_date) : "—";
            const status = (inst.status || "pending").toLowerCase();

            let statusBadgeClass = "badge-pending";
            let statusText = "PENDING";
            if (status === "paid") {
              statusBadgeClass = "badge-paid";
              statusText = "PAID";
            } else if (status === "overdue") {
              statusBadgeClass = "badge-overdue";
              statusText = "OVERDUE";
            } else if (status === "partial") {
              statusBadgeClass = "badge-partial";
              statusText = "PARTIAL";
            }

            return `
              <tr>
                <td class="col-center text-mono font-bold">${installmentNo}</td>
                <td class="text-mono">${dueDate}</td>
                <td class="col-right text-mono font-medium">₹${formatMoney(emiAmount)}</td>
                <td class="col-right text-mono ${penalty > 0 ? "text-danger font-semibold" : "text-muted"}">
                  ${penalty > 0 ? `₹${formatMoney(penalty)}` : "—"}
                </td>
                <td class="col-right text-mono font-bold ${paidAmt > 0 ? "text-success" : "text-muted"}">
                  ${paidAmt > 0 ? `₹${formatMoney(paidAmt)}` : "—"}
                </td>
                <td class="col-center text-mono">${paidDate}</td>
                <td class="col-center">
                  <span class="status-pill ${statusBadgeClass}">${statusText}</span>
                </td>
              </tr>
            `;
          })
          .join("")
      : `
        <tr>
          <td colspan="7" class="col-center py-6 text-muted">
            No installment schedule records found for this loan.
          </td>
        </tr>
      `;

    tableSectionHtml = `
      <div class="table-container">
        <div class="table-title-row">
          <span>COMPLETE INSTALLMENT SCHEDULE & REPAYMENT PASSBOOK (${safeInstallments.length} Records)</span>
          <span style="font-weight: 500; font-size: 10px; color: #64748b;">
            ${paidCount} of ${totalInstallmentsCount} Cleared (${repaymentPercentage}%)
          </span>
        </div>
        <table>
          <thead>
            <tr>
              <th class="col-center" style="width: 38px;">#</th>
              <th style="width: 90px;">Due Date</th>
              <th class="col-right" style="width: 100px;">EMI Due</th>
              <th class="col-right" style="width: 85px;">Penalty</th>
              <th class="col-right" style="width: 105px;">Paid Amount</th>
              <th class="col-center" style="width: 95px;">Paid Date</th>
              <th class="col-center" style="width: 85px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${allRows}
          </tbody>
          <tfoot>
            <tr>
              <td class="col-center">—</td>
              <td>TOTALS</td>
              <td class="col-right text-mono font-bold">₹${formatMoney(totalRepayable)}</td>
              <td class="col-right text-mono ${totalPenaltyDue + totalPenaltyPaid > 0 ? "text-danger" : ""}">
                ₹${formatMoney(totalPenaltyDue + totalPenaltyPaid)}
              </td>
              <td class="col-right text-mono text-success font-bold">₹${formatMoney(totalCollected)}</td>
              <td class="col-center text-mono">Bal: ₹${formatMoney(balanceOutstanding)}</td>
              <td class="col-center">${repaymentPercentage}% Repaid</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  }

  // =========================================================================
  // 5. CONSTRUCT FULL HTML WITH CSS
  // =========================================================================

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${documentTitle} — ${loan.loan_no || loan.id}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 12mm 12mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      font-size: 11px;
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }

    /* Screen Top Action Bar */
    .screen-actions-bar {
      position: sticky;
      top: 0;
      z-index: 999;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .screen-actions-bar h2 {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .btn-group {
      display: flex;
      gap: 10px;
    }

    .action-btn {
      padding: 7px 16px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s;
    }

    .btn-primary {
      background: #2563eb;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #1d4ed8;
    }

    .btn-secondary {
      background: #334155;
      color: #f1f5f9;
    }
    .btn-secondary:hover {
      background: #475569;
    }

    /* Main Sheet Container */
    .sheet-wrapper {
      max-width: 800px;
      margin: 20px auto 40px;
      background: #ffffff;
      padding: 28px 32px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
    }

    /* Header & Letterhead */
    .letterhead {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 14px;
      margin-bottom: 16px;
    }

    .company-info h1 {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.01em;
      text-transform: uppercase;
      line-height: 1.15;
    }

    .company-trade {
      font-size: 11px;
      font-weight: 600;
      color: #2563eb;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 2px;
    }

    .company-meta {
      font-size: 10px;
      color: #475569;
      margin-top: 4px;
      line-height: 1.4;
      max-width: 480px;
    }

    .doc-badge-block {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .corporate-emblem {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: 8px;
      background: #0f172a;
      color: #ffffff;
      font-weight: 800;
      font-size: 18px;
      margin-bottom: 6px;
    }

    .doc-ref {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 9.5px;
      font-weight: 600;
      color: #64748b;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
    }

    /* Title Bar */
    .title-banner {
      background: #0f172a;
      color: #ffffff;
      padding: 8px 14px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .title-banner h2 {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .title-banner .sub {
      font-size: 9.5px;
      color: #94a3b8;
      font-weight: 400;
    }

    .loan-status-tag {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      background: #22c55e;
      color: #ffffff;
    }

    .status-closed { background: #64748b; }
    .status-default { background: #ef4444; }
    .status-active { background: #2563eb; }

    /* 2-Column Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }

    .info-card {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px 14px;
      background: #ffffff;
    }

    .info-card-header {
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #1e293b;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 5px;
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 2.5px 0;
      font-size: 10.5px;
    }

    .info-label {
      color: #64748b;
      font-weight: 500;
    }

    .info-val {
      font-weight: 600;
      color: #0f172a;
      text-align: right;
    }

    .text-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }

    /* KPI Highlight Bar */
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 18px;
    }

    .kpi-box {
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      border-radius: 6px;
      padding: 8px 10px;
      text-align: center;
    }

    .kpi-label {
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.04em;
    }

    .kpi-val {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }

    .kpi-val.success { color: #16a34a; }
    .kpi-val.danger { color: #dc2626; }
    .kpi-val.primary { color: #2563eb; }

    /* Summary Slip Card Styles (No Table Mode) */
    .summary-slip-card {
      border: 1.5px solid #0f172a;
      background: #f8fafc;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 20px;
    }

    .slip-title {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }

    .slip-body {
      font-size: 11.5px;
      line-height: 1.6;
      color: #334155;
      margin-bottom: 16px;
    }

    .progress-section {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px 16px;
      margin-bottom: 14px;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 6px;
    }

    .progress-bar-bg {
      width: 100%;
      height: 10px;
      background: #e2e8f0;
      border-radius: 20px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #2563eb, #16a34a);
      border-radius: 20px;
    }

    .progress-stats-line {
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      color: #64748b;
    }

    .standing-box {
      border-radius: 6px;
      padding: 10px 14px;
    }

    .standing-good {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
    }

    .standing-warning {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }

    .standing-title {
      font-weight: 800;
      font-size: 11px;
      letter-spacing: 0.04em;
    }

    /* Table Container & Elements */
    .table-container {
      margin-bottom: 18px;
    }

    .table-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10.5px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      border: 1px solid #94a3b8;
    }

    thead th {
      background: #0f172a;
      color: #ffffff;
      padding: 7px 6px;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 9.5px;
      letter-spacing: 0.04em;
      border: 1px solid #334155;
    }

    tbody tr:nth-child(even) {
      background: #f8fafc;
    }

    tbody tr.row-overdue {
      background: #fef2f2;
    }

    tbody td {
      padding: 6px 6px;
      border: 1px solid #cbd5e1;
      color: #1e293b;
    }

    tfoot td {
      padding: 7px 6px;
      font-weight: 800;
      background: #f1f5f9;
      border: 1px solid #94a3b8;
      font-size: 10px;
    }

    .col-center { text-align: center; }
    .col-right { text-align: right; }

    /* Status Pills */
    .status-pill {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 8.5px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .badge-paid {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }

    .badge-overdue {
      background: #fee2e2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }

    .badge-pending {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
    }

    .badge-partial {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
    }

    .text-success { color: #16a34a; }
    .text-danger { color: #dc2626; }
    .text-muted { color: #94a3b8; }

    .sign-cell {
      width: 75px;
    }
    .sign-box {
      display: inline-block;
      width: 55px;
      height: 18px;
      border-bottom: 1px dashed #94a3b8;
    }

    /* Signatures Section */
    .signatures-section {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-top: 32px;
      padding-top: 14px;
      border-top: 1px dashed #cbd5e1;
      page-break-inside: avoid;
    }

    .signature-box {
      text-align: center;
    }

    .sig-line {
      height: 38px;
      border-bottom: 1.5px solid #334155;
      margin-bottom: 6px;
    }

    .sig-title {
      font-weight: 700;
      font-size: 10.5px;
      color: #1e293b;
    }

    .sig-sub {
      font-size: 9px;
      color: #64748b;
    }

    /* Footer Note */
    .legal-footer {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      color: #64748b;
    }

    /* Print Specific Overrides */
    @media print {
      body {
        background: #ffffff;
        color: #000000;
      }
      .no-print {
        display: none !important;
      }
      .sheet-wrapper {
        box-shadow: none;
        border: none;
        padding: 0;
        margin: 0;
        max-width: 100%;
      }
      thead th {
        background: #1e293b !important;
        color: #ffffff !important;
      }
      .title-banner {
        background: #1e293b !important;
        color: #ffffff !important;
      }
      .status-pill {
        border: 1px solid #000000 !important;
      }
      table, th, td {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>

  <!-- Screen Top Bar (Hidden on actual print) -->
  <div class="screen-actions-bar no-print">
    <div>
      <h2>${companyName} — Print Preview</h2>
      <p style="font-size: 11px; opacity: 0.75;">Mode: ${modeBadge} · (Loan #${loan.loan_no || loan.id})</p>
    </div>
    <div class="btn-group">
      <button class="action-btn btn-primary" onclick="window.print()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Print / Save as PDF
      </button>
      <button class="action-btn btn-secondary" onclick="window.close()">
        Close Window
      </button>
    </div>
  </div>

  <!-- Document Sheet -->
  <div class="sheet-wrapper">
    
    <!-- 1. Corporate Header / Letterhead -->
    <div class="letterhead">
      <div class="company-info">
        <h1>${companyName}</h1>
        ${tradeName ? `<div class="company-trade">${tradeName}</div>` : ""}
        <div class="company-meta">
          <div>${fullAddress}</div>
          <div>Tel: ${companyPhone} · Email: ${companyEmail}</div>
          ${taxIdRow ? `<div>${taxIdRow}</div>` : ""}
        </div>
      </div>
      <div class="doc-badge-block">
        <div class="corporate-emblem">CM</div>
        <div class="doc-ref">${docReference}</div>
        <div style="font-size: 9px; color: #64748b; margin-top: 3px;">Date: ${printTimestamp}</div>
      </div>
    </div>

    <!-- 2. Document Title Banner with Mode Tag -->
    <div class="title-banner">
      <div>
        <h2>${documentTitle}</h2>
        <div class="sub">${documentSubtitle}</div>
      </div>
      <span class="loan-status-tag status-${(loan.status || "active").toLowerCase()}">
        ${modeBadge}
      </span>
    </div>

    <!-- 3. Key Financial Metrics Bar (Dynamic for Mode) -->
    <div class="kpi-row">
      <div class="kpi-box">
        <div class="kpi-label">Sanctioned Principal</div>
        <div class="kpi-val primary">₹${formatMoney(loan.loan_amount)}</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">${mode === "paid" ? "Cleared Repayments" : "Total Repayable"}</div>
        <div class="kpi-val ${mode === "paid" ? "success" : ""}">
          ₹${formatMoney(mode === "paid" ? totalCollected : totalRepayable)}
        </div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">${mode === "pending" ? "Total Dues Payable" : "Total Collected"}</div>
        <div class="kpi-val ${mode === "pending" ? "danger" : "success"}">
          ₹${formatMoney(mode === "pending" ? balanceOutstanding : totalCollected)}
        </div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Outstanding Balance</div>
        <div class="kpi-val ${balanceOutstanding > 0 ? "danger" : "success"}">₹${formatMoney(balanceOutstanding)}</div>
      </div>
    </div>

    <!-- 4. Borrower & Loan Details Grid -->
    <div class="info-grid">
      <!-- Borrower Particulars -->
      <div class="info-card">
        <div class="info-card-header">
          <span>Borrower Profile</span>
          <span class="text-mono" style="color:#2563eb;">${customerCode}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Customer Name</span>
          <span class="info-val">${customerFullName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Primary Mobile</span>
          <span class="info-val text-mono">${customerMobile}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Identity / Aadhaar</span>
          <span class="info-val text-mono">${customerAadhaar}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Occupation / Business</span>
          <span class="info-val">${customerOccupation}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Registered Address</span>
          <span class="info-val" style="max-width: 220px; font-size: 9.5px;">${customerAddress}</span>
        </div>
      </div>

      <!-- Loan Facility Particulars -->
      <div class="info-card">
        <div class="info-card-header">
          <span>Loan Facility Details</span>
          <span class="text-mono" style="color:#2563eb;">#${loan.loan_no || loan.id}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Credit Scheme / Plan</span>
          <span class="info-val">${loan.plan_name || plan?.plan_name || `Plan #${loan.loan_plan_id || "—"}`}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Tenure & Frequency</span>
          <span class="info-val">${loan.tenure ? `${loan.tenure} ${loan.tenure_type || "Months"}` : "—"} · ${(loan.collection_frequency || "Monthly").toUpperCase()}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Net Disbursed</span>
          <span class="info-val text-mono font-bold">₹${formatMoney(netDisbursed)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Installment (EMI)</span>
          <span class="info-val text-mono font-bold" style="color: #2563eb;">₹${formatMoney(loan.installment_amount)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Tenure Window</span>
          <span class="info-val text-mono">${formatDate(loan.start_date)} → ${formatDate(loan.end_date)}</span>
        </div>
      </div>
    </div>

    <!-- 5. Mode-Specific Table Section (or Summary Card) -->
    ${tableSectionHtml}

    <!-- 6. Signatures & Verification Block -->
    <div class="signatures-section">
      <div class="signature-box">
        <div class="sig-line"></div>
        <div class="sig-title">Borrower / Payer Signature</div>
        <div class="sig-sub">I confirm receipt of this statement</div>
      </div>
      <div class="signature-box">
        <div class="sig-line"></div>
        <div class="sig-title">Loan Officer / Cashier</div>
        <div class="sig-sub">Verified & Reconciled with Ledger</div>
      </div>
      <div class="signature-box">
        <div class="sig-line"></div>
        <div class="sig-title">Authorized Branch Seal</div>
        <div class="sig-sub">${companyName}</div>
      </div>
    </div>

    <!-- 7. Legal Disclaimer Footer -->
    <div class="legal-footer">
      <div>
        <strong>Notice:</strong> This document is an officially generated record from the CM Micro Finance Platform.
      </div>
      <div>Mode: ${modeBadge} · Page 1 of 1 · Generated: ${printTimestamp}</div>
    </div>

  </div>

  <script>
    // Auto-trigger print dialog once window is loaded
    window.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => {
        window.print();
      }, 350);
    });
  </script>
</body>
</html>
  `;

  // 6. Launch Print Window with Popup-Blocker Failover
  try {
    const printWindow = window.open("", "_blank", "width=920,height=1000,menubar=no,toolbar=no,location=no,status=no");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      return;
    }
  } catch (err) {
    console.warn("Direct window.open print was restricted:", err);
  }

  // Fallback: Invisible iframe trigger if popup was blocked
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

/**
 * printInstallmentReceipt
 * Prints a clean, official single-page Cash Receipt / Voucher for an installment payment.
 */
export function printInstallmentReceipt({
  loan,
  installment,
  customer = null,
  company = {},
  successData = {},
}) {
  if (!installment) return;

  const companyName = company?.company_name || company?.legal_name || "CM MICRO FINANCE PVT LTD";
  const addressParts = [
    company?.address_line_1,
    company?.address_line_2,
    company?.city,
    company?.state ? `${company.state} ${company?.pincode || ""}` : company?.pincode,
  ].filter(Boolean);
  const fullAddress = addressParts.length ? addressParts.join(", ") : "Head Office Commercial Complex";
  const companyPhone = company?.phone || "+91 98765 43210";
  const companyEmail = company?.email || "support@cmmicro.com";
  const taxIdRow = [
    company?.gst_number ? `GSTIN: ${company.gst_number}` : "",
    company?.pan_number ? `PAN: ${company.pan_number}` : "",
  ].filter(Boolean).join(" | ");

  const customerName =
    customer?.customer_name || customer?.name || loan?.customer_name || installment?.customer_name || "Borrower";
  const customerNo = customer?.customer_no || loan?.customer_no || installment?.customer_no || (loan?.customer_id ? `CUST-${loan.customer_id}` : (installment?.customer_id ? `CUST-${installment.customer_id}` : "—"));
  const customerMobile = customer?.mobile || loan?.customer_mobile || loan?.mobile || installment?.customer_mobile || installment?.mobile || "—";
  const loanNo = loan?.loan_no || installment?.loan_no || (installment?.loan_id ? `LN-${installment.loan_id}` : "—");

  const amountPaidNow = Number(successData?.amountPaidNow || 0);
  const cumulativePaid = Number(successData?.cumulativePaid || installment?.paid_amount || 0);
  const remainingBalance = Number(successData?.remainingBalance ?? installment?.balance_amount ?? 0);
  const receiptNo = successData?.receiptNo || `REC-${installment.id}-${Date.now().toString().slice(-4)}`;
  const paidDate = successData?.paidDate || new Date().toISOString().slice(0, 10);
  const isPaid = successData?.status === "paid" || remainingBalance <= 0;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Payment Receipt - ${receiptNo}</title>
  <style>
    @page { size: A5 landscape; margin: 10mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
    body { background: #fff; color: #1e293b; padding: 15px; font-size: 11px; }
    .receipt-box { border: 2px solid #0f172a; border-radius: 8px; padding: 15px; max-width: 760px; margin: 0 auto; position: relative; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 12px; }
    .company-title { font-size: 16px; font-weight: 800; text-transform: uppercase; color: #0f172a; }
    .company-sub { font-size: 10px; color: #475569; margin-top: 2px; }
    .receipt-badge { text-align: right; }
    .badge-title { font-size: 13px; font-weight: 800; background: #0f172a; color: #fff; padding: 4px 10px; border-radius: 4px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; }
    .receipt-no { font-size: 11px; font-weight: 700; margin-top: 4px; color: #0f172a; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px; }
    .card-title { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 4px; letter-spacing: 0.5px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 3px; }
    .row:last-child { margin-bottom: 0; }
    .label { color: #64748b; }
    .val { font-weight: 600; color: #0f172a; }
    .payment-hero { background: #ecfdf5; border: 1.5px solid #10b981; border-radius: 8px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .hero-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #047857; }
    .hero-amount { font-size: 20px; font-weight: 900; color: #065f46; font-family: monospace; }
    .status-tag { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
    .status-paid { background: #10b981; color: #fff; }
    .status-partial { background: #f59e0b; color: #fff; }
    .signatures { display: flex; justify-content: space-between; margin-top: 25px; padding-top: 15px; border-top: 1px dashed #cbd5e1; }
    .sign-box { text-align: center; width: 180px; }
    .sign-line { border-top: 1px solid #0f172a; margin-top: 35px; margin-bottom: 3px; }
    .sign-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #475569; }
    .footer { text-align: center; font-size: 9px; color: #94a3b8; margin-top: 10px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="receipt-box">
    <div class="header">
      <div>
        <div class="company-title">${companyName}</div>
        <div class="company-sub">${fullAddress}</div>
        <div class="company-sub">Phone: ${companyPhone} | Email: ${companyEmail}</div>
        ${taxIdRow ? `<div class="company-sub">${taxIdRow}</div>` : ""}
      </div>
      <div class="receipt-badge">
        <div class="badge-title">Payment Receipt</div>
        <div class="receipt-no">${receiptNo}</div>
        <div class="company-sub" style="margin-top: 3px;">Date: ${paidDate}</div>
      </div>
    </div>

    <div class="payment-hero">
      <div>
        <div class="hero-label">Amount Collected in this Transaction</div>
        <div style="font-size: 9px; color: #047857; margin-top: 1px;">Mode: Official Cash / Workstation Entry</div>
      </div>
      <div style="text-align: right;">
        <div class="hero-amount">₹${amountPaidNow.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
        <span class="status-tag ${isPaid ? "status-paid" : "status-partial"}">
          ${isPaid ? "Installment Cleared" : "Partial Payment"}
        </span>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-title">Borrower Details</div>
        <div class="row"><span class="label">Customer Name:</span><span class="val">${customerName}</span></div>
        <div class="row"><span class="label">Customer ID:</span><span class="val">${customerNo}</span></div>
        <div class="row"><span class="label">Mobile Number:</span><span class="val">${customerMobile}</span></div>
        <div class="row"><span class="label">Loan Account:</span><span class="val">${loanNo}</span></div>
      </div>

      <div class="card">
        <div class="card-title">Installment Settlement Details</div>
        <div class="row"><span class="label">Installment Number:</span><span class="val">#${installment.installment_no}</span></div>
        <div class="row"><span class="label">Due Date:</span><span class="val">${installment.due_date ? new Date(installment.due_date).toLocaleDateString() : "—"}</span></div>
        <div class="row"><span class="label">Cumulative Paid on Installment:</span><span class="val">₹${cumulativePaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
        <div class="row"><span class="label">Remaining Installment Balance:</span><span class="val" style="color: ${remainingBalance > 0 ? "#b45309" : "#047857"}; font-weight: 700;">₹${remainingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
      </div>
    </div>

    <div class="signatures">
      <div class="sign-box">
        <div class="sign-line"></div>
        <div class="sign-label">Customer / Depositor Signature</div>
      </div>
      <div class="sign-box">
        <div class="sign-line"></div>
        <div class="sign-label">Authorized Cashier / Stamp</div>
      </div>
    </div>

    <div class="footer">
      This is a system generated official acknowledgement receipt. Thank you for your timely payment.
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
    const printWindow = window.open("", "_blank", "width=850,height=750,menubar=no,toolbar=no,location=no,status=no");
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

  // Fallback iframe
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
