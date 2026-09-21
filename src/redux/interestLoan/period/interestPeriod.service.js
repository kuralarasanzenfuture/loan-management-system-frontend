import api from "../../../common/services/api.js";

// =========================================================
// GET ALL PERIODS FOR A LOAN
// GET /api/interest-loans/periods/loan/:loanId
// =========================================================
export const getPeriodsByLoanId = async (loanId) => {
  try {
    const response = await api.get(`/interest-loans/periods/loan/${loanId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// GET SINGLE PERIOD BY ID
// GET /api/interest-loans/periods/:id
// =========================================================
export const getPeriodById = async (id) => {
  try {
    const response = await api.get(`/interest-loans/periods/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// SYNC DUE PERIODS
// POST /api/interest-loans/periods/sync-due
// =========================================================
export const syncDuePeriods = async (loanId = null) => {
  try {
    const url = loanId
      ? `/interest-loans/periods/sync-due?loan_id=${loanId}`
      : `/interest-loans/periods/sync-due`;
    const response = await api.post(url);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
