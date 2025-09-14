// File: frontend/src/__tests__/App.test.jsx
// Purpose: Routing tests for App component.
// Notes:
// - Uses renderWithRouter + global fetch mock.
// - Confirms EventDashboard and EventDetail render in correct routes.

import { screen } from "@testing-library/react";
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
    // From global fetch mock in setupTests.js
    expect(await screen.findByText(/Hero Cup/i)).toBeInTheDocument();
    expect(screen.getByText(/Villain Showdown/i)).toBeInTheDocument();
  });

  test("renders EventDetail on event detail route", async () => {
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

  test.skip("navigates between Dashboard and EventDetail", () => {
    // TODO: add once EventDashboard exposes navigation <Link>
  });
});
