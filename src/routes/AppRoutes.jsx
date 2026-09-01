// import { Routes, Route } from "react-router-dom";

// import PublicRoute from "./PublicRoute.jsx";
// import ProtectedRoute from "./ProtectedRoute.jsx";

// // import LoginPage from "../features/auth/pages/LoginPage";
// import LoanLoginPage from "../features/auth/pages/LoanLoginPage";

// import MainLayout from "../common/layouts/MainLayout.jsx";
// import DashboardPage from "../features/dashboard/pages/DashboardPage.jsx";
// import RolesPage from "../features/roles/pages/RolesPage.jsx";
// import UsersPage from "../features/users/pages/UsersPage.jsx";
// import CustomersPage from "../features/customers/pages/CustomersPage.jsx";
// // import CustomerViewPage from "../features/customers/pages/CustomerViewPage.jsx";
// import CustomerViewPage from "../features/customers/pages/CustomerViewPage-new.jsx";
// import ProfilePage from "../common/pages/ProfilePage.jsx";
// import SettingsPage from "../features/settings/pages/SettingsPage.jsx";
// import LoanPlansPage from "../features/loanPlan/pages/LoanPlansPage.jsx";
// import LoanPlanViewPage from "../features/loanPlan/pages/LoanPlanViewPage.jsx";
// import CustomerLoansPage from "../features/customerLoans/pages/CustomerLoansPage.jsx";
// import LoanViewPage from "../features/customerLoans/pages/LoanViewPage.jsx";
// import Analytics from "../features/Analytics/pages/Analytics.jsx";
// import CompanyDetailsViewPage from "../features/companyDetails/pages/CompanyDetailsViewPage.jsx";
// import CompanyDetailsListPage from "../features/companyDetails/pages/CompanyDetailsListPage.jsx";
// import CompanyDetailsFormPage from "../features/companyDetails/components/CompanyDetailsFormPage.jsx";
// import CompanyBanksPage from "../features/companyBank/pages/CompanyBanksPage.jsx";
// import CompanyBankViewPage from "../features/companyBank/pages/CompanyBankViewPage.jsx";
// import BankTransactionsPage from "../features/bankTransactions/pages/BankTransactionsPage.jsx";
// import BankTransactionViewPage from "../features/bankTransactions/pages/BankTransactionViewPage.jsx";
// import AssetCategoriesPage from "../features/assetCategory/pages/AssetCategoriesPage.jsx";
// import AssetsPage from "../features/assets/pages/AssetsPage.jsx";
// import AssetViewPage from "../features/assets/pages/AssetViewPage.jsx";
// import HandLoansPage from "../features/handLoans/pages/HandLoansPage.jsx";
// import HandLoanViewPage from "../features/handLoans/pages/HandLoanViewPage.jsx";
// import PersonalChitsPage from "../features/personalChit/pages/PersonalChitsPage.jsx";
// import PersonalChitViewPage from "../features/personalChit/pages/PersonalChitViewPage.jsx";
// import LoanCollectionPage from "../features/collectionLoan/pages/LoanCollectionPage.jsx";
// import CollectionDashboardPage from "../features/collectionLoan/pages/CollectionDashboardPage.jsx";
// import CollectionReportsPage from "../features/collectionLoan/reports/pages/CollectionReportsPage.jsx";
// import NotFoundPage from "../common/pages/NotFoundPage.jsx";
// import LoanReportsPage from "../features/reports/loanReports/pages/LoanReportsPage.jsx";
// import InstallmentReportsPage from "../features/reports/installmentReports/pages/InstallmentReportsPage.jsx";
// import CustomerLoanSummaryPage from "../features/reports/customerReports/pages/CustomerLoanSummaryPage.jsx";
// import RolePermissionsPage from "../features/permissions/pages/RolePermissionsPage.jsx";
// import UserPermissionsPage from "../features/permissions/pages/UserPermissionsPage.jsx";
// import UnauthorizedPage from "../common/pages/UnauthorizedPage.jsx";

// const AppRoutes = () => {
//   return (
//     <Routes>
//       {/* Login */}
//       <Route element={<PublicRoute />}>
//         {/* Public */}
//         <Route path="/" element={<LoanLoginPage />} />
//         <Route path="/login" element={<LoanLoginPage />} />
//       </Route>

//       {/* Protected */}
//       <Route element={<ProtectedRoute />}>
//         {/* Dashboard Layout — wraps all authenticated pages so they share
//             the sidebar, header (theme selector, profile dropdown, etc.),
//             and the proper bg-base-200 page background. */}
//         <Route element={<MainLayout />}>
//           <Route path="/dashboard" element={<DashboardPage />} />
//           <Route path="/analytics" element={<Analytics />} />
//           <Route path="/customers" element={<CustomersPage />} />
//           <Route path="/customers/:id" element={<CustomerViewPage />} />
//           <Route
//             path="/customer-documents"
//             element={<div>Customer Documesnts Page</div>}
//           />
//           <Route path="/guarantors" element={<div>Guarantors Page</div>} />
//           <Route path="/loan-plans" element={<LoanPlansPage />} />
//           <Route path="/loan-plans/:id" element={<LoanPlanViewPage />} />
//           {/* <Route
//             path="/loan-applications"
//             element={<div>Loan Applications Page</div>}
//           /> */}
//           <Route path="/loan-applications" element={<CustomerLoansPage />} />
//           <Route path="/loans/:id" element={<LoanViewPage />} />
//           {/* <Route path="/loans/:id" element={<div >View Loan</div>} /> */}
//           <Route
//             path="/loan-approval"
//             element={<div>Loan Approval Page</div>}
//           />
//           <Route path="/roles" element={<RolesPage />} />
//           <Route path="/users" element={<UsersPage />} />
//           <Route path="/repayments" element={<div>Repayments Page</div>} />
//           {/* Singleton usage (simplest — one company, no list needed) */}
//           <Route
//             path="/companies-details"
//             element={<CompanyDetailsViewPage />}
//           />

//           {/* // OR multi-company usage (if you go that route) */}
//           {/* <Route
//             path="/settings/companies"
//             element={<CompanyDetailsListPage />}
//           />
//           <Route
//             path="/settings/companies/new"
//             element={<CompanyDetailsFormPage initialData={null} />}
//           />
//           <Route
//             path="/settings/companies/:id/edit"
//             element={<CompanyDetailsEditWrapper />} // fetches by id, then renders CompanyDetailsFormPage
//           />
//           <Route
//             path="/settings/companies/:id"
//             element={<CompanyDetailsSingleViewPage />}
//           /> */}

//           <Route path="/bank-accounts" element={<CompanyBanksPage />} />
//           <Route path="/bank-accounts/:id" element={<CompanyBankViewPage />} />
//           <Route path="/bank-transactions" element={<BankTransactionsPage />} />
//           <Route
//             path="/bank-transactions/:id"
//             element={<BankTransactionViewPage />}
//           />

//           <Route path="/asset-categories" element={<AssetCategoriesPage />} />

//           <Route path="/assets" element={<AssetsPage />} />
//           <Route path="/assets/:id" element={<AssetViewPage />} />

//           <Route path="/hand-loans" element={<HandLoansPage />} />
//           <Route path="/hand-loans/:id" element={<HandLoanViewPage />} />

//           <Route path="/personal-chits" element={<PersonalChitsPage />} />
//           <Route
//             path="/personal-chits/:id"
//             element={<PersonalChitViewPage />}
//           />

//           {/* Collection & EMI routes */}
//           <Route path="/loan-collections" element={<LoanCollectionPage />} />
//           <Route
//             path="/loan-collections/:loanId"
//             element={<LoanCollectionPage />}
//           />
//           <Route
//             path="/loans/:loanId/collections"
//             element={<LoanCollectionPage />}
//           />
//           <Route
//             path="/loans/:loanId/collection"
//             element={<LoanCollectionPage />}
//           />

//           <Route path="/loan-reports" element={<LoanReportsPage />} />
//           <Route
//             path="/installment-reports"
//             element={<InstallmentReportsPage />}
//           />
//           <Route
//             path="/customer-reports"
//             element={<CustomerLoanSummaryPage />}
//           />

//           <Route
//             path="/due-collections"
//             element={<CollectionDashboardPage />}
//           />
//           <Route path="/emi-collection" element={<CollectionDashboardPage />} />
//           <Route path="/collection" element={<CollectionDashboardPage />} />

//           <Route
//             path="/reports/loan-collections"
//             element={<CollectionReportsPage />}
//           />

//           <Route path="/role-permissions" element={<RolePermissionsPage />} />
//           <Route
//             path="/role-permissions/:roleId"
//             element={<RolePermissionsPage />}
//           />
//           <Route path="/user-permissions" element={<UserPermissionsPage />} />
//           <Route
//             path="/user-permissions/:userId"
//             element={<UserPermissionsPage />}
//           />

//           {/* Profile & Settings now live inside MainLayout so they get the
//               shared header, sidebar, and correct dark-mode background. */}
//           <Route path="/profile" element={<ProfilePage />} />
//           <Route path="/settings" element={<SettingsPage />} />
//         </Route>

//         {/* 404 — catches any unmatched path for authenticated users */}
//         <Route path="*" element={<NotFoundPage />} />
//       </Route>

//       {/* Global 404 — catches unmatched paths outside protected scope */}
//       <Route path="*" element={<NotFoundPage />} />
//       <Route path="/unauthorized" element={<UnauthorizedPage />} />
//     </Routes>
//   );
// };

// export default AppRoutes;

/*=============================================== */

import { Routes, Route } from "react-router-dom";

import PublicRoute from "./PublicRoute.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

// import LoginPage from "../features/auth/pages/LoginPage";
import LoanLoginPage from "../features/auth/pages/LoanLoginPage";

import MainLayout from "../common/layouts/MainLayout.jsx";
import DashboardPage from "../features/dashboard/pages/DashboardPage.jsx";
import RolesPage from "../features/roles/pages/RolesPage.jsx";
import UsersPage from "../features/users/pages/UsersPage.jsx";
import CustomersPage from "../features/customers/pages/CustomersPage.jsx";
// import CustomerViewPage from "../features/customers/pages/CustomerViewPage.jsx";
import CustomerViewPage from "../features/customers/pages/CustomerViewPage-new.jsx";
import ProfilePage from "../common/pages/ProfilePage.jsx";
import SettingsPage from "../features/settings/pages/SettingsPage.jsx";
import LoanPlansPage from "../features/loanPlan/pages/LoanPlansPage.jsx";
import LoanPlanViewPage from "../features/loanPlan/pages/LoanPlanViewPage.jsx";
import CustomerLoansPage from "../features/customerLoans/pages/CustomerLoansPage.jsx";
import LoanViewPage from "../features/customerLoans/pages/LoanViewPage.jsx";
import Analytics from "../features/Analytics/pages/Analytics.jsx";
import CompanyDetailsViewPage from "../features/companyDetails/pages/CompanyDetailsViewPage.jsx";
import CompanyDetailsListPage from "../features/companyDetails/pages/CompanyDetailsListPage.jsx";
import CompanyDetailsFormPage from "../features/companyDetails/components/CompanyDetailsFormPage.jsx";
import CompanyBanksPage from "../features/companyBank/pages/CompanyBanksPage.jsx";
import CompanyBankViewPage from "../features/companyBank/pages/CompanyBankViewPage.jsx";
import BankTransactionsPage from "../features/bankTransactions/pages/BankTransactionsPage.jsx";
import BankTransactionViewPage from "../features/bankTransactions/pages/BankTransactionViewPage.jsx";
import AssetCategoriesPage from "../features/assetCategory/pages/AssetCategoriesPage.jsx";
import AssetsPage from "../features/assets/pages/AssetsPage.jsx";
import AssetViewPage from "../features/assets/pages/AssetViewPage.jsx";
import HandLoansPage from "../features/handLoans/pages/HandLoansPage.jsx";
import HandLoanViewPage from "../features/handLoans/pages/HandLoanViewPage.jsx";
import PersonalChitsPage from "../features/personalChit/pages/PersonalChitsPage.jsx";
import PersonalChitViewPage from "../features/personalChit/pages/PersonalChitViewPage.jsx";
import LoanCollectionPage from "../features/collectionLoan/pages/LoanCollectionPage.jsx";
import CollectionDashboardPage from "../features/collectionLoan/pages/CollectionDashboardPage.jsx";
import CollectionReportsPage from "../features/collectionLoan/reports/pages/CollectionReportsPage.jsx";
import NotFoundPage from "../common/pages/NotFoundPage.jsx";
import LoanReportsPage from "../features/reports/loanReports/pages/LoanReportsPage.jsx";
import InstallmentReportsPage from "../features/reports/installmentReports/pages/InstallmentReportsPage.jsx";
import CustomerLoanSummaryPage from "../features/reports/customerReports/pages/CustomerLoanSummaryPage.jsx";
import RolePermissionsPage from "../features/permissions/pages/RolePermissionsPage.jsx";
import UserPermissionsPage from "../features/permissions/pages/UserPermissionsPage.jsx";
import UnauthorizedPage from "../common/pages/UnauthorizedPage.jsx";

// Centralized configuration for protected routes inside MainLayout
const protectedRoutesConfig = [
  {
    path: "/dashboard",
    element: <DashboardPage />,
    permission: "DASHBOARD_VIEW",
  },
  { path: "/analytics", element: <Analytics />, permission: "ANALYTICS_VIEW" },

  // Customers
  {
    path: "/customers",
    element: <CustomersPage />,
    permission: "CUSTOMER_VIEW",
  },
  {
    path: "/customers/:id",
    element: <CustomerViewPage />,
    permission: "CUSTOMER_VIEW",
  },
  {
    path: "/customer-documents",
    element: <div>Customer Documesnts Page</div>,
    permission: "CUSTOMER_VIEW",
  },
  {
    path: "/guarantors",
    element: <div>Guarantors Page</div>,
    permission: "CUSTOMER_VIEW",
  },

  // Loans & Plans
  {
    path: "/loan-plans",
    element: <LoanPlansPage />,
    permission: "LOAN_PLAN_VIEW",
  },
  {
    path: "/loan-plans/:id",
    element: <LoanPlanViewPage />,
    permission: "LOAN_PLAN_VIEW",
  },
  // { path: "/loan-applications", element: <div>Loan Applications Page</div> },
  {
    path: "/loan-applications",
    element: <CustomerLoansPage />,
    permission: [
      "LOAN_APPLICATION_VIEW",
      "LOAN_VIEW",
      "LOAN_APPLICATIONS_VIEW",
      "CUSTOMER_LOAN_VIEW",
    ],
  },
  {
    path: "/loans/:id",
    element: <LoanViewPage />,
    permission: [
      "LOAN_APPLICATION_VIEW",
      "LOAN_VIEW",
      "LOAN_APPLICATIONS_VIEW",
      "CUSTOMER_LOAN_VIEW",
    ],
  },
  // { path: "/loans/:id", element: <div >View Loan</div> },
  {
    path: "/loan-approval",
    element: <div>Loan Approval Page</div>,
    permission: "LOAN_APPROVAL_VIEW",
  },
  {
    path: "/repayments",
    element: <div>Repayments Page</div>,
    permission: "LOAN_VIEW",
  },

  // Roles & Users
  // { path: "/roles", element: <RolesPage />, permission: "ROLE_VIEW" },
  // { path: "/users", element: <UsersPage />, permission: "USER_VIEW" },
  // {
  //   path: "/role-permissions",
  //   element: <RolePermissionsPage />,
  //   permission: "ROLE_VIEW",
  // },
  // {
  //   path: "/role-permissions/:roleId",
  //   element: <RolePermissionsPage />,
  //   permission: "ROLE_VIEW",
  // },
  // {
  //   path: "/user-permissions",
  //   element: <UserPermissionsPage />,
  //   permission: "USER_VIEW",
  // },
  // {
  //   path: "/user-permissions/:userId",
  //   element: <UserPermissionsPage />,
  //   permission: "USER_VIEW",
  // },

  {
    path: "/roles",
    element: <RolesPage />,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    path: "/users",
    element: <UsersPage />,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    path: "/role-permissions",
    element: <RolePermissionsPage />,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    path: "/role-permissions/:roleId",
    element: <RolePermissionsPage />,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    path: "/user-permissions",
    element: <UserPermissionsPage />,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    path: "/user-permissions/:userId",
    element: <UserPermissionsPage />,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },

  // Company Details
  {
    path: "/companies-details",
    element: <CompanyDetailsViewPage />,
    permission: "COMPANY_VIEW",
  },
  /* Multi-company routes commented out for future use:
  { path: "/settings/companies", element: <CompanyDetailsListPage /> },
  { path: "/settings/companies/new", element: <CompanyDetailsFormPage initialData={null} /> },
  { path: "/settings/companies/:id/edit", element: <CompanyDetailsEditWrapper /> },
  { path: "/settings/companies/:id", element: <CompanyDetailsSingleViewPage /> },
  */

  // Banking
  {
    path: "/bank-accounts",
    element: <CompanyBanksPage />,
    permission: [
      "BANK_ACCOUNT_VIEW",
      "BANK_VIEW",
      "COMPANY_BANK_VIEW",
      "COMPANY_VIEW",
    ],
  },
  {
    path: "/bank-accounts/:id",
    element: <CompanyBankViewPage />,
    permission: [
      "BANK_ACCOUNT_VIEW",
      "BANK_VIEW",
      "COMPANY_BANK_VIEW",
      "COMPANY_VIEW",
    ],
  },
  {
    path: "/bank-transactions",
    element: <BankTransactionsPage />,
    permission: [
      "BANK_TRANSACTION_VIEW",
      "BANK_VIEW",
      "BANK_ACCOUNT_VIEW",
      "COMPANY_VIEW",
    ],
  },
  {
    path: "/bank-transactions/:id",
    element: <BankTransactionViewPage />,
    permission: [
      "BANK_TRANSACTION_VIEW",
      "BANK_VIEW",
      "BANK_ACCOUNT_VIEW",
      "COMPANY_VIEW",
    ],
  },

  // Assets & Categories
  {
    path: "/asset-categories",
    element: <AssetCategoriesPage />,
    permission: ["ASSET_CATEGORY_VIEW", "ASSET_VIEW"],
  },
  {
    path: "/assets",
    element: <AssetsPage />,
    permission: ["ASSET_VIEW", "ASSET_CATEGORY_VIEW"],
  },
  {
    path: "/assets/:id",
    element: <AssetViewPage />,
    permission: ["ASSET_VIEW", "ASSET_CATEGORY_VIEW"],
  },

  // Hand Loans & Chits
  {
    path: "/hand-loans",
    element: <HandLoansPage />,
    permission: "HAND_LOAN_VIEW",
  },
  {
    path: "/hand-loans/:id",
    element: <HandLoanViewPage />,
    permission: "HAND_LOAN_VIEW",
  },
  {
    path: "/personal-chits",
    element: <PersonalChitsPage />,
    permission: "CHIT_VIEW",
  },
  {
    path: "/personal-chits/:id",
    element: <PersonalChitViewPage />,
    permission: "CHIT_VIEW",
  },

  // Collection & EMI routes
  {
    path: "/loan-collections",
    element: <LoanCollectionPage />,
    permission: ["LOAN_COLLECTION_VIEW", "COLLECTION_VIEW"],
  },
  {
    path: "/loan-collections/:loanId",
    element: <LoanCollectionPage />,
    permission: ["LOAN_COLLECTION_VIEW", "COLLECTION_VIEW"],
  },
  {
    path: "/loans/:loanId/collections",
    element: <LoanCollectionPage />,
    permission: ["LOAN_COLLECTION_VIEW", "COLLECTION_VIEW"],
  },
  {
    path: "/loans/:loanId/collection",
    element: <LoanCollectionPage />,
    permission: ["LOAN_COLLECTION_VIEW", "COLLECTION_VIEW"],
  },
  {
    path: "/due-collections",
    element: <CollectionDashboardPage />,
    permission: ["DUE_COLLECTION_VIEW", "COLLECTION_VIEW"],
  },
  {
    path: "/emi-collection",
    element: <CollectionDashboardPage />,
    permission: ["DUE_COLLECTION_VIEW", "COLLECTION_VIEW"],
  },
  {
    path: "/collection",
    element: <CollectionDashboardPage />,
    permission: ["DUE_COLLECTION_VIEW", "COLLECTION_VIEW"],
  },

  // Reports
  {
    path: "/loan-reports",
    element: <LoanReportsPage />,
    permission: "LOAN_REPORT_VIEW",
  },
  {
    path: "/installment-reports",
    element: <InstallmentReportsPage />,
    permission: "LOAN_INSTALLMENT_REPORT_VIEW",
  },
  {
    path: "/customer-reports",
    element: <CustomerLoanSummaryPage />,
    permission: "CUSTOMER_REPORT_VIEW",
  },
  {
    path: "/reports/loan-collections",
    element: <CollectionReportsPage />,
    permission: "COLLECTION_REPORT_VIEW",
  },

  // Profile & Settings (Authenticated, no specific permission required)
  { path: "/profile", element: <ProfilePage /> },
  { path: "/settings", element: <SettingsPage /> },
];

const AppRoutes = () => {
  return (
    <Routes>
      {/* Login */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<LoanLoginPage />} />
        <Route path="/login" element={<LoanLoginPage />} />
      </Route>

      {/* Base Token Authentication Check */}
      <Route element={<ProtectedRoute />}>
        {/* Main Application Layout */}
        <Route element={<MainLayout />}>
          {protectedRoutesConfig.map(({ path, element, permission, roles }) => (
            <Route
              key={path}
              element={
                <ProtectedRoute
                  requiredPermission={permission}
                  requiredRole={roles}
                />
              }
            >
              <Route path={path} element={element} />
            </Route>
          ))}
        </Route>

        {/* Catch-all for authenticated users */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Global Fallbacks */}
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
    </Routes>
  );
};

export default AppRoutes;
