// File: frontend/src/__tests__/Navbar.test.jsx
// Purpose: Tests for Navbar auth-aware UI and routing.
// Notes:
// - Covers logged out UI (login/signup links).
// - Covers logged in UI (welcome + logout).
// - Ensures logout clears localStorage and resets user.
// - Verifies navigation works for /, /login, and /signup.

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AuthProvider, { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar.test";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";

// Test harness page to check navigation + auth state
function EventsPage() {
  const { user } = useAuth();
  return <div>Events Dashboard {user ? `(user: ${user.username})` : ""}</div>;
}

function renderWithRouter(initialEntries = ["/"]) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Navbar />
        <Routes>
          <Route path="/" element={<EventsPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe("Navbar", () => {
  test("shows login/signup links when logged out", () => {
    renderWithRouter();

    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /signup/i })).toBeInTheDocument();
  });

  test("navigates to login and signup pages", () => {
    renderWithRouter();

    fireEvent.click(screen.getByRole("link", { name: /login/i }));
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: /signup/i }));
    expect(
      screen.getByRole("button", { name: /sign up/i }),
    ).toBeInTheDocument();
  });

  test("shows welcome + logout when logged in", async () => {
    renderWithRouter();

    // simulate login via context
    const { login } = require("../context/AuthContext").useAuth();
    await login("test@example.com", "password123");

    expect(
      screen.getByText(/welcome test/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  test("logout clears token and resets user", async () => {
    renderWithRouter();

    // simulate login
    const { login, logout } = require("../context/AuthContext").useAuth();
    await login("test@example.com", "password123");

    // confirm logged in
    expect(localStorage.getItem("token")).toBe("fake-jwt-token");

    // click logout
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    // check state cleared
    expect(localStorage.getItem("token")).toBeNull();
    expect(screen.queryByText(/welcome/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
  });
});
