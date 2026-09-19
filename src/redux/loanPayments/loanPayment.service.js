import api from "../../common/services/api.js";

/* =========================================================
   RECORD SINGLE INSTALLMENT PAYMENT
   POST /api/loan-payments
========================================================= */
export const payInstallment = async (payload) => {
  try {
    const response = await api.post("/loan-payments", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   AUTO-ALLOCATED LUMP SUM PAYMENT FOR A LOAN
   POST /api/loan-payments/pay-loan
========================================================= */
export const payLoanAutoAllocate = async (payload) => {
  try {
    const response = await api.post("/loan-payments/pay-loan", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   BULK BATCH PAYMENTS ACROSS INSTALLMENTS
   POST /api/loan-payments/bulk
========================================================= */
export const bulkPayInstallments = async (payload) => {
  try {
    const response = await api.post("/loan-payments/bulk", payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   GET ALL PAYMENTS (PAGINATED & FILTERED)
   GET /api/loan-payments
========================================================= */
export const getAllPayments = async (params = {}) => {
  try {
    const response = await api.get("/loan-payments", { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   GET PAYMENT SUMMARY & METRICS
   GET /api/loan-payments/summary
========================================================= */
export const getPaymentSummary = async (params = {}) => {
  try {
    const response = await api.get("/loan-payments/summary", { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   GET OFFICIAL RECEIPT VOUCHER
   GET /api/loan-payments/receipt/:id
========================================================= */
export const getPaymentReceipt = async (id) => {
  try {
    const response = await api.get(`/loan-payments/receipt/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   GET PAYMENTS HISTORY FOR A LOAN
   GET /api/loan-payments/loan/:loanId
========================================================= */
export const getPaymentsByLoan = async (loanId) => {
  try {
    const response = await api.get(`/loan-payments/loan/${loanId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   GET PAYMENTS HISTORY FOR AN INSTALLMENT
   GET /api/loan-payments/installment/:installmentId
========================================================= */
export const getPaymentsByInstallment = async (installmentId) => {
  try {
    const response = await api.get(`/loan-payments/installment/${installmentId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   GET SINGLE PAYMENT BY ID
   GET /api/loan-payments/:id
========================================================= */
export const getPaymentById = async (id) => {
  try {
    const response = await api.get(`/loan-payments/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   REVERT / CANCEL PAYMENT
   DELETE /api/loan-payments/:id
========================================================= */
export const revertPayment = async (id) => {
  try {
    const response = await api.delete(`/loan-payments/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
