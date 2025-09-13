// File: frontend/src/__tests__/EventDetail.test.jsx
// Purpose: Tests for EventDetail component with Entrants + Matches.
// Notes:
// - Uses renderWithRouter for Router context.
// - Adds tests for EntrantDashboard integration.

import { screen } from "@testing-library/react";
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
      // GET /events/1
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
      // GET /entrants?event_id=1 (initial EntrantDashboard call)
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
      // GET /entrants?event_id=1 after add
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 3, name: "Ironman", alias: "Tony", event_id: 1 },
        ],
      });

    renderWithRouter(<EventDetail eventId={1} />, { route: "/events/1" });

    const nameInput = await screen.findByLabelText(/name/i);
    const aliasInput = screen.getByLabelText(/alias/i);

    await userEvent.type(nameInput, "Ironman");
    await userEvent.type(aliasInput, "Tony");
    await userEvent.click(screen.getByRole("button", { name: /add entrant/i }));

    expect(await screen.findByText(/Ironman/)).toBeInTheDocument();
  });
});
