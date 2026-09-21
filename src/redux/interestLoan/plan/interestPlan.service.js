import api from "../../../common/services/api.js";

// =========================================================
// CREATE INTEREST LOAN PLAN
// POST /api/interest-loan-plans
// =========================================================
export const createInterestPlan = async (formData) => {
  try {
    const response = await api.post("/interest-loan-plans", formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// GET ALL INTEREST LOAN PLANS
// GET /api/interest-loan-plans
// =========================================================
export const getAllInterestPlans = async (params = {}) => {
  try {
    const response = await api.get("/interest-loan-plans", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// GET ACTIVE INTEREST LOAN PLANS
// GET /api/interest-loan-plans/active
// =========================================================
export const getActiveInterestPlans = async () => {
  try {
    const response = await api.get("/interest-loan-plans/active");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// GET INTEREST LOAN PLAN BY ID
// GET /api/interest-loan-plans/:id
// =========================================================
export const getInterestPlanById = async (id) => {
  try {
    const response = await api.get(`/interest-loan-plans/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// UPDATE INTEREST LOAN PLAN
// PUT /api/interest-loan-plans/:id
// =========================================================
export const updateInterestPlan = async (id, formData) => {
  try {
    const response = await api.put(`/interest-loan-plans/${id}`, formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// UPDATE INTEREST LOAN PLAN STATUS
// PATCH /api/interest-loan-plans/:id/status
// =========================================================
export const updateInterestPlanStatus = async (id, data) => {
  try {
    const response = await api.patch(
      `/interest-loan-plans/${id}/status`,
      data,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// DELETE INTEREST LOAN PLAN
// DELETE /api/interest-loan-plans/:id
// =========================================================
export const deleteInterestPlan = async (id) => {
  try {
    const response = await api.delete(`/interest-loan-plans/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
