// File: frontend/src/__tests__/EventDetail.test.jsx
// Purpose: Tests for EventDetail component with Entrants + Matches.
// Notes:
// - EventDetail owns entrant list and re-fetches after EntrantDashboard submission.
// - Includes tests for adding/removing entrants, displaying matches, and updating status.

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

    renderWithRouter(<EventDetail />, { route: "/events/1" });

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

    renderWithRouter(<EventDetail />, { route: "/events/1" });

    expect(await screen.findByText(/Spiderman/)).toBeInTheDocument();
    expect(await screen.findByText(/Batman/)).toBeInTheDocument();
  });

  test("adds entrant updates event list", async () => {
    global.fetch
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
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 3,
          name: "Ironman",
          alias: "Tony",
          event_id: 1,
        }),
      })
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

    renderWithRouter(<EventDetail />, { route: "/events/1" });

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

    renderWithRouter(<EventDetail />, { route: "/events/1" });

    expect(await screen.findByText("2-1")).toBeInTheDocument();
    expect(
      await screen.findByText(/Batman \(Dark Knight\)/),
    ).toBeInTheDocument();
  });

  test("removes entrant updates event list", async () => {
    global.fetch
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
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
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

    renderWithRouter(<EventDetail />, { route: "/events/1" });

    expect(await screen.findByText(/Thor/)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/Entrant ID/i), "5");
    await userEvent.click(
      screen.getByRole("button", { name: /remove entrant/i }),
    );

    await waitFor(() => {
      expect(screen.queryByText(/Thor/)).not.toBeInTheDocument();
    });
  });
});

describe("EventDetail - status updates", () => {
  test("updates event status via dropdown", async () => {
    global.fetch
      // Initial GET
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          name: "Hero Cup",
          date: "2025-09-12",
          status: "drafting",
          entrants: [],
          matches: [],
        }),
      })
      // PUT → published
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          name: "Hero Cup",
          date: "2025-09-12",
          status: "published",
          entrants: [],
          matches: [],
        }),
      })
      // Re-fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          name: "Hero Cup",
          date: "2025-09-12",
          status: "published",
          entrants: [],
          matches: [],
        }),
      });

    renderWithRouter(<EventDetail />, { route: "/events/1" });

    expect(await screen.findByText(/Hero Cup/)).toBeInTheDocument();
    expect(screen.getByText(/drafting/i)).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText(/status/i));
    await userEvent.click(screen.getByRole("option", { name: /published/i }));

    expect(await screen.findByDisplayValue(/published/i)).toBeInTheDocument();
  });
});

describe("EventDetail - scrollable lists", () => {
  test("entrants list has scroll styling", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: "Scroll Test Event",
        date: "2025-09-12",
        status: "drafting",
        entrants: Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          name: `Hero ${i + 1}`,
          alias: `Alias${i + 1}`,
        })),
        matches: [],
      }),
    });

    renderWithRouter(<EventDetail />, { route: "/events/1" });

    expect(await screen.findByTestId("entrants-scroll")).toHaveStyle(
      "overflow-y: auto",
    );
  });

  test("matches list has scroll styling", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: "Scroll Test Event",
        date: "2025-09-12",
        status: "drafting",
        entrants: [{ id: 1, name: "Hero 1", alias: "Alias1" }],
        matches: Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          round: 1,
          entrant1_id: 1,
          entrant2_id: null,
          scores: "2-0",
          winner_id: 1,
        })),
      }),
    });

    renderWithRouter(<EventDetail />, { route: "/events/1" });

    expect(await screen.findByTestId("matches-scroll")).toHaveStyle(
      "overflow-y: auto",
    );
  });
});
