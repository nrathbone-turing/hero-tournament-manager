// File: frontend/src/__tests__/AuthFlow.test.jsx
// Purpose: Tests authentication flow and protected routes.
// Notes:
// - Uses renderWithRouter for navigation simulation.
// - Mocks login/signup responses for consistency.

import { screen, fireEvent, waitFor } from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import renderWithRouter from "./test-utils";
import App from "../App";

const server = setupServer(
  rest.post("/login", (req, res, ctx) => {
    return res(ctx.json({ access_token: "fake-token" }));
  }),
  rest.post("/signup", (req, res, ctx) => {
    return res(ctx.json({ username: "newuser", email: "new@example.com" }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("redirects unauthenticated user from / to /login", async () => {
  renderWithRouter(<App />, { route: "/" });
  expect(await screen.findByRole("button", { name: /log in/i })).toBeInTheDocument();
});

test("successful login redirects to dashboard", async () => {
  renderWithRouter(<App />, { route: "/login" });

  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: "test@example.com" },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: "pw123" },
  });
  fireEvent.click(screen.getByRole("button", { name: /log in/i }));

  expect(await screen.findByText(/event dashboard/i)).toBeInTheDocument();
});

test("navbar shows signup/login when logged out", async () => {
  renderWithRouter(<App />, { route: "/" });
  expect(await screen.findByRole("button", { name: /log in/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /signup/i })).toBeInTheDocument();
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

  await waitFor(() =>
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument()
  );
});
