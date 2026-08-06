import api from "../../common/services/api.js";

export const getAllCustomers = async () => {
  try {
    const response = await api.get("/customers");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getCustomerById = async (id) => {
  try {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const createCustomer = async (formData) => {
  try {
    const response = await api.post("/customers", formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const updateCustomer = async (id, formData) => {
  try {
    const response = await api.put(`/customers/${id}`, formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const deleteCustomer = async (id) => {
  try {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
