import api from "../../common/services/api.js";

export const getAssetCategories = async () => {
  try {
    const response = await api.get("/asset-categories");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getAssetCategoryById = async (id) => {
  try {
    const response = await api.get(`/asset-categories/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const createAssetCategory = async (formData) => {
  try {
    const response = await api.post("/asset-categories", formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const updateAssetCategory = async (id, formData) => {
  try {
    const response = await api.put(`/asset-categories/${id}`, formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const deleteAssetCategory = async (id) => {
  try {
    const response = await api.delete(`/asset-categories/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
