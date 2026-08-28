import api from "../../common/services/api.js";

// =========================================================
// SET USER PERMISSIONS - BULK
// POST /api/user-permissions/bulk
// =========================================================

export const setUserPermissions = async (formData) => {
  try {
    const response = await api.post("/user-permissions/bulk", formData);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// GET USER PERMISSIONS
// GET /api/user-permissions/user/:userId
// =========================================================

export const getUserPermissions = async (userId) => {
  try {
    const response = await api.get(`/user-permissions/user/${userId}`);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// GET USER PERMISSIONS TREE
// GET /api/user-permissions/user/:userId/tree
// =========================================================

export const getTreeUserPermissions = async (userId) => {
  try {
    const response = await api.get(`/user-permissions/user/${userId}/tree`);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
