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
