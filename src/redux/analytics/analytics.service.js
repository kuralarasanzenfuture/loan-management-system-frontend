import api from "../../common/services/api.js";

export const getDashboard = async (params = {}) => {
  try {
    const response = await api.get("/analytics/dashboard", { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
