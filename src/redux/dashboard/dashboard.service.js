import api from "../../common/services/api";

export const getDashboardOverview = async () => {
  try {
    const response = await api.get("/dashboard/overview", {
      params: {},
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getPortfolioTrends = async () => {
  try {
    const response = await api.get("/dashboard/portfolio-trends", {
      params: {},
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getLoanPlanMix = async () => {
  try {
    const response = await api.get("/dashboard/loan-plan-mix", {
      params: {},
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getPortfolioHealth = async () => {
  try {
    const response = await api.get("/dashboard/portfolio-health");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getRecentLoans = async () => {
  try {
    const response = await api.get("/dashboard/recent-loans");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getQuickInsights = async () => {
  try {
    const response = await api.get("/dashboard/quick-insights");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const getTopLoanOfficers = async () => {
  try {
    const response = await api.get("/dashboard/top-officers");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
