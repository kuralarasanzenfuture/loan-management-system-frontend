import api from "../../common/services/api.js";

/* =========================================================
   CREATE INTEREST ONLY LOAN

   POST /api/interest-only-loans
========================================================= */

export const createInterestOnlyLoan = async (formData) => {
  try {
    const response = await api.post("/interest-only-loans", formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   GET ALL INTEREST ONLY LOANS

   GET /api/interest-only-loans

   Optional filters:
   ?status=active
   ?customer_id=1
   ?search=john
   ?from_date=2026-01-01
   ?to_date=2026-12-31
========================================================= */

export const getInterestOnlyLoans = async (params = {}) => {
  try {
    const response = await api.get("/interest-only-loans", {
      params,
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   GET INTEREST ONLY LOAN BY ID

   GET /api/interest-only-loans/:id

   Returns loan + repayment schedules
========================================================= */

export const getInterestOnlyLoanById = async (id) => {
  try {
    const response = await api.get(`/interest-only-loans/${id}`);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   GET LOANS BY CUSTOMER

   GET /api/interest-only-loans/customer/:customer_id
========================================================= */

export const getInterestOnlyLoansByCustomer = async (customerId) => {
  try {
    const response = await api.get(
      `/interest-only-loans/customer/${customerId}`,
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   UPDATE LOAN STATUS

   PATCH /api/interest-only-loans/:id/status

   Example:
   {
     "status": "active"
   }
========================================================= */

export const updateInterestOnlyLoanStatus = async (id, data) => {
  try {
    const response = await api.patch(`/interest-only-loans/${id}/status`, data);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   UPDATE INTEREST ONLY LOAN
   PUT /api/interest-only-loans/:id
========================================================= */

export const updateInterestOnlyLoan = async (id, formData) => {
  try {
    const response = await api.put(`/interest-only-loans/${id}`, formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   DELETE INTEREST ONLY LOAN

   DELETE /api/interest-only-loans/:id
========================================================= */

export const deleteInterestOnlyLoan = async (id) => {
  try {
    const response = await api.delete(`/interest-only-loans/${id}`);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   REGENERATE LOAN SCHEDULE

   POST /api/interest-only-loans/:id/regenerate-schedule
========================================================= */

export const regenerateInterestOnlyLoanSchedule = async (id, data = {}) => {
  try {
    const response = await api.post(
      `/interest-only-loans/${id}/regenerate-schedule`,
      data,
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

