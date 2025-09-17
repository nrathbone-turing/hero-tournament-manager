// File: frontend/src/__tests__/Auth.test.jsx
// Purpose: Tests frontend authentication with AuthContext + forms.
// Notes:
// - Covers signup, login, logout, and protected access.

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AuthProvider, { useAuth } from "../context/AuthContext";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";
import ProtectedRoute from "../components/ProtectedRoute";

// Mock fetch
beforeEach(() => {
  global.fetch = jest.fn((url) => {
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
afterEach(() => jest.resetAllMocks());

function ProtectedPage() {
  const { user } = useAuth();
  return <div>Welcome {user?.username || "guest"}</div>;
}

test("signup form creates user", async () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <SignupForm />
      </MemoryRouter>
    </AuthProvider>,
  );

  fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "testuser" } });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
  fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

  expect(await screen.findByText(/signed up as testuser/i)).toBeInTheDocument();
});

test("login form logs in", async () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    </AuthProvider>,
  );

  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
  fireEvent.click(screen.getByRole("button", { name: /log in/i }));

  await waitFor(() =>
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/login"),
      expect.any(Object),
    ),
  );
});

test("unauthenticated user redirected from ProtectedRoute", async () => {
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
    </AuthProvider>,
  );

  expect(await screen.findByText(/login page/i)).toBeInTheDocument();
});

test("authenticated user sees protected content", async () => {
  let authApi;
  function Harness() {
    authApi = useAuth();
    return <ProtectedPage />;
  }

  render(
    <AuthProvider>
      <MemoryRouter>
        <Harness />
      </MemoryRouter>
    </AuthProvider>,
  );

  await waitFor(() => expect(authApi).toBeDefined());

  await authApi.login("authed@example.com", "pw123");

  expect(await screen.findByText(/welcome authed/i)).toBeInTheDocument();
});

test("logout clears token and user", async () => {
  let authApi;
  function Harness() {
    authApi = useAuth();
    return <ProtectedPage />;
  }

  render(
    <AuthProvider>
      <MemoryRouter>
        <Harness />
      </MemoryRouter>
    </AuthProvider>,
  );

  await authApi.login("test@example.com", "pw123");
  await waitFor(() => expect(authApi.token).toBe("fake-jwt-token"));

  authApi.logout();

  await waitFor(() => expect(authApi.token).toBe(null));
  expect(screen.getByText(/welcome guest/i)).toBeInTheDocument();
});
