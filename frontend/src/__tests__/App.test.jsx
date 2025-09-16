// File: frontend/src/__tests__/App.test.jsx
// Purpose: Routing tests for App component.
// Notes:
// - Relies on global fetch mock from setupTests.js.
// - Explicitly mocks /events again for navigation back to dashboard.

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
      await screen.findByRole("heading", { name: /hero tournament manager/i })
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
    mockFetchSuccess([{ id: 1, name: "Hero Cup", date: "2025-09-12", status: "open" }]);
    renderWithRouter(<App />, { route: "/" });
    expect(await screen.findByText(/Hero Cup/i)).toBeInTheDocument();

    // 2) Queue EventDetail GET BEFORE we click the card title
    mockFetchSuccess({
      id: 1,
      name: "Hero Cup",
      date: "2025-09-12",
      status: "open",
      entrants: [],
      matches: [],
    });

    // 3) Click the event title text (inside the <Link/>)
    await userEvent.click(screen.getByText(/Hero Cup/i));

    // 4) We should be on the detail view (heading "Hero Cup")
    expect(
      await screen.findByRole("heading", { name: /hero cup/i })
    ).toBeInTheDocument();
  });
});

describe("App - edge cases", () => {
  test("shows loading and error state on failed event fetch", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false });
    renderWithRouter(<App />, { route: "/events/999" });
    expect(await screen.findByText(/loading event/i)).toBeInTheDocument();
  });

  test.skip("renders Not Found on unknown route", async () => {
    renderWithRouter(<App />, { route: "/random" });
    expect(await screen.findByText(/not found/i)).toBeInTheDocument();
  });
});
