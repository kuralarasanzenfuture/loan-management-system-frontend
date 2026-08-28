import api from "../../common/services/api.js";

// =========================================================
// GET MODULES + ACTIONS TREE
// =========================================================

export const getModulesActionsTree = async () => {
  try {
    const response = await api.get("/modules-actions/tree");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// =========================================================
// GET MODULES + ACTIONS FLAT
// =========================================================

export const getModulesActionsFlat = async () => {
  try {
    const response = await api.get("/modules-actions/flat");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
