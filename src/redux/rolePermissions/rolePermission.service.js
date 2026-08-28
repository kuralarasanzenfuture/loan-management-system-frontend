import api from "../../common/services/api.js";

// =========================================================
// SET ROLE PERMISSIONS - BULK
// POST /api/role-permissions/bulk
// =========================================================

export const setRolePermissions = async (formData) => {
  try {
    const response = await api.post("/role-permissions/bulk", formData);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// GET ROLE PERMISSIONS
// GET /api/role-permissions/role/:roleId
// =========================================================

export const getRolePermissions = async (roleId) => {
  try {
    const response = await api.get(`/role-permissions/role/${roleId}`);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// GET ROLE PERMISSIONS TREE
// GET /api/role-permissions/role/:roleId/tree
// =========================================================

export const getTreeRolePermissions = async (roleId) => {
  try {
    const response = await api.get(`/role-permissions/role/${roleId}/tree`);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
