import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import EngineerDashboard from "./components/engineer/EngineerDashboard";
import TicketCreationForm from "./components/tickets/TicketCreationForm";
import TicketDetailsView from "./components/tickets/TicketDetailsView";
import AdminDashboard from "./components/admin/AdminDashboard";
import SalesDashboard from "./components/sales/SalesDashboard";
import SalesOpportunityView from "./components/sales/SalesOpportunityView";
import EngineerLayout from "./components/common/EngineerLayout";

// Attendance Module Imports testing
// Attendance Module Imports
import AttendanceEmployeeDashboard from "./modules/attendance/pages/EmployeeDashboard";
import AttendanceAdminDashboard from "./modules/attendance/pages/AdminDashboard";
import Profile from "./components/profile/Profile"; // Updated import
import AdminEmployeeDetail from "./modules/attendance/pages/AdminEmployeeDetail";
import EmployeeClaimPage from "./modules/reimbursement/pages/EmployeeClaimPage";
import AdminReimbursementPage from "./modules/reimbursement/pages/AdminReimbursementPage";
import AdminActivityPage from "./modules/attendance/pages/AdminActivityPage";


const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/" />;
  }
  return children;
};

const SalesRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");
  const email = localStorage.getItem("userEmail");

  if (!token) {
    return <Navigate to="/" />;
  }

  // Check: role is sales OR specific email (allowing admin with this email to access)
  if (role === 'sales' || email?.toLowerCase() === 'rambalaji@tutelartechlabs.com' || role === 'admin') {
    return children;
  }
  // Redirect others to home/login
  return <Navigate to="/" />;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");

  if (!token) {
    return <Navigate to="/" />;
  }

  if (role === 'admin') {
    return children;
  }
  return <Navigate to="/" />;
};

import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        {/* Admin Registration Route */}
        <Route path="/admin/register" element={
          <AdminRoute>
            <EngineerLayout>
              <SignupPage isInternal={true} />
            </EngineerLayout>
          </AdminRoute>
        } />

        <Route path="/engineer/dashboard" element={
          <ProtectedRoute>
            <EngineerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/engineer/dashboard/profile" element={
          <ProtectedRoute>
            <EngineerLayout>
              <Profile />
            </EngineerLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/tickets/create" element={
          <ProtectedRoute>
            <TicketCreationForm />
          </ProtectedRoute>
        } />
        <Route path="/tickets/:id" element={
          <ProtectedRoute>
            <TicketDetailsView />
          </ProtectedRoute>
        } />

        <Route path="/sales/dashboard" element={
          <SalesRoute>
            <SalesDashboard />
          </SalesRoute>
        } />
        <Route path="/sales/create" element={
          <SalesRoute>
            <SalesOpportunityView />
          </SalesRoute>
        } />
        <Route path="/sales/:id" element={
          <SalesRoute>
            <SalesOpportunityView />
          </SalesRoute>
        } />

        {/* Attendance Routes */}
        <Route path="/attendance" element={<Navigate to="/attendance/dashboard" />} />
        <Route path="/attendance/dashboard" element={
          <ProtectedRoute>
            <EngineerLayout>
              <AttendanceEmployeeDashboard />
            </EngineerLayout>
          </ProtectedRoute>
        } />
        <Route path="/attendance/admin" element={
          <AdminRoute>
            <EngineerLayout>
              <AttendanceAdminDashboard />
            </EngineerLayout>
          </AdminRoute>
        } />
        {/* Profile removed from attendance routes */}
        <Route path="/attendance/admin/employees/:id" element={
          <AdminRoute>
            <EngineerLayout>
              <AdminEmployeeDetail />
            </EngineerLayout>
          </AdminRoute>
        } />

        {/* Reimbursement Routes */}
        <Route path="/employee/reimbursement" element={
          <ProtectedRoute>
            <EngineerLayout>
              <EmployeeClaimPage />
            </EngineerLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/reimbursement-approval" element={
          <AdminRoute>
            <EngineerLayout>
              <AdminReimbursementPage />
            </EngineerLayout>
          </AdminRoute>
        } />
        <Route path="/admin/activity" element={
          <AdminRoute>
            <EngineerLayout>
              <AdminActivityPage />
            </EngineerLayout>
          </AdminRoute>
        } />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}
