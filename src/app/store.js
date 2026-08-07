import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../redux/auth/authSlice.js";
import roleReducer from "../redux/roles/roleSlice.js";
import userReducer from "../redux/users/userSlice.js";
import customerReducer from "../redux/customers/customerSlice.js";
import loanPlanAndPenalityReducer from "../redux/loanPlanAndPenalities/loanPlanAndPenalitySlice.js";
import customerLoanReducer from "../redux/customerLoans/customerLoanSlice.js";
import installmentReducer from "../redux/installments/installmentSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    roles: roleReducer,
    users: userReducer,
    customers: customerReducer,
    loanPlanAndPenalities: loanPlanAndPenalityReducer,
    customerLoans: customerLoanReducer,
    installments: installmentReducer,
  },
});
