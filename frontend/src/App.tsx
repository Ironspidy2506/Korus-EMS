
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/AdminDashboard";
import HRDashboard from "@/pages/HRDashboard";
import EmployeeDashboard from "@/pages/EmployeeDashboard";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";

// Admin Pages
import AdminEmployees from "@/pages/Admin/Employees";
import AdminDepartments from "@/pages/Admin/Departments";
import AdminLeave from "@/pages/Admin/Leave";
import AdminSalary from "@/pages/Admin/Salary";
import AdminCTC from "@/pages/Admin/CTC";
import AdminFixedAllowances from "@/pages/Admin/FixedAllowances";
import AdminAllowances from "@/pages/Admin/Allowances";
import AdminTravelExpenditure from "@/pages/Admin/TravelExpenditure";

// HR Pages
import HREmployees from "@/pages/HR/Employees";
import HRDepartments from "@/pages/HR/Departments";
import HRUsers from "@/pages/HR/Users";
import HRLeave from "@/pages/HR/Leave";
import HRHoliday from "@/pages/HR/Holiday";
import HRAppraisal from "@/pages/HR/Appraisal";
import HROnboarding from "@/pages/HR/Onboarding";
import HRMessages from "@/pages/HR/Messages";
import HRHelpdesk from "@/pages/HR/Helpdesk";
import HRTravelExpenditure from "@/pages/HR/TravelExpenditure";

// Employee Pages
import EmployeeHolidays from "@/pages/Employee/Holidays";
import EmployeeLeave from "@/pages/Employee/Leave";
import EmployeeProfile from "@/pages/Employee/Profile";
import EmployeeSalary from "@/pages/Employee/Salary";
import EmployeeAllowances from "@/pages/Employee/Allowances";
import EmployeeAppraisal from "@/pages/Employee/Appraisal";
import EmployeeMessages from "@/pages/Employee/Messages";
import EmployeeHelpdesk from "@/pages/Employee/Helpdesk";
import HRLeaveBalance from "./pages/HR/LeaveBalance";
import AdminAppraisal from "./pages/Admin/Appraisal";
import AdminLeaveBalance from "./pages/Admin/LeaveBalance";
import EmployeeApproveRejectLeave from "./pages/Employee/ApproveRejectLeave";
import EmployeeFixedAllowances from "./pages/Employee/FixedAllowances";
import EmployeeAddedAppraisals from "./pages/Employee/AddedAppraisals";
import JoiningReport from "./pages/JoiningReport";
import HRLTC from "./pages/HR/LTC";
import AdminLTC from "./pages/Admin/LTC";
import EmployeeLTC from "./pages/Employee/LTC";
import EmployeeTravelExpenditure from "./pages/Employee/TravelExpenditure";
import AdminOnboarding from "./pages/Admin/Onboarding";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="joining-form" element={<JoiningReport />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              {/* Admin Routes */}
              <Route path="admin-dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="admin-dashboard/employees" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminEmployees />
                </ProtectedRoute>
              } />
              <Route path="admin-dashboard/departments" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDepartments />
                </ProtectedRoute>
              } />
              <Route path="admin-dashboard/leave" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLeave />
                </ProtectedRoute>
              } />
              <Route path="admin-dashboard/leave-balances" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLeaveBalance />
                </ProtectedRoute>
              } />
              <Route path="admin-dashboard/appraisal" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAppraisal />
                </ProtectedRoute>
              } />
              <Route path="admin-dashboard/salary" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSalary />
                </ProtectedRoute>
              } />
              <Route path="admin-dashboard/ctc" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminCTC />
                </ProtectedRoute>
              } />
              <Route path="admin-dashboard/fixed-allowances" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminFixedAllowances />
                </ProtectedRoute>
              } />
              <Route path="admin-dashboard/allowances" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAllowances />
                </ProtectedRoute>
              } />
              <Route path="admin-dashboard/travel-expenditure" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminTravelExpenditure />
                </ProtectedRoute>
              } />
              <Route path="admin-dashboard/ltc" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLTC />
                </ProtectedRoute>
              } />
              <Route path="admin-dashboard/onboarding" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminOnboarding />
                </ProtectedRoute>
              } />

              {/* Accounts Routes */}
              <Route path="accounts-dashboard" element={
                <ProtectedRoute allowedRoles={['accounts']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="accounts-dashboard/employees" element={
                <ProtectedRoute allowedRoles={['accounts']}>
                  <AdminEmployees />
                </ProtectedRoute>
              } />
              <Route path="accounts-dashboard/departments" element={
                <ProtectedRoute allowedRoles={['accounts']}>
                  <AdminDepartments />
                </ProtectedRoute>
              } />
              <Route path="accounts-dashboard/leave" element={
                <ProtectedRoute allowedRoles={['accounts']}>
                  <AdminLeave />
                </ProtectedRoute>
              } />
              <Route path="accounts-dashboard/leave-balances" element={
                <ProtectedRoute allowedRoles={['accounts']}>
                  <AdminLeaveBalance />
                </ProtectedRoute>
              } />
              <Route path="accounts-dashboard/appraisal" element={
                <ProtectedRoute allowedRoles={['accounts']}>
                  <AdminAppraisal />
                </ProtectedRoute>
              } />
              <Route path="accounts-dashboard/salary" element={
                <ProtectedRoute allowedRoles={['accounts']}>
                  <AdminSalary />
                </ProtectedRoute>
              } />
              <Route path="accounts-dashboard/ctc" element={
                <ProtectedRoute allowedRoles={['accounts']}>
                  <AdminCTC />
                </ProtectedRoute>
              } />
              <Route path="accounts-dashboard/fixed-allowances" element={
                <ProtectedRoute allowedRoles={['accounts']}>
                  <AdminFixedAllowances />
                </ProtectedRoute>
              } />
              <Route path="accounts-dashboard/allowances" element={
                <ProtectedRoute allowedRoles={['accounts']}>
                  <AdminAllowances />
                </ProtectedRoute>
              } />
              <Route path="accounts-dashboard/travel-expenditure" element={
                <ProtectedRoute allowedRoles={['accounts']}>
                  <AdminTravelExpenditure />
                </ProtectedRoute>
              } />
              <Route path="accounts-dashboard/ltc" element={
                <ProtectedRoute allowedRoles={['accounts']}>
                  <AdminLTC />
                </ProtectedRoute>
              } />

              {/* HR Routes */}
              <Route path="hr-dashboard" element={
                <ProtectedRoute allowedRoles={['hr']}>
                  <HRDashboard />
                </ProtectedRoute>
              } />
              <Route path="hr-dashboard/employees" element={
                <ProtectedRoute allowedRoles={['hr']}>
                  <HREmployees />
                </ProtectedRoute>
              } />
              <Route path="hr-dashboard/departments" element={
                <ProtectedRoute allowedRoles={['hr']}>
                  <HRDepartments />
                </ProtectedRoute>
              } />
              <Route path="hr-dashboard/users" element={
                <ProtectedRoute allowedRoles={['hr']}>
                  <HRUsers />
                </ProtectedRoute>
              } />
              <Route path="hr-dashboard/leave" element={
                <ProtectedRoute allowedRoles={['hr']}>
                  <HRLeave />
                </ProtectedRoute>
              } />
              <Route path="hr-dashboard/leave-balances" element={
                <ProtectedRoute allowedRoles={['hr']}>
                  <HRLeaveBalance />
                </ProtectedRoute>
              } />
              <Route path="hr-dashboard/holiday" element={
                <ProtectedRoute allowedRoles={['hr']}>
                  <HRHoliday />
                </ProtectedRoute>
              } />
              <Route path="hr-dashboard/appraisal" element={
                <ProtectedRoute allowedRoles={['hr']}>
                  <HRAppraisal />
                </ProtectedRoute>
              } />
              <Route path="hr-dashboard/onboarding" element={
                <ProtectedRoute allowedRoles={['hr']}>
                  <HROnboarding />
                </ProtectedRoute>
              } />
              <Route path="hr-dashboard/messages" element={
                <ProtectedRoute allowedRoles={['hr']}>
                  <HRMessages />
                </ProtectedRoute>
              } />
              <Route path="hr-dashboard/helpdesk" element={
                <ProtectedRoute allowedRoles={['hr']}>
                  <HRHelpdesk />
                </ProtectedRoute>
              } />
              <Route path="hr-dashboard/travel-expenditure" element={
                <ProtectedRoute allowedRoles={['hr']}>
                  <HRTravelExpenditure />
                </ProtectedRoute>
              } />
              <Route path="hr-dashboard/ltc" element={
                <ProtectedRoute allowedRoles={['hr']}>
                  <HRLTC />
                </ProtectedRoute>
              } />

              {/* Employee Routes */}
              <Route path="employee-dashboard" element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              } />
              <Route path="employee-dashboard/holidays" element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeHolidays />
                </ProtectedRoute>
              } />
              <Route path="employee-dashboard/leave" element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeLeave />
                </ProtectedRoute>
              } />
              <Route path="employee-dashboard/profile" element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeProfile />
                </ProtectedRoute>
              } />
              <Route path="employee-dashboard/salary" element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeSalary />
                </ProtectedRoute>
              } />
              <Route path="employee-dashboard/allowances" element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeAllowances />
                </ProtectedRoute>
              } />
              <Route path="employee-dashboard/fixed-allowances" element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeFixedAllowances />
                </ProtectedRoute>
              } />
              <Route path="employee-dashboard/appraisal" element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeAppraisal />
                </ProtectedRoute>
              } />
              <Route path="employee-dashboard/travel-expenditure" element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeTravelExpenditure />
                </ProtectedRoute>
              } />
              <Route path="employee-dashboard/ltc" element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeLTC />
                </ProtectedRoute>
              } />
              <Route path="employee-dashboard/messages" element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeMessages />
                </ProtectedRoute>
              } />
              <Route path="employee-dashboard/helpdesk" element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeHelpdesk />
                </ProtectedRoute>
              } />


              {/* Lead Routes */}
              <Route path="lead-dashboard" element={
                <ProtectedRoute allowedRoles={['lead']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              } />
              <Route path="lead-dashboard/holidays" element={
                <ProtectedRoute allowedRoles={['lead']}>
                  <EmployeeHolidays />
                </ProtectedRoute>
              } />
              <Route path="lead-dashboard/leave" element={
                <ProtectedRoute allowedRoles={['lead']}>
                  <EmployeeLeave />
                </ProtectedRoute>
              } />
              <Route path="lead-dashboard/approve-reject-leave" element={
                <ProtectedRoute allowedRoles={['lead']}>
                  <EmployeeApproveRejectLeave />
                </ProtectedRoute>
              } />
              <Route path="lead-dashboard/profile" element={
                <ProtectedRoute allowedRoles={['lead']}>
                  <EmployeeProfile />
                </ProtectedRoute>
              } />
              <Route path="lead-dashboard/salary" element={
                <ProtectedRoute allowedRoles={['lead']}>
                  <EmployeeSalary />
                </ProtectedRoute>
              } />
              <Route path="lead-dashboard/allowances" element={
                <ProtectedRoute allowedRoles={['lead']}>
                  <EmployeeAllowances />
                </ProtectedRoute>
              } />
              <Route path="lead-dashboard/fixed-allowances" element={
                <ProtectedRoute allowedRoles={['lead']}>
                  <EmployeeFixedAllowances />
                </ProtectedRoute>
              } />
              <Route path="lead-dashboard/appraisal" element={
                <ProtectedRoute allowedRoles={['lead']}>
                  <EmployeeAddedAppraisals />
                </ProtectedRoute>
              } />
              <Route path="lead-dashboard/travel-expenditure" element={
                <ProtectedRoute allowedRoles={['lead']}>
                  <EmployeeTravelExpenditure />
                </ProtectedRoute>
              } />
              <Route path="lead-dashboard/ltc" element={
                <ProtectedRoute allowedRoles={['lead']}>
                  <EmployeeLTC />
                </ProtectedRoute>
              } />
              <Route path="lead-dashboard/messages" element={
                <ProtectedRoute allowedRoles={['lead']}>
                  <EmployeeMessages />
                </ProtectedRoute>
              } />
              <Route path="lead-dashboard/helpdesk" element={
                <ProtectedRoute allowedRoles={['lead']}>
                  <EmployeeHelpdesk />
                </ProtectedRoute>
              } />

              {/* Default redirect based on role */}
              <Route index element={<Navigate to="/login" replace />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
