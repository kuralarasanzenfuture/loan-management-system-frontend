import api from "../../common/services/api.js";

/* =========================================================
   CREATE PAYMENT

   POST /api/interest-only-payments

   Auto allocates payment across schedules
========================================================= */

export const createPayment = async (formData) => {
  try {
    const response = await api.post("/interest-only-payments", formData);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   GET PAYMENTS BY LOAN

   GET /api/interest-only-payments/loan/:loan_id
========================================================= */

export const getPaymentsByLoan = async (loanId) => {
  try {
    const response = await api.get(`/interest-only-payments/loan/${loanId}`);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   GET SINGLE PAYMENT

   GET /api/interest-only-payments/:id
========================================================= */

export const getPaymentById = async (id) => {
  try {
    const response = await api.get(`/interest-only-payments/${id}`);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   DELETE PAYMENT

   DELETE /api/interest-only-payments/:id

   Reverses payment allocation and loan balance
========================================================= */

export const deletePayment = async (id) => {
  try {
    const response = await api.delete(`/interest-only-payments/${id}`);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   GET INTEREST COLLECTION REPORTS

   GET /api/interest-only-payments/reports/interest-collections
========================================================= */

export const getInterestCollectionReports = async (params = {}) => {
  try {
    const response = await api.get(
      "/interest-only-payments/reports/interest-collections",
      { params },
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

