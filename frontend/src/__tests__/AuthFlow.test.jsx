// File: frontend/src/__tests__/AuthFlow.test.jsx
// Purpose: Tests authentication flow and protected routes.
// Notes:
// - Uses renderWithRouter for navigation simulation.
// - Reuses mock helpers from setupTests.js for consistency.

import { screen, fireEvent } from "@testing-library/react";
import { renderWithRouter } from "../test-utils.js";
import App from "../App";
import { mockEventsList, mockFetchSuccess } from "../setupTests.js";

beforeEach(() => {
  // Stub common endpoints
  global.fetch.mockImplementation((url) => {
    if (url.endsWith("/login")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ access_token: "fake-token" }),
      });
    }
    if (url.endsWith("/signup")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ username: "newuser", email: "new@example.com" }),
      });
    }
    if (url.includes("/events")) {
      return Promise.resolve({
        ok: true,
        json: async () => mockEventsList,
      });
    }
    return Promise.resolve({ ok: false, status: 404 });
  });
});

afterEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
});

test("redirects unauthenticated user from / to /login", async () => {
  renderWithRouter(<App />, { route: "/" });
  expect(
    await screen.findByRole("button", { name: /log in/i })
  ).toBeInTheDocument();
});

test("navbar shows signup/login when logged out", async () => {
  renderWithRouter(<App />, { route: "/" });
  expect(
    await screen.findByRole("button", { name: /log in/i })
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /signup/i })).toBeInTheDocument();
});

test("navbar shows welcome + logout when logged in", async () => {
  renderWithRouter(<App />, { route: "/login" });

  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: "pw123" },
  });
  fireEvent.click(screen.getByRole("button", { name: /log in/i }));

  expect(await screen.findByText(/welcome/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
});

test("logout clears auth and redirects to login", async () => {
  renderWithRouter(<App />, { route: "/login" });

  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: "pw123" },
  });
  fireEvent.click(screen.getByRole("button", { name: /log in/i }));

  const logoutBtn = await screen.findByRole("button", { name: /logout/i });
  fireEvent.click(logoutBtn);

  expect(
    await screen.findByRole("button", { name: /log in/i })
  ).toBeInTheDocument();
});
