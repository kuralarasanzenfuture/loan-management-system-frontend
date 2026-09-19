import React from "react";
import { jsPDF } from "jspdf";

/**
 * generatePaymentReceiptPdf
 * Creates an official A5 PDF voucher matching finance standards.
 */
export function generatePaymentReceiptPdf({
  loan = null,
  installment = null,
  customer = null,
  company = null,
  successData = null,
  payment = null,
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a5",
  });

  const companyName =
    company?.company_name || company?.legal_name || "CM Micro Finance";
  const companyPhone = company?.phone || "";
  const companyEmail = company?.email || "";
  const companyGst = company?.gst_number || company?.pan_number || "";
  const companyAddress = [company?.address, company?.city, company?.state]
    .filter(Boolean)
    .join(", ");

  const customerName =
    customer?.name ||
    customer?.customer_name ||
    loan?.customer_name ||
    installment?.customer_name ||
    payment?.customer_name ||
    "Valued Customer";

  const rawMobile =
    customer?.mobile ||
    loan?.customer_mobile ||
    loan?.mobile ||
    installment?.customer_mobile ||
    payment?.customer_mobile ||
    "";

  const receiptNo =
    successData?.receiptNo ||
    (payment?.payment_no
      ? `RCP-${payment.loan_id || loan?.id || ""}-${String(payment.payment_no).padStart(4, "0")}`
      : "") ||
    (payment?.id ? `RCP-${payment.id}` : `REC-${installment?.id || Date.now()}`);

  const loanNo =
    loan?.loan_no ||
    payment?.loan_no ||
    `LN-${installment?.loan_id || loan?.id || ""}`;
  const installmentNo =
    installment?.installment_no || payment?.installment_no || 1;

  const rawDate = successData?.paidDate || payment?.payment_date || new Date();
  const formattedDate = new Date(rawDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const amountPaid =
    successData?.amountPaidNow ??
    payment?.payment_amount ??
    installment?.paid_amount ??
    0;

  const remainingBalance =
    successData?.remainingBalance ??
    payment?.installment_balance_amount ??
    installment?.balance_amount ??
    0;

  const mode = (
    successData?.paymentMode ||
    payment?.payment_mode ||
    "CASH"
  ).toUpperCase();

  const reference =
    successData?.transactionReference ||
    payment?.transaction_reference ||
    payment?.cheque_number ||
    "";

  const pageWidth = 148;
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;

  // 1. Outer Border Card
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, margin, contentWidth, 190, 3, 3);

  // 2. Company Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.roundedRect(margin, margin, contentWidth, 24, 3, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(companyName.toUpperCase(), margin + 6, margin + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  const contactLine = [
    companyPhone ? `Phone: ${companyPhone}` : "",
    companyEmail ? `Email: ${companyEmail}` : "",
    companyGst ? `GST: ${companyGst}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
  doc.text(
    contactLine || "Micro Finance & Repayment Solutions",
    margin + 6,
    margin + 15
  );
  if (companyAddress) {
    doc.text(companyAddress.slice(0, 50), margin + 6, margin + 20);
  }

  // 3. Receipt Badge on Right Header
  doc.setFillColor(37, 99, 235); // Blue 600
  doc.roundedRect(pageWidth - margin - 42, margin + 5, 36, 14, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("OFFICIAL RECEIPT", pageWidth - margin - 24, margin + 10, {
    align: "center",
  });
  doc.setFontSize(7);
  doc.text(receiptNo, pageWidth - margin - 24, margin + 15, {
    align: "center",
  });

  let y = margin + 30;

  // 4. Hero Amount Box
  doc.setFillColor(240, 253, 244); // Green 50
  doc.setDrawColor(34, 197, 94); // Green 500
  doc.setLineWidth(0.4);
  doc.roundedRect(margin + 4, y, contentWidth - 8, 22, 2, 2, "FD");

  doc.setTextColor(21, 128, 61); // Green 700
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("PAYMENT VERIFIED & RECEIVED", margin + 8, y + 7);

  doc.setTextColor(22, 101, 52); // Green 800
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(
    `Rs. ${Number(amountPaid).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    })}`,
    margin + 8,
    y + 17
  );

  // Status Badge inside Hero Box
  const isPaid = Number(remainingBalance) <= 0;
  doc.setFillColor(isPaid ? 22 : 217, isPaid ? 163 : 119, isPaid ? 74 : 6);
  doc.roundedRect(pageWidth - margin - 46, y + 5.5, 38, 11, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(
    isPaid ? "CLEARED IN FULL" : "PARTIAL PAYMENT",
    pageWidth - margin - 27,
    y + 12.5,
    { align: "center" }
  );

  y += 28;

  // 5. Transaction Particulars Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + 4, y, contentWidth - 8, 86, 2, 2, "FD");

  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("TRANSACTION PARTICULARS", margin + 8, y + 7);
  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 4, y + 10, pageWidth - margin - 4, y + 10);

  const particulars = [
    ["Receipt Reference:", receiptNo],
    ["Payment Date:", formattedDate],
    ["Customer Name:", `${customerName} ${rawMobile ? `(${rawMobile})` : ""}`],
    ["Loan Account:", loanNo],
    ["Installment Target:", `Installment #${installmentNo}`],
    ["Payment Mode:", mode],
    ...(reference ? [["Reference / Cheque:", reference]] : []),
    [
      "Remaining Installment Due:",
      `Rs. ${Number(remainingBalance).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      })}`,
    ],
    [
      "Received By:",
      payment?.received_by_user || payment?.received_by || "Authorized Staff",
    ],
  ];

  let itemY = y + 17;
  particulars.forEach(([label, value]) => {
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(label, margin + 8, itemY);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(String(value), pageWidth - margin - 8, itemY, { align: "right" });

    itemY += 7.5;
  });

  y += 94;

  // 6. Signatures Area
  doc.setDrawColor(203, 213, 225);
  doc.line(margin + 8, y + 16, margin + 46, y + 16);
  doc.line(pageWidth - margin - 46, y + 16, pageWidth - margin - 8, y + 16);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Customer Signature", margin + 27, y + 20, { align: "center" });
  doc.text("Authorized Signatory", pageWidth - margin - 27, y + 20, {
    align: "center",
  });

  // 7. Footer Disclaimer
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(6.5);
  doc.text(
    `Computer generated official receipt voucher. For inquiries, call ${companyPhone || companyName}.`,
    pageWidth / 2,
    margin + 186,
    { align: "center" }
  );

  return doc;
}

/**
 * sendWhatsAppPaymentReceipt
 * Generates official PDF, attempts native Web Share attachment,
 * and launches WhatsApp with pre-filled message text down below.
 */
export async function sendWhatsAppPaymentReceipt({
  loan = null,
  installment = null,
  customer = null,
  company = null,
  successData = null,
  payment = null,
}) {
  // Detect if running on mobile device (Android/iOS) vs desktop
  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent || ""
    );

  // 1. Resolve Company Details
  const companyName =
    company?.company_name || company?.legal_name || "CM Micro Finance";
  const companyPhone = company?.phone || "";

  // 2. Resolve Customer Profile & Mobile
  const customerName =
    customer?.name ||
    customer?.customer_name ||
    loan?.customer_name ||
    installment?.customer_name ||
    payment?.customer_name ||
    "Customer";

  const rawMobile =
    customer?.mobile ||
    customer?.phone ||
    loan?.customer_mobile ||
    loan?.mobile ||
    installment?.customer_mobile ||
    installment?.mobile ||
    payment?.customer_mobile ||
    payment?.mobile ||
    "";

  // Clean phone number: remove non-digits
  const digitsOnly = String(rawMobile).replace(/\D/g, "");
  let phoneParam = "";
  if (digitsOnly.length === 10) {
    phoneParam = `91${digitsOnly}`; // Default India country code if 10 digits
  } else if (digitsOnly.length > 10) {
    phoneParam = digitsOnly;
  }

  // 3. Resolve Payment Particulars
  const amountPaid =
    successData?.amountPaidNow ??
    payment?.payment_amount ??
    installment?.paid_amount ??
    0;

  const formattedAmount = Number(amountPaid).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const receiptNo =
    successData?.receiptNo ||
    (payment?.payment_no
      ? `RCP-${payment.loan_id || loan?.id || ""}-${String(payment.payment_no).padStart(4, "0")}`
      : "") ||
    (payment?.id ? `RCP-${payment.id}` : `REC-${installment?.id || Date.now()}`);

  const loanNo =
    loan?.loan_no ||
    payment?.loan_no ||
    `LN-${installment?.loan_id || loan?.id || ""}`;
  const installmentNo =
    installment?.installment_no || payment?.installment_no || 1;

  const rawDate = successData?.paidDate || payment?.payment_date || new Date();
  const formattedDate = new Date(rawDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const remainingBalance =
    successData?.remainingBalance ??
    payment?.installment_balance_amount ??
    installment?.balance_amount ??
    0;

  const formattedBalance = Number(remainingBalance).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const status =
    successData?.status ||
    payment?.installment_status ||
    installment?.status ||
    "paid";
  const isPaid = status === "paid" || Number(remainingBalance) <= 0;

  const mode = (
    successData?.paymentMode ||
    payment?.payment_mode ||
    "cash"
  ).toUpperCase();

  const reference =
    successData?.transactionReference ||
    payment?.transaction_reference ||
    payment?.cheque_number ||
    "";

  // 4. Generate Official Receipt PDF
  const pdfFileName = `Payment-Receipt-${receiptNo}.pdf`;
  let pdfBlob = null;
  let pdfFile = null;

  try {
    const doc = generatePaymentReceiptPdf({
      loan,
      installment,
      customer,
      company,
      successData,
      payment,
    });
    pdfBlob = doc.output("blob");
    pdfFile = new File([pdfBlob], pdfFileName, { type: "application/pdf" });
  } catch (pdfErr) {
    console.warn("PDF generation warning:", pdfErr);
  }

  // 5. Construct Professional Bank-Grade Receipt URL
  let receiptUrl = "";
  try {
    // Always use the active frontend origin (http://localhost:5173 on local, or live domain in production)
    // This ensures it never routes to the backend API on port 5000 ("Cannot GET /receipt")
    const baseUrl =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "http://localhost:5173";

    const payload = {
      r: String(receiptNo).trim(),
      c: String(customerName).trim(),
      m: String(rawMobile).trim(),
      l: String(loanNo).trim(),
      i: String(installmentNo).trim(),
      d: String(formattedDate).trim(),
      a: Number(amountPaid),
      p: String(mode).trim(),
      b: Number(remainingBalance),
      s: isPaid ? "paid" : "partial",
      co: String(companyName).trim(),
      cp: String(companyPhone).trim(),
      ref: String(reference || "").trim(),
    };

    // Compact URL-safe Base64 token (clean, obfuscated, avoids messy raw query params)
    const jsonStr = JSON.stringify(payload);
    const token = btoa(unescape(encodeURIComponent(jsonStr)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Professional clean path: /receipt/:receiptNo?token=...
    receiptUrl = `${baseUrl}/receipt/${encodeURIComponent(receiptNo)}?token=${token}`;
  } catch (urlErr) {
    console.warn("Could not generate receipt URL:", urlErr);
  }

  // 6. Construct Structured WhatsApp Message Content (Down to Content)
  const lines = [
    `*PAYMENT CONFIRMATION*`,
    `*${companyName}*`,
    `----------------------------------------`,
    `📥 *Official Receipt & PDF Download:*`,
    ``,
    receiptUrl || `Payment-Receipt-${receiptNo}.pdf`,
    ``,
    `----------------------------------------`,
    `Dear *${customerName}*,`,
    `We have received your installment payment with thanks.`,
    ``,
    `📄 *Receipt No:* ${receiptNo}`,
    `📅 *Date:* ${formattedDate}`,
    `💳 *Loan Account:* ${loanNo}`,
    `🔢 *Installment:* #${installmentNo}`,
    `💰 *Amount Paid:* ₹${formattedAmount}`,
    `🏷 *Payment Mode:* ${mode}`,
  ];

  if (reference) {
    lines.push(`🔖 *Ref / Cheque:* ${reference}`);
  }

  lines.push(`⚖ *Remaining Due:* ₹${formattedBalance}`);
  lines.push(
    isPaid ? `✅ *Status:* Paid Full Amount` : `⏳ *Status:* Partial Payment`
  );
  lines.push(`----------------------------------------`);
  if (companyPhone) {
    lines.push(`Helpline: ${companyPhone}`);
  }
  lines.push(`Thank you for your business!`);

  const fullMessage = lines.join("\n");
  const encodedText = encodeURIComponent(fullMessage);

  // 6. Helper: Download PDF to browser
  const triggerPdfDownload = () => {
    if (!pdfBlob) return;
    try {
      const blobUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = pdfFileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch (dlErr) {
      console.warn("PDF auto-download warning:", dlErr);
    }
  };

  // Helper: Copy message to clipboard
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullMessage).catch(() => {});
    }
  } catch (clipErr) {
    // Ignore clipboard access errors
  }

  // 7. Mobile Devices Direct Web Share (Android / iOS):
  if (
    isMobile &&
    pdfFile &&
    typeof navigator !== "undefined" &&
    navigator.canShare &&
    navigator.canShare({ files: [pdfFile] })
  ) {
    try {
      showShareToast("Opening WhatsApp with PDF receipt attached...");
      await navigator.share({
        files: [pdfFile],
        title: `Payment Receipt - ${receiptNo}`,
        text: fullMessage,
      });
      return;
    } catch (shareErr) {
      if (shareErr.name === "AbortError") return;
      console.warn("Mobile Web Share API fallback:", shareErr);
    }
  }

  // WhatsApp URLs:
  const whatsappUrl = isMobile
    ? (phoneParam
        ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodedText}`
        : `https://api.whatsapp.com/send?text=${encodedText}`)
    : (phoneParam
        ? `https://web.whatsapp.com/send?phone=${phoneParam}&text=${encodedText}`
        : `https://web.whatsapp.com/send?text=${encodedText}`);

  // 8. Desktop Chrome / Windows: Ask user to choose between WhatsApp Web and Document Share
  const canDesktopShareDoc =
    !isMobile &&
    pdfFile &&
    typeof navigator !== "undefined" &&
    navigator.canShare &&
    navigator.canShare({ files: [pdfFile] });

  // Native WhatsApp Desktop Application URL (Windows app - opens 0 browser tabs!)
  const whatsappAppUrl = phoneParam
    ? `whatsapp://send?phone=${phoneParam}&text=${encodedText}`
    : `whatsapp://send?text=${encodedText}`;

  if (canDesktopShareDoc) {
    showDesktopShareChooser({
      pdfFile,
      receiptNo,
      fullMessage,
      whatsappUrl,
      whatsappAppUrl,
    });
    return;
  }

  // 9. Standard Desktop or Mobile Direct WhatsApp Fallback:
  showShareToast(
    isMobile
      ? "Opening WhatsApp with receipt..."
      : "Navigating to WhatsApp Web..."
  );

  navigateWhatsAppWeb(whatsappUrl);
}

// Persistent navigation to the same WhatsApp Web tab across payments
function navigateWhatsAppWeb(url) {
  try {
    let anchor = document.getElementById("whatsapp-web-reusable-anchor");
    if (!anchor) {
      anchor = document.createElement("a");
      anchor.id = "whatsapp-web-reusable-anchor";
      anchor.target = "whatsapp_web_app_tab";
      anchor.rel = "opener";
      anchor.style.position = "fixed";
      anchor.style.left = "-9999px";
      anchor.style.top = "-9999px";
      document.body.appendChild(anchor);
    }
    anchor.href = url;
    anchor.click();
  } catch (err) {
    const w = window.open(url, "whatsapp_web_app_tab");
    if (w) {
      try {
        w.focus();
      } catch (fErr) {}
    }
  }
}

/**
 * showDesktopShareChooser
 * Renders an interactive modal on Desktop asking the user to choose:
 * 1) WhatsApp Web (Reuses the existing tab - No duplicate tabs!)
 * 2) WhatsApp Desktop App (Direct Windows App - Zero browser tabs!)
 * 3) Direct Share PDF Document (Pins PDF document directly to message via Chrome/Windows Share)
 */
function showDesktopShareChooser({
  pdfFile,
  receiptNo,
  fullMessage,
  whatsappUrl,
  whatsappAppUrl,
}) {
  const existingModal = document.getElementById("whatsapp-share-modal");
  if (existingModal) existingModal.remove();

  const modalContainer = document.createElement("div");
  modalContainer.id = "whatsapp-share-modal";
  modalContainer.className =
    "fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm";

  modalContainer.innerHTML = `
    <div class="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 text-slate-800 dark:text-slate-100">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold leading-none">Share Payment Receipt</h3>
            <p class="text-xs opacity-60 mt-1 font-medium">Choose sharing method</p>
          </div>
        </div>
        <button id="btn-close-share-modal" class="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div class="mt-4 space-y-3">
        <!-- Option 1: WhatsApp Web (Single Tab Reuse) -->
        <button id="btn-choose-whatsapp-web" class="w-full text-left p-4 rounded-2xl border-2 border-emerald-500/20 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all flex items-start gap-3.5 group cursor-pointer">
          <div class="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow group-hover:scale-105 transition-transform">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <span class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">WhatsApp Web</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 uppercase tracking-wide">Single Tab</span>
            </div>
            <p class="text-xs opacity-70 mt-1 leading-relaxed">
              Navigates your open WhatsApp Web tab. <strong>Reuses the same tab</strong> — never creates duplicate tabs.
            </p>
          </div>
        </button>

        <!-- Option 2: WhatsApp Windows Desktop App (0 browser tabs) -->
        <button id="btn-choose-whatsapp-app" class="w-full text-left p-4 rounded-2xl border-2 border-teal-500/20 hover:border-teal-500 bg-teal-500/5 hover:bg-teal-500/10 transition-all flex items-start gap-3.5 group cursor-pointer">
          <div class="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow group-hover:scale-105 transition-transform">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <span class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">WhatsApp Windows App</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-600 uppercase tracking-wide">Desktop App</span>
            </div>
            <p class="text-xs opacity-70 mt-1 leading-relaxed">
              Opens your installed WhatsApp Desktop app on Windows directly. <strong>Opens 0 browser tabs.</strong>
            </p>
          </div>
        </button>

        <!-- Option 3: Direct Pin PDF Document to Message (Chrome / Windows Native Share) -->
        <button id="btn-choose-doc-share" class="w-full text-left p-4 rounded-2xl border-2 border-indigo-500/30 hover:border-indigo-500 bg-indigo-500/5 hover:bg-indigo-500/10 transition-all flex items-start gap-3.5 group cursor-pointer">
          <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow group-hover:scale-105 transition-transform">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <span class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">Direct Share (Pin PDF)</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-600 uppercase tracking-wide">Direct Pin</span>
            </div>
            <p class="text-xs opacity-70 mt-1 leading-relaxed">
              Pins and attaches official PDF receipt directly to your message via system share flyout.
            </p>
          </div>
        </button>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <button id="btn-cancel-share-modal" class="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 opacity-70 hover:opacity-100 transition-all cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modalContainer);

  const closeModal = () => modalContainer.remove();

  modalContainer.addEventListener("click", (e) => {
    if (e.target === modalContainer) closeModal();
  });
  modalContainer.querySelector("#btn-close-share-modal").onclick = closeModal;
  modalContainer.querySelector("#btn-cancel-share-modal").onclick = closeModal;

  // 1. WhatsApp Web (Reuses existing open tab!):
  modalContainer.querySelector("#btn-choose-whatsapp-web").onclick = () => {
    closeModal();
    showShareToast("Navigating open WhatsApp Web tab...");
    navigateWhatsAppWeb(whatsappUrl);
  };

  // 2. WhatsApp Windows Desktop App (0 browser tabs!):
  modalContainer.querySelector("#btn-choose-whatsapp-app").onclick = () => {
    closeModal();
    showShareToast("Opening WhatsApp Windows Application...");
    window.location.href = whatsappAppUrl;
  };

  // 3. Direct Share (Pin PDF Document to Message):
  modalContainer.querySelector("#btn-choose-doc-share").onclick = async () => {
    closeModal();
    try {
      showShareToast("Opening share dialog with PDF document pinned...");
      await navigator.share({
        files: [pdfFile],
        title: `Payment Receipt - ${receiptNo}`,
        text: fullMessage,
      });
    } catch (err) {
      if (err.name === "AbortError") return;
      console.warn("Desktop document share fallback:", err);
      navigateWhatsAppWeb(whatsappUrl);
    }
  };
}

function showShareToast(message) {
  try {
    const existing = document.getElementById("whatsapp-share-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "whatsapp-share-toast";
    toast.className =
      "fixed bottom-6 right-6 z-[9999] flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold text-white bg-slate-900 border border-slate-700 pointer-events-none transition-opacity duration-300";
    toast.innerHTML = `
      <span class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </span>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  } catch (err) {
    // Ignore DOM toast errors if headless
  }
}

export function WhatsAppIcon({ size = 16, className = "" }) {
  return React.createElement(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "currentColor",
      className,
    },
    React.createElement("path", {
      d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
    })
  );
}
