import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';

import Login        from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Employees    from './pages/Employees';
import JobHistory   from './pages/JobHistory';
import Jobs         from './pages/Jobs';
import Departments  from './pages/Departments';
import Admin        from './pages/Admin';
import DeletedItems from './pages/DeletedItems';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login"         element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected routes */}
        <Route path="/employees"     element={<ProtectedRoute><Employees /></ProtectedRoute>} />
        <Route path="/jobhistory"    element={<ProtectedRoute><JobHistory /></ProtectedRoute>} />
        <Route path="/jobs"          element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
        <Route path="/departments"   element={<ProtectedRoute><Departments /></ProtectedRoute>} />
        <Route path="/admin"         element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/deleted-items" element={<ProtectedRoute><DeletedItems /></ProtectedRoute>} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;