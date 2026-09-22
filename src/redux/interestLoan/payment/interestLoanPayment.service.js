import api from "../../../common/services/api.js";

// =========================================================
// RECORD NEW LOAN PAYMENT
// POST /api/interest-loan-payments
// =========================================================
export const recordPayment = async (data) => {
  try {
    const response = await api.post("/interest-loan-payments", data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// PREVIEW PAYMENT ALLOCATION BREAKDOWN
// POST /api/interest-loan-payments/preview
// =========================================================
export const previewPaymentAllocation = async (data) => {
  try {
    const response = await api.post("/interest-loan-payments/preview", data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// GET ALL PAYMENTS (Filters, Search, Pagination)
// GET /api/interest-loan-payments
// =========================================================
export const getAllPayments = async (params = {}) => {
  try {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, v]) => v !== "" && v !== null && v !== undefined
      )
    );
    const response = await api.get("/interest-loan-payments", {
      params: cleanParams,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// GET PAYMENT SUMMARY ANALYTICS
// GET /api/interest-loan-payments/summary
// =========================================================
export const getPaymentSummary = async (params = {}) => {
  try {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([_, v]) => v !== "" && v !== null && v !== undefined
      )
    );
    const response = await api.get("/interest-loan-payments/summary", {
      params: cleanParams,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// GET SINGLE PAYMENT BY ID (With line-item allocations)
// GET /api/interest-loan-payments/:id
// =========================================================
export const getPaymentById = async (id) => {
  try {
    const response = await api.get(`/interest-loan-payments/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// GET PAYMENTS FOR A SPECIFIC LOAN
// GET /api/interest-loan-payments/loan/:loanId
// =========================================================
export const getLoanPayments = async (loanId) => {
  try {
    const response = await api.get(`/interest-loan-payments/loan/${loanId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// GET PAYMENTS FOR A SPECIFIC CUSTOMER
// GET /api/interest-loan-payments/customer/:customerId
// =========================================================
export const getCustomerPayments = async (customerId) => {
  try {
    const response = await api.get(`/interest-loan-payments/customer/${customerId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// REVERSE / VOID A PAYMENT
// DELETE /api/interest-loan-payments/:id
// =========================================================
export const reversePayment = async (id) => {
  try {
    const response = await api.delete(`/interest-loan-payments/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
