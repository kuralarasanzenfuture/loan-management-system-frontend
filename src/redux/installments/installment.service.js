import api from "../../common/services/api.js";

/* =========================================================
   GET ALL INSTALLMENTS FOR A LOAN

   GET /api/loan-installments/customer-loan/:loanId
========================================================= */
export const getInstallmentsByLoan = async (loanId) => {
  try {
    const response = await api.get(
      `/loan-installments/customer-loan/${loanId}`,
    );
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
   UPDATE INSTALLMENT / PAYMENT

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
