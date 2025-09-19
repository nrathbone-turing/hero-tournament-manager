// File: frontend/src/context/AuthContext.js
// Purpose: Provides authentication context and helper functions.
// Notes:
// - Stores current user and JWT token.
// - Exposes login, signup, and logout methods.
// - Persists token in localStorage for reloads.
// - Provides isAuthenticated flag.

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../api";

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

  const signup = async (username, email, password) => {
    const resp = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    if (resp.ok) {
      const data = await resp.json();
      setUser(data);
      return data;
    } else {
      const err = await resp.json();
      throw new Error(err.error || "Signup failed");
    }
  };

  const login = async (email, password) => {
    const resp = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (resp.ok) {
      const data = await resp.json();
      const newToken = data.access_token || data.token;
      setToken(newToken);
      setUser({ username: email.split("@")[0], email });
      return data;
    } else {
      const err = await resp.json();
      throw new Error(err.error || "Login failed");
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
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
