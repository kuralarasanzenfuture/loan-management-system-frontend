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
import CustomerViewPage from "../features/customers/pages/CustomerViewPage.jsx";
import ProfilePage from "../common/pages/ProfilePage.jsx";
import SettingsPage from "../common/pages/SettingsPage.jsx";
import LoanPlansPage from "../features/loanPlan/pages/LoanPlansPage.jsx";
import LoanPlanViewPage from "../features/loanPlan/pages/LoanPlanViewPage.jsx";

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
        {/* Dashboard Layout */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/analytics" element={<div>Analytics Page</div>} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/:id" element={<CustomerViewPage />} />
          <Route
            path="/customer-documents"
            element={<div>Customer Documesnts Page</div>}
          />

          <Route path="/guarantors" element={<div>Guarantors Page</div>} />

          <Route path="/loan-plans" element={<LoanPlansPage />} />
          <Route path="/loan-plans/:id" element={<LoanPlanViewPage />} />

          <Route
            path="/loan-applications"
            element={<div>Loan Applications Page</div>}
          />
          {/* <Route path="/loan-plans" element={<div>Loan Plans Page</div>} /> */}
          <Route
            path="/loan-approval"
            element={<div>Loan Approval Page</div>}
          />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/repayments" element={<div>Repayments Page</div>} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
