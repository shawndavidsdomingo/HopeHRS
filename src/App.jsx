import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import all your page components
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import Employees from './pages/Employees';
import EmployeeDetail from './pages/EmployeeDetail';
import Departments from './pages/Departments';
import Admin from './pages/Admin';
import JobCodes from './pages/JobCodes';
import JobHistory from './pages/JobHistory';
import Reports from './pages/Reports';
import DeletedItems from './pages/DeletedItems';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public/Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Internal HRM Routes */}
        {/* Note: Your Specialist will likely wrap these in a <ProtectedRoute> component later */}
        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/:id" element={<EmployeeDetail />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/job-codes" element={<JobCodes />} />
        <Route path="/job-history" element={<JobHistory />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/trash" element={<DeletedItems />} />

        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<div className="p-10 font-bold">404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;