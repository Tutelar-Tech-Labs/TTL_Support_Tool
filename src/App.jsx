import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import EngineerDashboard from "./components/engineer/EngineerDashboard";
import TicketCreationForm from "./components/tickets/TicketCreationForm";
import TicketDetailsView from "./components/tickets/TicketDetailsView";
import AdminDashboard from "./components/admin/AdminDashboard";
import SalesDashboard from "./components/sales/SalesDashboard";
import SalesOpportunityView from "./components/sales/SalesOpportunityView";
import EngineerLayout from "./components/common/EngineerLayout";

// Attendance Module Imports
import AttendanceEmployeeDashboard from "./modules/attendance/pages/EmployeeDashboard";
import AttendanceAdminDashboard from "./modules/attendance/pages/AdminDashboard";
import Profile from "./components/profile/Profile"; // Updated import
import AdminEmployeeDetail from "./modules/attendance/pages/AdminEmployeeDetail";
import EmployeeClaimPage from "./modules/reimbursement/pages/EmployeeClaimPage";
import AdminReimbursementPage from "./modules/reimbursement/pages/AdminReimbursementPage";
import AdminActivityPage from "./modules/attendance/pages/AdminActivityPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        {/* Admin Registration Route */}
        <Route path="/admin/register" element={
          <ProtectedRoute roles={['admin']}>
            <EngineerLayout>
              <SignupPage isInternal={true} />
            </EngineerLayout>
          </ProtectedRoute>
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
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
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
          <ProtectedRoute roles={['sales']}>
            <SalesDashboard />
          </ProtectedRoute>
        } />
        <Route path="/sales/create" element={
          <ProtectedRoute roles={['sales']}>
            <SalesOpportunityView />
          </ProtectedRoute>
        } />
        <Route path="/sales/:id" element={
          <ProtectedRoute roles={['sales']}>
            <SalesOpportunityView />
          </ProtectedRoute>
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
          <ProtectedRoute roles={['admin']}>
            <EngineerLayout>
              <AttendanceAdminDashboard />
            </EngineerLayout>
          </ProtectedRoute>
        } />
        {/* Profile removed from attendance routes */}
        <Route path="/attendance/admin/employees/:id" element={
          <ProtectedRoute roles={['admin']}>
            <EngineerLayout>
              <AdminEmployeeDetail />
            </EngineerLayout>
          </ProtectedRoute>
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
          <ProtectedRoute roles={['admin']}>
            <EngineerLayout>
              <AdminReimbursementPage />
            </EngineerLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/activity" element={
          <ProtectedRoute roles={['admin']}>
            <EngineerLayout>
              <AdminActivityPage />
            </EngineerLayout>
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}
