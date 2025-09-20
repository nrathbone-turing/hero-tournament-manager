// File: frontend/src/components/ProtectedRoute.jsx
// Purpose: Higher-order component to guard routes.
// Notes:
// - Redirects to /login if user is not authenticated.
// - Prevents redirect loops by skipping redirect when already on /login or /signup.

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const authPaths = ["/login", "/signup"];
    if (!authPaths.includes(location.pathname)) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  return children;
}
