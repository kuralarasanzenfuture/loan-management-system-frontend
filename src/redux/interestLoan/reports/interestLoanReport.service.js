import api from "../../../common/services/api.js";
import dayjs from "dayjs";

/**
 * Clean parameters helper: strips empty strings, nulls, and undefined
 */
function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([_, v]) => v !== "" && v !== null && v !== undefined
    )
  );
}

// =========================================================
// 1. GET COMPREHENSIVE REPORT OVERVIEW
// Aggregates Loan Portfolio Summary, Payments Summary, and Collections Overview
// =========================================================
export const getReportOverview = async (params = {}) => {
  const cleaned = cleanParams(params);

  try {
    const [loanSummaryRes, paymentSummaryRes, collectionsRes, allPaymentsRes, allLoansRes] =
      await Promise.all([
        api.get("/interest-loans/summary"),
        api.get("/interest-loan-payments/summary", { params: cleaned }).catch(() => ({ data: { data: {} } })),
        api.get("/interest-loans/periods/collections", { params: cleaned }).catch(() => ({ data: { data: {} } })),
        api.get("/interest-loan-payments", { params: { ...cleaned, limit: 100 } }).catch(() => ({ data: { data: [] } })),
        api.get("/interest-loans", { params: { limit: 100 } }).catch(() => ({ data: { data: [] } })),
      ]);

    const loanSummary = loanSummaryRes.data?.data || {};
    const paymentSummary = paymentSummaryRes.data?.data || {};
    const collectionsOverview = collectionsRes.data?.data || {};
    const paymentsList = allPaymentsRes.data?.data || allPaymentsRes.data?.payments || [];
    const loansList = allLoansRes.data?.data || [];

    // Calculate Monthly / Period Trend for Recharts
    const trendMap = {};
    paymentsList.forEach((p) => {
      const monthKey = dayjs(p.payment_date).format("YYYY-MM");
      const monthLabel = dayjs(p.payment_date).format("MMM YYYY");
      if (!trendMap[monthKey]) {
        trendMap[monthKey] = {
          monthKey,
          monthLabel,
          total_collected: 0,
          interest_collected: 0,
          principal_collected: 0,
          count: 0,
        };
      }
      trendMap[monthKey].total_collected += Number(p.payment_amount || 0);
      trendMap[monthKey].interest_collected += Number(p.interest_amount || 0);
      trendMap[monthKey].principal_collected += Number(p.principal_amount || 0);
      trendMap[monthKey].count += 1;
    });

    const monthlyTrend = Object.values(trendMap).sort((a, b) =>
      a.monthKey.localeCompare(b.monthKey)
    );

    // Calculate Status Breakdown from loans
    const statusMap = {};
    const freqMap = {};
    loansList.forEach((l) => {
      const st = l.status || "active";
      statusMap[st] = (statusMap[st] || 0) + 1;

      const fr = l.interest_frequency || "monthly";
      freqMap[fr] = (freqMap[fr] || 0) + 1;
    });

    const statusBreakdown = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
    }));

    const frequencyBreakdown = Object.entries(freqMap).map(([frequency, count]) => ({
      frequency,
      count,
    }));

    const totalDisbursed = parseFloat(loanSummary.total_principal_disbursed || 0);
    const totalPrincipalCollected = parseFloat(loanSummary.total_principal_paid || 0);
    const totalInterestAccrued = parseFloat(loanSummary.total_interest_accrued || 0);
    const totalInterestCollected = parseFloat(loanSummary.total_interest_paid || 0);
    const totalOutstandingPrincipal = parseFloat(loanSummary.total_outstanding_principal || 0);
    const totalOutstandingInterest = parseFloat(loanSummary.total_outstanding_interest || 0);

    const collectionRate = totalInterestAccrued > 0
      ? Math.round((totalInterestCollected / totalInterestAccrued) * 100)
      : 0;

    return {
      summary: {
        total_loans: Number(loanSummary.total_loans || 0),
        active_loans: Number(loanSummary.active_loans || 0),
        completed_loans: Number(loanSummary.completed_loans || 0),
        closed_loans: Number(loanSummary.closed_loans || 0),
        cancelled_loans: Number(loanSummary.cancelled_loans || 0),
        total_principal_disbursed: totalDisbursed,
        total_outstanding_principal: totalOutstandingPrincipal,
        total_principal_collected: totalPrincipalCollected,
        total_interest_accrued: totalInterestAccrued,
        total_interest_collected: totalInterestCollected,
        total_outstanding_interest: totalOutstandingInterest,
        collection_rate: collectionRate,
        period_payments_count: Number(paymentSummary.total_payments || 0),
        period_total_collected: parseFloat(paymentSummary.total_amount_collected || 0),
        period_interest_collected: parseFloat(paymentSummary.total_interest_collected || 0),
        period_principal_collected: parseFloat(paymentSummary.total_principal_collected || 0),
        total_overdue_periods: Number(collectionsOverview.overdue_summary?.total_overdue_periods || 0),
        total_loans_overdue: Number(collectionsOverview.overdue_summary?.total_loans_overdue || 0),
        total_overdue_amount: parseFloat(collectionsOverview.overdue_summary?.total_overdue_amount || 0),
      },
      payment_modes: paymentSummary.by_mode || {
        cash: 0,
        bank: 0,
        upi: 0,
        cheque: 0,
        other: 0,
      },
      monthly_trend: monthlyTrend,
      status_breakdown: statusBreakdown,
      frequency_breakdown: frequencyBreakdown,
      collections_overview: collectionsOverview,
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// 2. GET FILTERABLE LOANS PORTFOLIO REPORT
// =========================================================
export const getLoansReport = async (params = {}) => {
  try {
    const cleaned = cleanParams(params);
    const response = await api.get("/interest-loans", { params: cleaned });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// 3. GET FILTERABLE COLLECTIONS & PERIODS REPORT
// =========================================================
export const getCollectionsReport = async (params = {}) => {
  try {
    const cleaned = cleanParams(params);
    const response = await api.get("/interest-loans/periods/collections", { params: cleaned });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// 4. GET FILTERABLE PAYMENTS LEDGER REPORT
// =========================================================
export const getPaymentsReport = async (params = {}) => {
  try {
    const cleaned = cleanParams(params);
    const response = await api.get("/interest-loan-payments", { params: cleaned });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
