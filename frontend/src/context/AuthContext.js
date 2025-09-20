// File: frontend/src/context/AuthContext.js
// Purpose: Provides authentication context and helper functions.
// Notes:
// - Signup only creates a user, does not log them in.
// - Login issues and stores JWT token.
// - Persists token in localStorage for reloads.
// - Provides isAuthenticated flag.

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../api";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Signup only creates a user, no token
  const signup = async (username, email, password) => {
    const data = await apiFetch("/signup", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
    return data; // let the component handle redirect to /login
  };

  // Login sets token + user
  const login = async (email, password) => {
    const data = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const newToken = data.access_token || data.token;
    if (newToken) setToken(newToken);
    setUser({ username: email.split("@")[0], email });
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const value = {
    user,
    token,
    setUser,
    signup,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
