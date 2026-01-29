import { Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './pages/SignUp';
import LoginPage from './pages/Login';
import HomePage from './pages/Home';
import Admin from './pages/Admin/Admin';
import UserDashboard from './pages/DashBoard';

// 1. Create a Protection Wrapper
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    // If a standard user tries to go to /admin, send them to user dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* User Dashboard - only for role: 'user' */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRole="user">
            <UserDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Admin Panel - only for role: 'admin' */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRole="admin">
            <Admin />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;