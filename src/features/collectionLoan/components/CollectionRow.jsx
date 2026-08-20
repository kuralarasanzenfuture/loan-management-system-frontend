import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, User, IndianRupee, ExternalLink, CheckCircle2 } from "lucide-react";
import {
  STATUS_STYLES,
  formatCurrency,
  formatDate,
} from "../utils/collectionHelpers.js";

/**
 * CollectionRow
 * A single installment row for the cross-loan dashboard.
 */
export default function CollectionRow({
  installment,
  showDaysOverdue = false,
  onPay,
}) {
  const navigate = useNavigate();

  const customerDisplayName =
    installment.customer_name ||
    `${installment.first_name || ""} ${installment.last_name || ""}`.trim() ||
    (installment.customer_id ? `Customer #${installment.customer_id}` : "Customer");

  const loanDisplayName = installment.loan_no || (installment.loan_id ? `Loan #${installment.loan_id}` : "—");
  const mobileDisplay = installment.customer_mobile || installment.mobile || "—";

  const principal = Number(installment.principal_amount || 0);
  const penalty = Number(installment.penalty_amount || installment.calculated_penalty_amount || 0);
  const paid = Number(installment.paid_amount || 0);

  const totalDue = Number(
    (installment.total_due != null && Number(installment.total_due) >= principal + penalty)
      ? Number(installment.total_due)
      : (principal + penalty)
  );

  const rawBalance = Number(installment.balance_amount || 0);
  const balance = Number(
    Math.max(
      rawBalance,
      totalDue - paid
    ).toFixed(2)
  );

  const status =
    installment.status ||
    (balance <= 0 ? "paid" : paid > 0 ? "partial" : "pending");

  const isPaid = status === "paid" || balance <= 0;

  const handleCollect = () => {
    if (onPay) {
      onPay(installment);
    } else if (installment.loan_id) {
      navigate(`/loan-collections/${installment.loan_id}`);
    }
  };

  const handleOpenLoan = () => {
    if (installment.loan_id) {
      navigate(`/loan-collections/${installment.loan_id}`);
    }
  };

  return (
    <tr className="border-b border-base-200 last:border-0 hover:bg-base-200/50 transition-colors">
      <td>
        <div className="flex items-center gap-3 py-1">
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary shrink-0">
            <User size={15} />
          </span>
          <div className="min-w-0">
            <div
              className="font-semibold text-sm truncate hover:text-primary cursor-pointer transition-colors"
              onClick={handleOpenLoan}
              title="View loan collections"
            >
              {customerDisplayName}
            </div>
            <div className="text-[11px] text-base-content/40 truncate flex items-center gap-1">
              <span>{loanDisplayName}</span>
              {installment.installment_no && (
                <span>· Inst #{installment.installment_no}</span>
              )}
            </div>
          </div>
        </div>
      </td>

      <td className="text-xs text-base-content/60">
        {mobileDisplay}
      </td>

      <td className="text-xs">
        <div className="font-semibold text-base-content/80">
          {formatDate(installment.due_date) || "—"}
        </div>
        {installment.days_overdue != null && Number(installment.days_overdue) > 0 ? (
          <div className="flex items-center gap-1 text-[10px] text-error font-semibold mt-0.5">
            <AlertTriangle size={10} /> {installment.days_overdue} days overdue
          </div>
        ) : showDaysOverdue ? (
          <div className="text-[10px] text-base-content/40 mt-0.5">On time</div>
        ) : null}
      </td>

      <td className="text-right text-xs">
        <div className="font-bold text-base-content">
          {formatCurrency(totalDue)}
        </div>
        {penalty > 0 && (
          <div className="text-[10px] text-error font-medium mt-0.5" title={`Principal: ${formatCurrency(principal)} + Penalty: ${formatCurrency(penalty)}`}>
            EMI {formatCurrency(principal)} + Pen {formatCurrency(penalty)}
          </div>
        )}
      </td>

      <td className="text-right text-xs font-semibold">
        <span className={balance > 0 && penalty > 0 ? "text-error font-bold" : ""}>
          {formatCurrency(balance)}
        </span>
      </td>

      <td>
        <span
          className={`badge gap-1.5 font-medium badge-sm ${STATUS_STYLES[status] || "badge-ghost"}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </td>

      <td>
        <div className="flex items-center justify-end gap-1.5">
          {isPaid ? (
            <span className="badge badge-success badge-sm gap-1 text-[11px]">
              <CheckCircle2 size={12} /> Paid
            </span>
          ) : (
            <button
              onClick={handleCollect}
              className="btn btn-primary btn-xs rounded-lg gap-1 font-medium shadow-xs"
              title="Collect EMI & Penalty payment"
            >
              <IndianRupee size={12} />
              Collect
            </button>
          )}

          {installment.loan_id && (
            <button
              onClick={handleOpenLoan}
              className="btn btn-ghost btn-xs btn-square rounded-lg text-base-content/40 hover:text-base-content"
              title="View full loan collection"
            >
              <ExternalLink size={12} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

