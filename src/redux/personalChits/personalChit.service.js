import api from "../../common/services/api.js";

export const getPersonalChits = async () => {
  try {
    const response = await api.get("/personal-chits", { params: {} });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getPersonalChitById = async (id) => {
  try {
    const response = await api.get(`/personal-chits/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const createPersonalChit = async (formData) => {
  try {
    const response = await api.post("/personal-chits", formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const updatePersonalChit = async (id, formData) => {
  try {
    const response = await api.put(`/personal-chits/${id}`, formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const deletePersonalChit = async (id) => {
  try {
    const response = await api.delete(`/personal-chits/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const markChitTaken = async (id, data) => {
  try {
    const response = await api.patch(`/personal-chits/${id}/taken`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const updateChitStatus = async (id, data) => {
  try {
    const response = await api.patch(
      `/personal-chits/${id}/status`,
      data,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

