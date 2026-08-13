import api from "../../common/services/api.js";

const multipartConfig = {
  headers: { "Content-Type": "multipart/form-data" },
};

export const getAssets = async (params = {}) => {
  try {
    const response = await api.get("/assets", { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getAssetById = async (id) => {
  try {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const createAsset = async (formData) => {
  try {
    const response = await api.post("/assets", formData, multipartConfig);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const updateAsset = async (id, formData) => {
  try {
    const response = await api.put(`/assets/${id}`, formData, multipartConfig);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const deleteAsset = async (id) => {
  try {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
