import { Navigate, Outlet } from "react-router-dom";
import getUserRole from "./authRole";

const ProtectedRoute = ({ element, allowedRoles }) => {
  const role = getUserRole();

  // Not logged in → go to login
  if (!role) {
    localStorage.removeItem("jwtToken");
    return <Navigate to="/login" replace />;
  }

  // Wrong role → redirect to THEIR correct page
  if (!allowedRoles.includes(role)) {
    return <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return element;
};

const PublicRoute = () => {
  const role = getUserRole();

  if (role) {
    return <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <Outlet />;
};

export { PublicRoute, ProtectedRoute };