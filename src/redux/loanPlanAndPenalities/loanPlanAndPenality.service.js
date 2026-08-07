import api from "../../common/services/api.js";

export const getLoanPlanAndPenalities = async () => {
  try {
    const response = await api.get("/loan-plans");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getLoanPlanAndPenalityById = async (id) => {
  try {
    const response = await api.get(`/loan-plans/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const createLoanPlanAndPenality = async (formData) => {
  try {
    const response = await api.post("/loan-plans", formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const updateLoanPlanAndPenality = async (id, formData) => {
  try {
    const response = await api.put(
      `/loan-plans/${id}`,
      formData,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const deleteLoanPlanAndPenality = async (id) => {
  try {
    const response = await api.delete(`/loan-plans/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
