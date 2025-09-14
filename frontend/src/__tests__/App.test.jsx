// File: frontend/src/__tests__/App.test.jsx
// Purpose: Routing tests for App component.
// Notes:
// - Relies on global fetch mock from setupTests.js.
// - Explicitly mocks /events again for navigation back to dashboard.

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { renderWithRouter } from "../test-utils";

describe("App routing", () => {
  test("renders Hero Tournament Manager heading on home route", async () => {
    renderWithRouter(<App />, { route: "/" });
    expect(
      await screen.findByRole("heading", { name: /hero tournament manager/i })
    ).toBeInTheDocument();
  });

  test("renders EventDashboard on home route", async () => {
    renderWithRouter(<App />, { route: "/" });
    expect(await screen.findByText(/Hero Cup/i)).toBeInTheDocument();
    expect(screen.getByText(/Villain Showdown/i)).toBeInTheDocument();
  });

  test("renders EventDetail on event detail route", async () => {
    // Mock single event for /events/1
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: "Hero Cup",
        date: "2025-09-12",
        status: "open",
        entrants: [],
        matches: [],
      }),
    });

    renderWithRouter(<App />, { route: "/events/1" });
    expect(
      await screen.findByRole("heading", { name: /event detail/i })
    ).toBeInTheDocument();
  });

  test("navigates between Dashboard and EventDetail", async () => {
    // Step 1: mock list for dashboard
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: "Hero Cup", date: "2025-09-12", status: "open" },
      ],
    });

    renderWithRouter(<App />, { route: "/" });
    expect(await screen.findByText(/Hero Cup/i)).toBeInTheDocument();

    // Step 2: mock single event for detail
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: "Hero Cup",
        date: "2025-09-12",
        status: "open",
        entrants: [],
        matches: [],
      }),
    });

    await userEvent.click(screen.getByRole("link", { name: /hero cup/i }));
    expect(await screen.findByRole("heading", { name: /event detail/i })).toBeInTheDocument();

    // Step 3: mock list again for navigation back
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: "Hero Cup", date: "2025-09-12", status: "open" },
        { id: 2, name: "Villain Showdown", date: "2025-09-13", status: "closed" },
      ],
    });

    await userEvent.click(screen.getByRole("link", { name: /back to events/i }));
    expect(await screen.findByText(/Hero Cup/i)).toBeInTheDocument();
  });
});
