import api from "../../common/services/api.js";

/* =========================================================
   GET FULL SCHEDULE FOR LOAN

   GET /api/interest-only-schedules/loan/:loan_id
========================================================= */

export const getLoanSchedules = async (loanId) => {
  try {
    const response = await api.get(`/interest-only-schedules/loan/${loanId}`);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   GET PENDING SCHEDULES

   GET /api/interest-only-schedules/loan/:loan_id/pending
========================================================= */

export const getPendingSchedules = async (loanId) => {
  try {
    const response = await api.get(
      `/interest-only-schedules/loan/${loanId}/pending`,
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   GET OVERDUE SCHEDULES

   GET /api/interest-only-schedules/loan/:loan_id/overdue
========================================================= */

export const getOverdueSchedules = async (loanId) => {
  try {
    const response = await api.get(
      `/interest-only-schedules/loan/${loanId}/overdue`,
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   GET SINGLE SCHEDULE

   GET /api/interest-only-schedules/:id
========================================================= */

export const getScheduleById = async (id) => {
  try {
    const response = await api.get(`/interest-only-schedules/${id}`);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   GET TODAY COLLECTIONS
   GET /api/interest-only-schedules/today-collections
========================================================= */
export const getTodayCollections = async (date, status = "all", search = "") => {
  try {
    const params = new URLSearchParams();
    if (date) params.append("date", date);
    if (status) params.append("status", status);
    if (search) params.append("search", search);

    const queryString = params.toString();
    const url = `/interest-only-schedules/today-collections${queryString ? `?${queryString}` : ""}`;
    const response = await api.get(url);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   GET GLOBAL OVERDUE COLLECTIONS
   GET /api/interest-only-schedules/overdue
========================================================= */
export const getOverdueCollectionsGlobal = async (search = "") => {
  try {
    const params = new URLSearchParams();
    if (search) params.append("search", search);

    const queryString = params.toString();
    const url = `/interest-only-schedules/overdue${queryString ? `?${queryString}` : ""}`;
    const response = await api.get(url);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

