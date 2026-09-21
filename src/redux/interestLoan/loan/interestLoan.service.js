import api from "../../../common/services/api.js";

// =========================================================
// CREATE INTEREST LOAN
// POST /api/interest-loans
// =========================================================
export const createInterestLoan = async (formData) => {
  try {
    const response = await api.post("/interest-loans", formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// GET ALL INTEREST LOANS (With filters & pagination)
// GET /api/interest-loans
// =========================================================
export const getAllInterestLoans = async (params = {}) => {
  try {
    const response = await api.get("/interest-loans", { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// GET PORTFOLIO SUMMARY METRICS
// GET /api/interest-loans/summary
// =========================================================
export const getInterestLoanSummary = async () => {
  try {
    const response = await api.get("/interest-loans/summary");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// GET INTEREST LOAN BY ID (With complete period schedule)
// GET /api/interest-loans/:id
// =========================================================
export const getInterestLoanById = async (id) => {
  try {
    const response = await api.get(`/interest-loans/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// GET INTEREST LOANS BY CUSTOMER ID
// GET /api/interest-loans/customer/:customerId
// =========================================================
export const getInterestLoansByCustomer = async (customerId) => {
  try {
    const response = await api.get(`/interest-loans/customer/${customerId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// UPDATE INTEREST LOAN
// PUT /api/interest-loans/:id
// =========================================================
export const updateInterestLoan = async (id, formData) => {
  try {
    const response = await api.put(`/interest-loans/${id}`, formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// DELETE INTEREST LOAN
// DELETE /api/interest-loans/:id
// =========================================================
export const deleteInterestLoan = async (id) => {
  try {
    const response = await api.delete(`/interest-loans/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

