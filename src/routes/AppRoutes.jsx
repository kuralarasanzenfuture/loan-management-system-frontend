import { Routes, Route } from "react-router-dom";

import PublicRoute from "./PublicRoute.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

// import LoginPage from "../features/auth/pages/LoginPage";
import LoanLoginPage from "../features/auth/pages/LoanLoginPage";

import MainLayout from "../common/layouts/MainLayout.jsx";
import DashboardPage from "../common/pages/DashboardPage.jsx";
import RolesPage from "../features/roles/pages/RolesPage.jsx";
import UsersPage from "../features/users/pages/UsersPage.jsx";
import CustomersPage from "../features/customers/pages/CustomersPage.jsx";
// import CustomerViewPage from "../features/customers/pages/CustomerViewPage.jsx";
import CustomerViewPage from "../features/customers/pages/CustomerViewPage-new.jsx";
import ProfilePage from "../common/pages/ProfilePage.jsx";
import SettingsPage from "../common/pages/SettingsPage.jsx";
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

const AppRoutes = () => {
  return (
    <Routes>
      {/* Login */}
      <Route element={<PublicRoute />}>
        {/* Public */}
        <Route path="/" element={<LoanLoginPage />} />
        <Route path="/login" element={<LoanLoginPage />} />
      </Route>

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        {/* Dashboard Layout — wraps all authenticated pages so they share
            the sidebar, header (theme selector, profile dropdown, etc.),
            and the proper bg-base-200 page background. */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/:id" element={<CustomerViewPage />} />
          <Route
            path="/customer-documents"
            element={<div>Customer Documesnts Page</div>}
          />
          <Route path="/guarantors" element={<div>Guarantors Page</div>} />
          <Route path="/loan-plans" element={<LoanPlansPage />} />
          <Route path="/loan-plans/:id" element={<LoanPlanViewPage />} />
          {/* <Route
            path="/loan-applications"
            element={<div>Loan Applications Page</div>}
          /> */}
          <Route path="/loan-applications" element={<CustomerLoansPage />} />
          <Route path="/loans/:id" element={<LoanViewPage />} />
          {/* <Route path="/loans/:id" element={<div >View Loan</div>} /> */}
          <Route
            path="/loan-approval"
            element={<div>Loan Approval Page</div>}
          />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/repayments" element={<div>Repayments Page</div>} />
          {/* Singleton usage (simplest — one company, no list needed) */}
          <Route
            path="/companies-details"
            element={<CompanyDetailsViewPage />}
          />

          {/* // OR multi-company usage (if you go that route) */}
          {/* <Route
            path="/settings/companies"
            element={<CompanyDetailsListPage />}
          />
          <Route
            path="/settings/companies/new"
            element={<CompanyDetailsFormPage initialData={null} />}
          />
          <Route
            path="/settings/companies/:id/edit"
            element={<CompanyDetailsEditWrapper />} // fetches by id, then renders CompanyDetailsFormPage
          />
          <Route
            path="/settings/companies/:id"
            element={<CompanyDetailsSingleViewPage />}
          /> */}

          <Route path="/bank-accounts" element={<CompanyBanksPage />} />
          <Route path="/bank-accounts/:id" element={<CompanyBankViewPage />} />
          <Route path="/bank-transactions" element={<BankTransactionsPage />} />
          <Route
            path="/bank-transactions/:id"
            element={<BankTransactionViewPage />}
          />

          <Route path="/asset-categories" element={<AssetCategoriesPage />} />

          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/assets/:id" element={<AssetViewPage />} />

          <Route path="/hand-loans" element={<HandLoansPage />} />
          <Route path="/hand-loans/:id" element={<HandLoanViewPage />} />

          <Route path="/personal-chits" element={<PersonalChitsPage />} />
          <Route
            path="/personal-chits/:id"
            element={<PersonalChitViewPage />}
          />

          {/* <Route path="collection" element={<div>Collection Page</div>} /> */}
          <Route path="/loan-collections" element={<LoanCollectionPage />} />
          <Route
            path="/loan-collections/:loanId"
            element={<LoanCollectionPage />}
          />
          <Route
            path="/loans/:loanId/collections"
            element={<LoanCollectionPage />}
          />

          {/* Profile & Settings now live inside MainLayout so they get the
              shared header, sidebar, and correct dark-mode background. */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
