// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// import {
//   createPayment,
//   getPayments,
//   getPaymentById,
//   updatePayment,
//   deletePayment,
// } from "./personalChitPayment.service.js";

// // =========================================================
// // GET PAYMENTS BY CHIT
// // =========================================================

// export const fetchPayments = createAsyncThunk(
//   "personalChitPayments/fetchPayments",
//   async (chitId, { rejectWithValue }) => {
//     try {
//       return await getPayments(chitId);
//     } catch (err) {
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   },
// );

// // =========================================================
// // GET PAYMENT BY ID
// // =========================================================

// export const fetchPaymentById = createAsyncThunk(
//   "personalChitPayments/fetchPaymentById",
//   async ({ chitId, id }, { rejectWithValue }) => {
//     try {
//       return await getPaymentById(chitId, id);
//     } catch (err) {
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   },
// );

// // =========================================================
// // CREATE PAYMENT
// // =========================================================

// export const addPayment = createAsyncThunk(
//   "personalChitPayments/addPayment",
//   async ({ chitId, formData }, { rejectWithValue }) => {
//     try {
//       return await createPayment(chitId, formData);
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.message ||
//           err.message ||
//           "Failed to create payment",
//       );
//     }
//   },
// );

// // =========================================================
// // UPDATE PAYMENT
// // =========================================================

// export const editPayment = createAsyncThunk(
//   "personalChitPayments/editPayment",
//   async ({ chitId, id, formData }, { rejectWithValue }) => {
//     try {
//       return await updatePayment(chitId, id, formData);
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.message ||
//           err.message ||
//           "Failed to update payment",
//       );
//     }
//   },
// );

// // =========================================================
// // DELETE PAYMENT
// // =========================================================

// export const removePayment = createAsyncThunk(
//   "personalChitPayments/removePayment",
//   async ({ chitId, id }, { rejectWithValue }) => {
//     try {
//       await deletePayment(chitId, id);

//       return id;
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.message ||
//           err.message ||
//           "Failed to delete payment",
//       );
//     }
//   },
// );

// // =========================================================
// // SLICE
// // =========================================================

// const personalChitPaymentSlice = createSlice({
//   name: "personalChitPayments",

//   initialState: {
//     payments: [],
//     payment: null,
//     loading: false,
//     error: null,
//   },

//   reducers: {
//     clearPaymentError: (state) => {
//       state.error = null;
//     },

//     clearSelectedPayment: (state) => {
//       state.payment = null;
//     },

//     clearPayments: (state) => {
//       state.payments = [];
//     },
//   },

//   extraReducers: (builder) => {
//     builder

//       // =====================================================
//       // FETCH PAYMENTS
//       // =====================================================

//       .addCase(fetchPayments.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })

//       .addCase(fetchPayments.fulfilled, (state, action) => {
//         state.loading = false;

//         const data = action.payload?.data ?? action.payload;

//         state.payments = Array.isArray(data) ? data : [];
//       })

//       .addCase(fetchPayments.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // =====================================================
//       // FETCH PAYMENT BY ID
//       // =====================================================

//       .addCase(fetchPaymentById.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })

//       .addCase(fetchPaymentById.fulfilled, (state, action) => {
//         state.loading = false;

//         state.payment = action.payload?.data ?? action.payload;
//       })

//       .addCase(fetchPaymentById.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // =====================================================
//       // CREATE PAYMENT
//       // =====================================================

//       .addCase(addPayment.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })

//       .addCase(addPayment.fulfilled, (state, action) => {
//         state.loading = false;

//         const created = action.payload?.data ?? action.payload;

//         if (created) {
//           state.payments.unshift(created);
//         }
//       })

//       .addCase(addPayment.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // =====================================================
//       // UPDATE PAYMENT
//       // =====================================================

//       .addCase(editPayment.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })

//       .addCase(editPayment.fulfilled, (state, action) => {
//         state.loading = false;

//         const updated = action.payload?.data ?? action.payload;

//         if (!updated) return;

//         const index = state.payments.findIndex(
//           (item) => item.id === updated.id,
//         );

//         if (index !== -1) {
//           state.payments[index] = updated;
//         }

//         if (state.payment?.id === updated.id) {
//           state.payment = updated;
//         }
//       })

//       .addCase(editPayment.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // =====================================================
//       // DELETE PAYMENT
//       // =====================================================

//       .addCase(removePayment.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })

//       .addCase(removePayment.fulfilled, (state, action) => {
//         state.loading = false;

//         state.payments = state.payments.filter(
//           (item) => item.id !== action.payload,
//         );

//         if (state.payment?.id === action.payload) {
//           state.payment = null;
//         }
//       })

//       .addCase(removePayment.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { clearPaymentError, clearSelectedPayment, clearPayments } =
//   personalChitPaymentSlice.actions;

// export default personalChitPaymentSlice.reducer;

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  manualBulkInstallments,
} from "./personalChitPayment.service.js";

// =========================================================
// GET PAYMENTS BY CHIT
// =========================================================

export const fetchPayments = createAsyncThunk(
  "personalChitPayments/fetchPayments",
  async (chitId, { rejectWithValue }) => {
    try {
      return await getPayments(chitId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch payments",
      );
    }
  },
);

// =========================================================
// GET PAYMENT BY ID
// =========================================================

export const fetchPaymentById = createAsyncThunk(
  "personalChitPayments/fetchPaymentById",
  async ({ chitId, id }, { rejectWithValue }) => {
    try {
      return await getPaymentById(chitId, id);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch payment",
      );
    }
  },
);

// =========================================================
// CREATE PAYMENT
// =========================================================

export const addPayment = createAsyncThunk(
  "personalChitPayments/addPayment",
  async ({ chitId, formData }, { rejectWithValue }) => {
    try {
      return await createPayment(chitId, formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to create payment",
      );
    }
  },
);

// =========================================================
// UPDATE PAYMENT
// =========================================================

export const editPayment = createAsyncThunk(
  "personalChitPayments/editPayment",
  async ({ chitId, id, formData }, { rejectWithValue }) => {
    try {
      return await updatePayment(chitId, id, formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to update payment",
      );
    }
  },
);

// =========================================================
// DELETE PAYMENT
// =========================================================

export const removePayment = createAsyncThunk(
  "personalChitPayments/removePayment",
  async ({ chitId, id }, { rejectWithValue }) => {
    try {
      await deletePayment(chitId, id);

      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete payment",
      );
    }
  },
);

// =========================================================
// MANUAL BULK INSTALLMENTS
// =========================================================

export const manualBulkInstallment = createAsyncThunk(
  "personalChitPayments/manualBulkInstallment",
  async ({ chitId, formData }, { rejectWithValue }) => {
    try {
      return await manualBulkInstallments(chitId, formData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to create bulk installments",
      );
    }
  },
);

// =========================================================
// SLICE
// =========================================================

const personalChitPaymentSlice = createSlice({
  name: "personalChitPayments",

  initialState: {
    payments: [],
    payment: null,

    // Result from manual bulk installment operation
    bulkInstallmentResult: null,

    loading: false,
    error: null,
  },

  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },

    clearSelectedPayment: (state) => {
      state.payment = null;
    },

    clearPayments: (state) => {
      state.payments = [];
    },

    clearBulkInstallmentResult: (state) => {
      state.bulkInstallmentResult = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =====================================================
      // FETCH PAYMENTS
      // =====================================================

      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;

        const data = action.payload?.data ?? action.payload;

        // Prevent .filter() / .map() errors
        state.payments = Array.isArray(data) ? data : [];
      })

      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // FETCH PAYMENT BY ID
      // =====================================================

      .addCase(fetchPaymentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.loading = false;

        state.payment = action.payload?.data ?? action.payload;
      })

      .addCase(fetchPaymentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // CREATE PAYMENT
      // =====================================================

      .addCase(addPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(addPayment.fulfilled, (state, action) => {
        state.loading = false;

        const created = action.payload?.data ?? action.payload;

        if (created) {
          state.payments.unshift(created);
        }
      })

      .addCase(addPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // UPDATE PAYMENT
      // =====================================================

      .addCase(editPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(editPayment.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload?.data ?? action.payload;

        if (!updated) return;

        const index = state.payments.findIndex(
          (item) => item.id === updated.id,
        );

        if (index !== -1) {
          state.payments[index] = updated;
        }

        if (state.payment?.id === updated.id) {
          state.payment = updated;
        }
      })

      .addCase(editPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // DELETE PAYMENT
      // =====================================================

      .addCase(removePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(removePayment.fulfilled, (state, action) => {
        state.loading = false;

        state.payments = state.payments.filter(
          (item) => item.id !== action.payload,
        );

        if (state.payment?.id === action.payload) {
          state.payment = null;
        }
      })

      .addCase(removePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =====================================================
      // MANUAL BULK INSTALLMENTS
      // =====================================================

      .addCase(manualBulkInstallment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.bulkInstallmentResult = null;
      })

      .addCase(manualBulkInstallment.fulfilled, (state, action) => {
        state.loading = false;

        state.bulkInstallmentResult = action.payload?.data ?? action.payload;

        /*
         * If backend returns the newly created payments,
         * update the payments list.
         */
        const result = action.payload?.data ?? action.payload;

        if (Array.isArray(result)) {
          state.payments = result;
        } else if (Array.isArray(result?.payments)) {
          state.payments = result.payments;
        }
      })

      .addCase(manualBulkInstallment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// =========================================================
// ACTIONS
// =========================================================

export const {
  clearPaymentError,
  clearSelectedPayment,
  clearPayments,
  clearBulkInstallmentResult,
} = personalChitPaymentSlice.actions;

// =========================================================
// REDUCER
// =========================================================

export default personalChitPaymentSlice.reducer;
