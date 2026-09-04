import api from "../../common/services/api.js";

// =========================================================
// CREATE INTEREST ONLY LOAN PLAN
// POST /api/interest-only-loan-plans
// =========================================================

export const createInterestOnlyLoanPlan = async (formData) => {
  try {
    const response = await api.post("/interest-only-loan-plans", formData);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// GET ALL INTEREST ONLY LOAN PLANS
// GET /api/interest-only-loan-plans
//
// Optional params:
// ?status=active
// ?interest_type=percentage
// ?interest_frequency=monthly
// ?tenure_type=months
// ?search=monthly
// =========================================================

export const getAllInterestOnlyLoanPlans = async (params = {}) => {
  try {
    const response = await api.get("/interest-only-loan-plans", {
      params,
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// GET ACTIVE INTEREST ONLY LOAN PLANS
// GET /api/interest-only-loan-plans/active
// =========================================================

export const getActiveInterestOnlyLoanPlans = async () => {
  try {
    const response = await api.get("/interest-only-loan-plans/active");

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// GET INTEREST ONLY LOAN PLAN BY ID
// GET /api/interest-only-loan-plans/:id
// =========================================================

export const getInterestOnlyLoanPlanById = async (id) => {
  try {
    const response = await api.get(`/interest-only-loan-plans/${id}`);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// UPDATE INTEREST ONLY LOAN PLAN
// PUT /api/interest-only-loan-plans/:id
// =========================================================

export const updateInterestOnlyLoanPlan = async (id, formData) => {
  try {
    const response = await api.put(`/interest-only-loan-plans/${id}`, formData);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// UPDATE INTEREST ONLY LOAN PLAN STATUS
// PATCH /api/interest-only-loan-plans/:id/status
//
// Example:
// { status: "inactive" }
// =========================================================

export const updateInterestOnlyLoanPlanStatus = async (id, data) => {
  try {
    const response = await api.patch(
      `/interest-only-loan-plans/${id}/status`,
      data,
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// DELETE INTEREST ONLY LOAN PLAN
// DELETE /api/interest-only-loan-plans/:id
// =========================================================

export const deleteInterestOnlyLoanPlan = async (id) => {
  try {
    const response = await api.delete(`/interest-only-loan-plans/${id}`);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
