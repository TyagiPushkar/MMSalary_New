// import { Navigate, Route, Routes } from "react-router-dom";
// import AppLayout from "./components/layout/AppLayout";
// import ProtectedRoute from "./components/routing/ProtectedRoute";
// import DashboardPage from "./pages/DashboardPage";
// import LoginPage from "./pages/LoginPage";
// import AttendancePage from "./pages/AttendancePage";
// import EmployeeListPage from "./pages/EmployeeListPage";
// import AddEmployeePage from "./pages/AddEmployeePage";
// import SalaryPage from "./pages/SalaryPage";
// import ReportsPage from "./pages/ReportsPage";
// import SettingsPage from "./pages/SettingsPage";
// import ManageAdminPage from "./pages/ManageAdminpage";

// function App() {
//   return (
//     <Routes>
//       <Route path="/login" element={<LoginPage />} />
//       <Route element={<ProtectedRoute />}>
//         <Route element={<AppLayout />}>
//           <Route index element={<Navigate to="/attendance" replace />} />
//           {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
//           <Route path="/attendance" element={<AttendancePage />} />
//           <Route path="/employees" element={<EmployeeListPage />} />
//           <Route path="/employee/add" element={<AddEmployeePage />} />
//           <Route path="/admins" element={<ManageAdminPage />} />
//           <Route
//             path="/salary"
//             element={
//               <ProtectedRoute allowedTypes={["super"]}>
//                 <SalaryPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/reports"
//             element={
//               <ProtectedRoute allowedTypes={["super"]}>
//                 <ReportsPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/settings"
//             element={
//               <ProtectedRoute allowedTypes={["super"]}>
//                 <SettingsPage />
//               </ProtectedRoute>
//             }
//           />
//         </Route>
//       </Route>
//       <Route path="*" element={<Navigate to="/login" replace />} />
//     </Routes>
//   );
// }

// export default App;
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import AttendancePage from "./pages/AttendancePage";
import EmployeeListPage from "./pages/EmployeeListPage";
import AddEmployeePage from "./pages/AddEmployeePage";
import SalaryPage from "./pages/SalaryPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import ManageAdminPage from "./pages/ManageAdminpage";
import { AddOfficesPage } from "./pages/AddOfficesPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/attendance" replace />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/employees" element={<EmployeeListPage />} />
          <Route path="/employee/add" element={<AddEmployeePage />} />

          {/* Super Admin Only Routes */}
          <Route element={<ProtectedRoute allowedTypes={["super"]} />}>
            <Route path="/admins" element={<ManageAdminPage />} />
            <Route path="/salary" element={<SalaryPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/add_offices" element={<AddOfficesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all for unknown routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
