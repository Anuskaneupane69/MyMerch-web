import { Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './pages/SignUp';
import LoginPage from './pages/Login';
import HomePage from './pages/Home';
import Admin from './pages/Admin/Admin';
import UserDashboard from './pages/DashBoard';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from './pages/protected/protectRoute';

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      
      <Routes>
        {/* All public */}
        <Route path="/"       element={<HomePage />} />
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected */}
        <Route path="/dashboard" element={
          <ProtectedRoute element={<UserDashboard />} allowedRoles={['user']} />
        } />

        <Route path="/admin" element={
          <ProtectedRoute element={<Admin />} allowedRoles={['admin']} />
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;