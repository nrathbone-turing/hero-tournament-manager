// File: frontend/src/__tests__/EventDetail.test.jsx
// Purpose: Tests for EventDetail component with Entrants + Matches.
// Notes:
// - EventDetail owns entrant list and re-fetches after EntrantDashboard submission.
// - Includes tests for adding and removing entrants, and displaying match winners.

import { screen, waitFor } from "@testing-library/react";
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

  test("adds entrant updates event list", async () => {
    global.fetch
      // GET /events/1 (initial)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          name: "Hero Cup",
          date: "2025-09-12",
          status: "open",
          entrants: [],
          matches: [],
        }),
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
      // GET /events/1 (after POST)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          name: "Hero Cup",
          date: "2025-09-12",
          status: "open",
          entrants: [{ id: 3, name: "Ironman", alias: "Tony" }],
          matches: [],
        }),
      });

    renderWithRouter(<EventDetail eventId={1} />, { route: "/events/1" });

    await userEvent.type(await screen.findByLabelText(/name/i), "Ironman");
    await userEvent.type(screen.getByLabelText(/alias/i), "Tony");
    await userEvent.click(screen.getByRole("button", { name: /add entrant/i }));

    expect(await screen.findByText(/Ironman/)).toBeInTheDocument();
    expect(await screen.findByText(/Tony/)).toBeInTheDocument();
  });

  test("renders match winner by entrant name", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: "Hero Cup",
        date: "2025-09-12",
        status: "open",
        entrants: [
          { id: 1, name: "Spiderman", alias: "Webslinger" },
          { id: 2, name: "Batman", alias: "Dark Knight" },
        ],
        matches: [{ id: 10, round: 1, scores: "2-1", winner_id: 2 }],
      }),
    });

    renderWithRouter(<EventDetail eventId={1} />, { route: "/events/1" });

    // Check for round number safely
    const roundCells = await screen.findAllByText("1");
    expect(roundCells.length).toBeGreaterThan(0);

    expect(await screen.findByText("2-1")).toBeInTheDocument();
    expect(await screen.findByText(/Batman \(Dark Knight\)/)).toBeInTheDocument();
  });

  test("removes entrant updates event list", async () => {
    global.fetch
      // GET /events/1 (initial with entrant to remove)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          name: "Hero Cup",
          date: "2025-09-12",
          status: "open",
          entrants: [{ id: 5, name: "Thor", alias: "Odinson" }],
          matches: [],
        }),
      })
      // DELETE /entrants/5
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
      // GET /events/1 (after deletion, empty entrants)
      .mockResolvedValueOnce({
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

    renderWithRouter(<EventDetail eventId={1} />, { route: "/events/1" });

    expect(await screen.findByText(/Thor/)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/Entrant ID/i), "5");
    await userEvent.click(screen.getByRole("button", { name: /remove entrant/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Thor/)).not.toBeInTheDocument();
    });
  });
});
