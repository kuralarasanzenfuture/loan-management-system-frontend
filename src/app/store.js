import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../redux/auth/authSlice.js";
import roleReducer from "../redux/roles/roleSlice.js";
import userReducer from "../redux/users/userSlice.js";
import customerReducer from "../redux/customers/customerSlice.js";
import loanPlanAndPenalityReducer from "../redux/loanPlanAndPenalities/loanPlanAndPenalitySlice.js";
import customerLoanReducer from "../redux/customerLoans/customerLoanSlice.js";
import installmentReducer from "../redux/installments/installmentSlice.js";
import companyDetailsReducer from "../redux/companyDetails/companyDetailsSlice.js";
import companyBankReducer from "../redux/companyBanks/companyBankSlice.js";
import bankTransactionReducer from "../redux/bankTransactions/bankTransactionSlice.js";
import assetCategoryReducer from "../redux/assetCategories/assetCategorySlice.js";
import assetReducer from "../redux/assets/assetSlice.js";
import handLoanReducer from "../redux/handLoans/handLoanSlice.js";
import personalChitReducer from "../redux/personalChits/personalChitSlice.js";
import personalChitPaymentReducer from "../redux/personalChitPayment/personalChitPaymentSlice.js";
import analyticsReducer from "../redux/analytics/analyticsSlice.js";
import loanReportsReducer from "../redux/loanReports/loanReportsSlice.js";
import dashboardReducer from "../redux/dashboard/dashboardSlice.js";
import modulesActionsReducer from "../redux/modulesActions/modulesActionsSlice.js";
import rolePermissionReducer from "../redux/rolePermissions/rolePermissionSlice.js";
import userPermissionReducer from "../redux/userPermissions/userPermissionSlice.js";
import interestLoanPlanReducer from "../redux/interestLoanPlan/interestLoanPlanSlice.js";
import interestOnlyLoanReducer from "../redux/interestOnlyLoans/interestLoanSlice.js";
import interestOnlyScheduleReducer from "../redux/interestOnlySchedule/interestOnlyScheduleSlice.js";
import interestOnlyPaymentReducer from "../redux/interestOnlyPayment/interestOnlyPaymentSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    roles: roleReducer,
    users: userReducer,
    customers: customerReducer,
    loanPlanAndPenalities: loanPlanAndPenalityReducer,
    customerLoans: customerLoanReducer,
    loanReports: loanReportsReducer,
    installments: installmentReducer,
    companyDetails: companyDetailsReducer,
    companyBanks: companyBankReducer,
    bankTransactions: bankTransactionReducer,
    assetCategories: assetCategoryReducer,
    assets: assetReducer,
    handLoans: handLoanReducer,
    personalChits: personalChitReducer,
    personalChitPayments: personalChitPaymentReducer,
    analytics: analyticsReducer,
    dashboard: dashboardReducer,
    modulesActions: modulesActionsReducer,
    rolePermissions: rolePermissionReducer,
    userPermissions: userPermissionReducer,
    interestLoanPlans: interestLoanPlanReducer,
    interestOnlyLoans: interestOnlyLoanReducer,
    interestOnlySchedules: interestOnlyScheduleReducer,
    interestOnlyPayments: interestOnlyPaymentReducer,
    // },
    // middleware: (getDefaultMiddleware) => {
    //   return getDefaultMiddleware({
    //     serializableCheck: false,
    //   });
  },
});
