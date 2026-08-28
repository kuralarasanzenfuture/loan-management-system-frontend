import api from "../../common/services/api.js";

/* =========================================================
   GET ALL INSTALLMENTS FOR A LOAN

   GET /api/loan-installments/loan/:loanId
========================================================= */

export const getInstallmentsByLoan = async (loanId) => {
  try {
    const response = await api.get(`/loan-installments/loan/${loanId}`);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   GET SINGLE INSTALLMENT

   GET /api/loan-installments/:id
========================================================= */

export const getInstallmentById = async (id) => {
  try {
    const response = await api.get(`/loan-installments/${id}`);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   UPDATE INSTALLMENT

   PUT /api/loan-installments/:id
========================================================= */

export const updateInstallment = async (id, formData) => {
  try {
    const response = await api.put(`/loan-installments/${id}`, formData);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   PAY INSTALLMENT

   POST /api/loan-installments/:id/pay
========================================================= */

export const payInstallment = async (id, formData) => {
  try {
    const response = await api.post(`/loan-installments/${id}/pay`, formData);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   APPLY PENALTY

   POST /api/loan-installments/:id/apply-penalty
========================================================= */

export const applyPenalty = async (id, formData = {}) => {
  try {
    const response = await api.post(
      `/loan-installments/${id}/apply-penalty`,
      formData,
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   REGENERATE INSTALLMENTS

   POST /api/loan-installments/loan/:loanId/regenerate
========================================================= */

export const regenerateInstallments = async (loanId, formData = {}) => {
  try {
    const response = await api.post(
      `/loan-installments/loan/${loanId}/regenerate`,
      formData,
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   GET CURRENT DUE

   GET /api/loan-installments/loan/:loanId/current-due
========================================================= */

export const getCurrentDue = async (loanId) => {
  try {
    const response = await api.get(
      `/loan-installments/loan/${loanId}/current-due`,
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   GET OVERDUE INSTALLMENTS

   GET /api/loan-installments/loan/:loanId/overdue
========================================================= */

export const getOverdueInstallments = async (loanId) => {
  try {
    const response = await api.get(`/loan-installments/loan/${loanId}/overdue`);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   GET LOAN SUMMARY

   GET /api/loan-installments/loan/:loanId/summary
========================================================= */

export const getLoanSummary = async (loanId) => {
  try {
    const response = await api.get(`/loan-installments/loan/${loanId}/summary`);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   CALCULATE PENALTY

   GET /api/loan-installments/:id/penalty
========================================================= */

export const calculatePenalty = async (id) => {
  try {
    const response = await api.get(`/loan-installments/${id}/penalty`);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// GET /installments/today?date=YYYY-MM-DD (date optional, defaults to server's today)
export const getTodayCollections = async (date, status) => {
  try {
    const targetDate = date || new Date().toISOString().slice(0, 10);

    if (status && status !== "all") {
      const response = await api.get("/loan-installments/today-collections", {
        params: { date: targetDate, status },
      });
      return response.data;
    }

    // When status is "all" or omitted, fetch both unpaid and paid to guarantee complete dataset
    const [unpaidRes, paidRes] = await Promise.allSettled([
      api.get("/loan-installments/today-collections", {
        params: { date: targetDate, status: "all" },
      }),
      api.get("/loan-installments/today-collections", {
        params: { date: targetDate, status: "paid" },
      }),
    ]);

    const unpaidData =
      unpaidRes.status === "fulfilled"
        ? unpaidRes.value?.data?.data || []
        : [];
    const paidData =
      paidRes.status === "fulfilled"
        ? paidRes.value?.data?.data || []
        : [];

    const seen = new Set();
    const combined = [];
    for (const item of [...unpaidData, ...paidData]) {
      if (item && item.id && !seen.has(item.id)) {
        seen.add(item.id);
        combined.push(item);
      }
    }

    const totalCollected = combined.reduce(
      (sum, row) => sum + Number(row.paid_amount || 0),
      0,
    );
    const totalDue = combined.reduce(
      (sum, row) =>
        sum +
        Number(
          row.total_due ??
            Number(row.principal_amount || 0) +
              Number(row.penalty_amount || 0) ??
            row.balance_amount ??
            0,
        ),
      0,
    );
    const totalBalance = combined.reduce(
      (sum, row) => sum + Number(row.balance_amount || 0),
      0,
    );

    return {
      success: true,
      date: targetDate,
      count: combined.length,
      total_collection: totalCollected,
      summary: {
        total_due: totalDue,
        collected_today: totalCollected,
        total_balance: totalBalance,
        total_installments: combined.length,
      },
      data: combined,
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// GET /installments/overdue (unscoped by loan — every overdue installment across all active loans)
export const getOverdueInstallmentsGlobal = async (params = {}) => {
  try {
    const response = await api.get("/loan-installments/overdue", { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const CollectionReports = async (params = {}) => {
  try {
    const response = await api.get(
      "/loan-installments/reports/loan-collections",
      { params },
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
