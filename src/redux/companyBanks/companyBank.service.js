import api from "../../common/services/api.js";

export const getCompanyBanks = async () => {
  try {
    const response = await api.get("/company-banks");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getCompanyBankById = async (id) => {
  try {
    const response = await api.get(`/company-banks/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const createCompanyBank = async (formData) => {
  try {
    const response = await api.post("/company-banks", formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const updateCompanyBank = async (id, formData) => {
  try {
    const response = await api.put(`/company-banks/${id}`, formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const deleteCompanyBank = async (id) => {
  try {
    const response = await api.delete(`/company-banks/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const setPrimary = async (id) => {
  try {
    const response = await api.put(`/company-banks/${id}/primary`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
