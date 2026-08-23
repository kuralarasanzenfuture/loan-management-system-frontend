import api from "../../common/services/api.js";

// Customer Loan Reports
export const getLoanReports = async (params = {}) => {
  try {
    const response = await api.get("/customer-loans/loan-reports", {
      params,
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Loan Installment Reports
export const getLoanInstallmentsReport = async (params = {}) => {
  try {
    const response = await api.get("/customer-loans/installments-report", {
      params,
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Customer Loan Summary
export const getCustomerLoanSummary = async (params = {}) => {
  try {
    const response = await api.get("/customer-loans/customer-summary", {
      params,
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
