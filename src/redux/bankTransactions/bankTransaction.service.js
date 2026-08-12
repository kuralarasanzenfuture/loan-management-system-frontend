import api from "../../common/services/api.js";

/* =========================================================
   GET ALL BANK TRANSACTIONS
   Supports Filters:
   company_bank_id
   transaction_type
   from_date
   to_date
========================================================= */
export const getBankTransactions = async (params = {}) => {
  try {
    const response = await api.get("/bank-transactions", {
      params,
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   GET TRANSACTION SUMMARY
========================================================= */
export const getBankTransactionSummary = async (params = {}) => {
  try {
    const response = await api.get("/bank-transactions/summary", {
      params,
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   GET TRANSACTION BY ID
========================================================= */
export const getBankTransactionById = async (id) => {
  try {
    const response = await api.get(`/bank-transactions/${id}`);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   GET TRANSACTION BY NUMBER
========================================================= */
export const getBankTransactionByNumber = async (transactionNo) => {
  try {
    const response = await api.get(
      `/bank-transactions/number/${transactionNo}`,
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   CREATE TRANSACTION
========================================================= */
export const createBankTransaction = async (formData) => {
  try {
    const response = await api.post("/bank-transactions", formData);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

/* =========================================================
   REVERSE TRANSACTION
========================================================= */
export const reverseBankTransaction = async (id) => {
  try {
    const response = await api.post(`/bank-transactions/${id}/reverse`);

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
