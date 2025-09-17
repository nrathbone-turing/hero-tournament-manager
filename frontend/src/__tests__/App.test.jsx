// File: frontend/src/__tests__/App.test.jsx
// Purpose: Routing tests for App component.
// Notes:
// - Relies on global fetch mock from setupTests.js.
// - Explicitly mocks /events before navigation.
// - Covers success, 404, and 500 flows.

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { renderWithRouter } from "../test-utils";
import { mockFetchSuccess } from "../setupTests";

describe("App routing", () => {
  test("renders Navbar brand link", async () => {
    mockFetchSuccess();
    renderWithRouter(<App />, { route: "/" });

    expect(
      await screen.findByRole("link", { name: /hero tournament manager/i }),
    ).toBeInTheDocument();
  });

  test("renders EventDashboard with events", async () => {
    mockFetchSuccess();
    renderWithRouter(<App />, { route: "/" });

    expect(await screen.findByText(/Hero Cup/i)).toBeInTheDocument();
    expect(screen.getByText(/Villain Showdown/i)).toBeInTheDocument();
  });

  test("navigates Dashboard → EventDetail", async () => {
    mockFetchSuccess([
      { id: 1, name: "Hero Cup", date: "2025-09-12", status: "published" },
    ]);
    renderWithRouter(<App />, { route: "/" });

    expect(await screen.findByText(/Hero Cup/i)).toBeInTheDocument();

    // Queue EventDetail fetch
    mockFetchSuccess({
      id: 1,
      name: "Hero Cup",
      date: "2025-09-12",
      status: "published",
      entrants: [],
      matches: [],
    });

    await userEvent.click(screen.getByText(/Hero Cup/i));

    expect(
      await screen.findByRole("heading", { name: /hero cup/i }),
    ).toBeInTheDocument();
  });
});

describe("App - error handling", () => {
  test("shows ServerErrorPage on 500", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    renderWithRouter(<App />, { route: "/events/999" });

    expect(await screen.findByRole("heading", { name: "500" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /something went wrong/i }),
    ).toBeInTheDocument();
  });

  test("shows NotFoundPage on unknown route", async () => {
    renderWithRouter(<App />, { route: "/does-not-exist" });
    expect(await screen.findByTestId("notfound-page")).toBeInTheDocument();
  });

  test("shows NotFoundPage on event 404", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    renderWithRouter(<App />, { route: "/events/999" });

    expect(await screen.findByTestId("notfound-page")).toBeInTheDocument();
  });
});
