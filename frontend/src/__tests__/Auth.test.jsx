// File: frontend/src/__tests__/Auth.test.jsx
// Purpose: Tests frontend authentication flow with AuthContext and forms.
// Notes:
// - Reuses patterns from summative lab tests (form submission, session checks).
// - Covers signup, login, protected route access, and logout.

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AuthProvider, { useAuth } from "../context/AuthContext";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";
import ProtectedRoute from "../components/ProtectedRoute";

// Mock fetch for /signup and /login
beforeEach(() => {
  global.fetch = jest.fn((url, options) => {
    if (url.endsWith("/signup")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ username: "testuser", email: "test@example.com" }),
      });
    }
    if (url.endsWith("/login")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ access_token: "fake-jwt-token" }),
      });
    }
    return Promise.reject(new Error("Unknown endpoint"));
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

function ProtectedPage() {
  const { user } = useAuth();
  return <div>Welcome {user?.username || "guest"}</div>;
}

test("signup form creates a new user", async () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <SignupForm />
      </MemoryRouter>
    </AuthProvider>
  );

  fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "testuser" } });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
  fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

  await waitFor(() => {
    expect(screen.getByText(/testuser/i)).toBeInTheDocument();
  });
});

test("login form logs in and sets token", async () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    </AuthProvider>
  );

  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
  fireEvent.click(screen.getByRole("button", { name: /log in/i }));

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/login"),
      expect.any(Object)
    );
  });
});

test("unauthenticated user is redirected from protected route", async () => {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <ProtectedPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );

  await waitFor(() => {
    expect(screen.getByText(/login page/i)).toBeInTheDocument();
  });
});

test("authenticated user sees protected content", async () => {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/protected" element={<ProtectedPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );

  // Simulate user context manually
  const { setUser } = useAuth();
  setUser({ username: "authedUser" });

  await waitFor(() => {
    expect(screen.getByText(/welcome authedUser/i)).toBeInTheDocument();
  });
});

test("logout clears auth state", async () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <ProtectedPage />
      </MemoryRouter>
    </AuthProvider>
  );

  const { logout, setUser } = useAuth();
  setUser({ username: "authedUser" });
  expect(screen.getByText(/welcome authedUser/i)).toBeInTheDocument();

  logout();
  await waitFor(() => {
    expect(screen.getByText(/welcome guest/i)).toBeInTheDocument();
  });
});
