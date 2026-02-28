import { Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './pages/SignUp';
import LoginPage from './pages/Login';
import HomePage from './pages/Home';
import Admin from './pages/Admin/Admin';
import UserDashboard from './pages/DashBoard';
import { Toaster } from 'react-hot-toast';
import {ProtectedRoute} from './pages/protected/protectRoute';

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={
              <UserDashboard />
          } 
        />

        {/* Admin Route */}
        <Route 
          path="/admin" 
          element={
              <Admin />
          } 
        />
      </Routes>
    </>
  );
}

export default App;