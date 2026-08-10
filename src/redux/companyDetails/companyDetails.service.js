import api from "../../common/services/api.js";

export const getCompanyDetails = async () => {
  try {
    const response = await api.get("/company-details");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getCompanyDetailById = async (id) => {
  try {
    const response = await api.get(`/company-details/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const createCompanyDetails = async (formData) => {
  try {
    const response = await api.post("/company-details", formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const updateCompanyDetails = async (id, formData) => {
  try {
    const response = await api.put(`/company-details/${id}`, formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const deleteCompanyDetails = async (id) => {
  try {
    const response = await api.delete(`/company-details/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
