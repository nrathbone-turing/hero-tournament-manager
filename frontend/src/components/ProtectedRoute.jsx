// File: frontend/src/components/ProtectedRoute.jsx
// Purpose: Restricts access to authenticated users.
// Notes:
// - Wraps around child components.
// - Redirects to /login if user is not authenticated.

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
