// File: frontend/src/__tests__/App.test.jsx
// Purpose: Routing tests for App component.
// Notes:
// - Relies on global fetch mock from setupTests.js.
// - Explicitly mocks /events again for navigation back to dashboard.
// - Updated to align with ErrorPages (404, 500).

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { renderWithRouter } from "../test-utils";
import { mockFetchSuccess } from "../setupTests";

describe("App routing", () => {
  test("renders Hero Tournament Manager heading", async () => {
    mockFetchSuccess();
    renderWithRouter(<App />, { route: "/" });
    expect(
      await screen.findByRole("heading", { name: /hero tournament manager/i }),
    ).toBeInTheDocument();
  });

  test("renders EventDashboard with events", async () => {
    mockFetchSuccess();
    renderWithRouter(<App />, { route: "/" });
    expect(await screen.findByText(/Hero Cup/i)).toBeInTheDocument();
    expect(screen.getByText(/Villain Showdown/i)).toBeInTheDocument();
  });

  test("navigates Dashboard → EventDetail", async () => {
    // 1) Dashboard list
    mockFetchSuccess([
      { id: 1, name: "Hero Cup", date: "2025-09-12", status: "open" },
    ]);
    renderWithRouter(<App />, { route: "/" });
    expect(await screen.findByText(/Hero Cup/i)).toBeInTheDocument();

    // 2) Queue EventDetail GET BEFORE clicking the link
    mockFetchSuccess({
      id: 1,
      name: "Hero Cup",
      date: "2025-09-12",
      status: "open",
      entrants: [],
      matches: [],
    });

    // 3) Click the event title text (inside <RouterLink>)
    await userEvent.click(screen.getByText(/Hero Cup/i));

    // 4) We should be on the detail view
    expect(
      await screen.findByRole("heading", { name: /hero cup/i }),
    ).toBeInTheDocument();
  });
});

describe("App - edge cases", () => {
  test("navigates to ServerErrorPage on 500 error", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    renderWithRouter(<App />, { route: "/events/999" });

    expect(
      await screen.findByRole("heading", { name: "500" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /something went wrong/i }),
    ).toBeInTheDocument();
  });

  test("renders NotFoundPage on unknown route", async () => {
    renderWithRouter(<App />, { route: "/does-not-exist" });

    expect(await screen.findByTestId("notfound-page")).toBeInTheDocument();
  });

  test("renders NotFoundPage when event not found", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    renderWithRouter(<App />, { route: "/events/999" });

    expect(await screen.findByTestId("notfound-page")).toBeInTheDocument();
  });
});
