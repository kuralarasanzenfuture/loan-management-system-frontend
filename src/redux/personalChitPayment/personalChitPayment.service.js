import api from "../../common/services/api";

export const createPayment = async (id, formData) => {
  try {
    const response = await api.post(
      `/personal-chit-payments/${id}/payments`,
      formData,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getPayments = async (chitId) => {
  try {
    const response = await api.get(
      `/personal-chit-payments/${chitId}/payments`,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getPaymentById = async (chitId, id) => {
  try {
    const response = await api.get(
      `/personal-chit-payments/${chitId}/payments/${id}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const updatePayment = async (chitId, id, formData) => {
  try {
    const response = await api.put(
      `/personal-chit-payments/${chitId}/payments/${id}`,
      formData,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const deletePayment = async (chitId, id) => {
  try {
    const response = await api.delete(
      `/personal-chit-payments/${chitId}/payments/${id}`,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const manualBulkInstallments = async (id, formData) => {
  try {
    const response = await api.post(
      `/personal-chit-payments/${id}/manual-bulk-installments`,
      formData,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

