import api from "../../common/services/api.js";

export const getAllCustomerLoans = async () => {
  try {
    const response = await api.get("/customer-loans");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getCustomerLoanById = async (id) => {
  try {
    const response = await api.get(`/customer-loans/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const createCustomerLoan = async (formData) => {
  try {
    const response = await api.post("/customer-loans", formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const updateCustomerLoan = async (id, formData) => {
  try {
    const response = await api.put(`/customer-loans/${id}`, formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const deleteCustomerLoan = async (id) => {
  try {
    const response = await api.delete(`/customer-loans/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const updateCustomerLoanStatus = async (id, formData) => {
  try {
    const response = await api.put(`/customer-loans/${id}/status`, formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};


