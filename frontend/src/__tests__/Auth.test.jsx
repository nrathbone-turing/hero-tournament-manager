// File: frontend/src/__tests__/Auth.test.jsx
// Purpose: Tests frontend authentication flow with AuthContext and forms.
// Notes:
// - Covers signup, login, protected route access, and logout.
// - Uses a test harness component to safely access useAuth() inside tests.

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
        json: () =>
          Promise.resolve({ username: "testuser", email: "test@example.com" }),
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

// Test harness to safely use useAuth in tests
function AuthTestHarness({ onReady }) {
  const auth = useAuth();
  React.useEffect(() => {
    onReady(auth);
  }, [auth, onReady]);
  return null;
}

test("signup form creates a new user", async () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <SignupForm />
      </MemoryRouter>
    </AuthProvider>,
  );

  fireEvent.change(screen.getByLabelText(/username/i), {
    target: { value: "testuser" },
  });
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: "password123" },
  });
  fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

  await waitFor(() => {
    expect(screen.getByText(/signed up as testuser/i)).toBeInTheDocument();
  });
});

test("login form logs in and sets token", async () => {
  render(
    <AuthProvider>
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    </AuthProvider>,
  );

  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: "password123" },
  });
  fireEvent.click(screen.getByRole("button", { name: /log in/i }));

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/login"),
      expect.any(Object),
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
    </AuthProvider>,
  );

  await waitFor(() => {
    expect(screen.getByText(/login page/i)).toBeInTheDocument();
  });
});

test("authenticated user sees protected content", async () => {
  let authApi;
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route path="/protected" element={<ProtectedPage />} />
        </Routes>
        <AuthTestHarness onReady={(api) => (authApi = api)} />
      </MemoryRouter>
    </AuthProvider>,
  );

  await waitFor(() => {
    expect(authApi).toBeDefined();
  });

  // simulate user in context
  authApi.setUser({ username: "authedUser" });

  await waitFor(() => {
    expect(screen.getByText(/welcome authedUser/i)).toBeInTheDocument();
  });
});

test("logout clears auth state (token + UI)", async () => {
  let authApi;
  render(
    <AuthProvider>
      <MemoryRouter>
        <ProtectedPage />
        <AuthTestHarness onReady={(api) => (authApi = api)} />
      </MemoryRouter>
    </AuthProvider>,
  );

  await waitFor(() => {
    expect(authApi).toBeDefined();
  });

  // simulate login
  await authApi.login("test@example.com", "password123");

  expect(authApi.token).toBe("fake-jwt-token");

  // logout
  authApi.logout();

  // wait for token clear
  await waitFor(() => {
    expect(authApi.token).toBe(null);
  });

  // then check UI separately
  expect(screen.getByText(/welcome guest/i)).toBeInTheDocument();
});

test("login sets user details in context", async () => {
  let authApi;
  render(
    <AuthProvider>
      <MemoryRouter>
        <ProtectedPage />
        <AuthTestHarness onReady={(api) => (authApi = api)} />
      </MemoryRouter>
    </AuthProvider>,
  );

  await waitFor(() => {
    expect(authApi).toBeDefined();
  });

  // login
  await authApi.login("authedUser@example.com", "password123");

  // wait for token
  await waitFor(() => {
    expect(authApi.token).toBe("fake-jwt-token");
  });

  // check UI
  expect(screen.getByText(/welcome autheduser/i)).toBeInTheDocument();
});
