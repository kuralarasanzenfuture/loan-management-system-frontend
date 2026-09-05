import api from "../../common/services/api";

export const getDashboardOverview = async (params = {}) => {
  try {
    const response = await api.get("/dashboard/overview", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getPortfolioTrends = async (params = {}) => {
  try {
    const response = await api.get("/dashboard/portfolio-trends", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getLoanPlanMix = async (params = {}) => {
  try {
    const response = await api.get("/dashboard/loan-plan-mix", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getPortfolioHealth = async (params = {}) => {
  try {
    const response = await api.get("/dashboard/portfolio-health", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getRecentLoans = async (params = {}) => {
  try {
    const response = await api.get("/dashboard/recent-loans", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getQuickInsights = async (params = {}) => {
  try {
    const response = await api.get("/dashboard/quick-insights", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getTopLoanOfficers = async (params = {}) => {
  try {
    const response = await api.get("/dashboard/top-officers", {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

