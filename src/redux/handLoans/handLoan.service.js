import api from "../../common/services/api.js";

export const getHandLoans = async (params = {}) => {
  try {
    const response = await api.get("/hand-loans", {
      params: {
        limit: 10000,
        ...params,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getHandLoanById = async (id) => {
  try {
    const response = await api.get(`/hand-loans/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const createHandLoan = async (formData) => {
  try {
    const response = await api.post("/hand-loans", formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const updateHandLoan = async (id, formData) => {
  try {
    const response = await api.put(`/hand-loans/${id}`, formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const deleteHandLoan = async (id) => {
  try {
    const response = await api.delete(`/hand-loans/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const addTransaction = async (id, formData) => {
  try {
    const response = await api.post(`/hand-loans/${id}/transactions`, formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getTransactionsByLoan = async (id) => {
  try {
    const response = await api.get(`/hand-loans/${id}/transactions`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
