// File: frontend/src/__tests__/EventDetail.test.jsx
// Purpose: Tests for EventDetail component with Entrants + Matches.
// Notes:
// - Uses renderWithRouter for Router context.
// - Focuses on Event info + EntrantDashboard integration.

import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EventDetail from "../components/EventDetail";
import { renderWithRouter } from "../test-utils";

describe("EventDetail", () => {
  test("renders event name and date", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: "Hero Cup",
        date: "2025-09-12",
        rules: "Bo3",
        status: "open",
        entrants: [],
        matches: [],
      }),
    });

    renderWithRouter(<EventDetail eventId={1} />, { route: "/events/1" });

    expect(await screen.findByText(/Hero Cup/)).toBeInTheDocument();
    expect(await screen.findByText(/2025-09-12/)).toBeInTheDocument();
  });

  test("renders entrants list", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: "Hero Cup",
        date: "2025-09-12",
        rules: "Bo3",
        status: "open",
        entrants: [
          { id: 1, name: "Spiderman", alias: "Webslinger" },
          { id: 2, name: "Batman", alias: "Dark Knight" },
        ],
        matches: [],
      }),
    });

    renderWithRouter(<EventDetail eventId={1} />, { route: "/events/1" });

    expect(await screen.findByText(/Spiderman/)).toBeInTheDocument();
    expect(await screen.findByText(/Batman/)).toBeInTheDocument();
  });

test("allows adding a new entrant", async () => {
    global.fetch
      // GET /events/1 (initial)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          name: "Hero Cup",
          date: "2025-09-12",
          rules: "Bo3",
          status: "open",
          entrants: [],
          matches: [],
        }),
      })
      // GET /entrants?event_id=1 (EntrantDashboard initial)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      // POST /entrants
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 3,
          name: "Ironman",
          alias: "Tony",
          event_id: 1,
        }),
      })
      // GET /entrants?event_id=1 (after POST)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 3, name: "Ironman", alias: "Tony", event_id: 1 },
        ],
      })
      // GET /events/1 (after onEntrantAdded triggers refetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          name: "Hero Cup",
          date: "2025-09-12",
          rules: "Bo3",
          status: "open",
          entrants: [{ id: 3, name: "Ironman", alias: "Tony" }],
          matches: [],
        }),
      });

    renderWithRouter(<EventDetail eventId={1} />, { route: "/events/1" });

    // Fill entrant form
    await userEvent.type(await screen.findByLabelText(/name/i), "Ironman");
    await userEvent.type(screen.getByLabelText(/alias/i), "Tony");
    await userEvent.click(screen.getByRole("button", { name: /add entrant/i }));

    // Look for entrant in either EntrantDashboard or EventDetail list
    expect(await screen.findByText(/Ironman.*Tony/)).toBeInTheDocument();

    // Narrow scope to entrants <ul>
    const entrantsSection = await screen.findByRole("list");
    expect(
      within(entrantsSection).getByText(/Ironman.*Tony/)
    ).toBeInTheDocument();
  });
});
