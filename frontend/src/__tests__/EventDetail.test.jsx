// File: frontend/src/__tests__/EventDetail.test.jsx
// Purpose: Tests for EventDetail component with Entrants + Matches.
// Notes:
// - EventDetail owns entrant list and re-fetches after EntrantDashboard submission.
// - Includes tests for adding/removing entrants, displaying matches, and updating status.

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EventDetail from "../components/EventDetail";
import { renderWithRouter } from "../test-utils";
import { mockFetchSuccess } from "../setupTests";

describe("EventDetail", () => {
  test("renders event name and date", async () => {
    mockFetchSuccess({
      id: 1,
      name: "Hero Cup",
      date: "2025-09-12",
      status: "open",
      entrants: [],
      matches: [],
    });

    renderWithRouter(<EventDetail />, { route: "/events/1" });
    expect(await screen.findByText(/Hero Cup/)).toBeInTheDocument();
    expect(await screen.findByText(/2025-09-12/)).toBeInTheDocument();
  });

  test("renders entrants list", async () => {
    mockFetchSuccess({
      id: 1,
      name: "Hero Cup",
      date: "2025-09-12",
      status: "open",
      entrants: [
        { id: 1, name: "Spiderman", alias: "Webslinger" },
        { id: 2, name: "Batman", alias: "Dark Knight" },
      ],
      matches: [],
    });

    renderWithRouter(<EventDetail />, { route: "/events/1" });
    expect(await screen.findByText(/Spiderman/)).toBeInTheDocument();
    expect(await screen.findByText(/Batman/)).toBeInTheDocument();
  });

  test("adds and removes entrant updates list", async () => {
    // Initial GET
    mockFetchSuccess({
      id: 1,
      name: "Hero Cup",
      date: "2025-09-12",
      status: "open",
      entrants: [],
      matches: [],
    });
    // POST add entrant
    mockFetchSuccess({ id: 3, name: "Ironman", alias: "Tony", event_id: 1 });
    // Reload with entrant
    mockFetchSuccess({
      id: 1,
      name: "Hero Cup",
      date: "2025-09-12",
      status: "open",
      entrants: [{ id: 3, name: "Ironman", alias: "Tony" }],
      matches: [],
    });
    // DELETE remove entrant
    mockFetchSuccess({});
    // Reload with empty list
    mockFetchSuccess({
      id: 1,
      name: "Hero Cup",
      date: "2025-09-12",
      status: "open",
      entrants: [],
      matches: [],
    });

    renderWithRouter(<EventDetail />, { route: "/events/1" });

    await userEvent.type(await screen.findByLabelText(/name/i), "Ironman");
    await userEvent.type(screen.getByLabelText(/alias/i), "Tony");
    await userEvent.click(screen.getByRole("button", { name: /add entrant/i }));

    expect(await screen.findByText(/Ironman/)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/Entrant ID/i), "3");
    await userEvent.click(screen.getByRole("button", { name: /remove entrant/i }));

    await waitFor(() => expect(screen.queryByText(/Ironman/)).not.toBeInTheDocument());
  });

  test("renders match winner by entrant name", async () => {
    mockFetchSuccess({
      id: 1,
      name: "Hero Cup",
      date: "2025-09-12",
      status: "open",
      entrants: [
        { id: 1, name: "Spiderman", alias: "Webslinger" },
        { id: 2, name: "Batman", alias: "Dark Knight" },
      ],
      matches: [{ id: 10, round: 1, scores: "2-1", winner_id: 2 }],
    });

    renderWithRouter(<EventDetail />, { route: "/events/1" });
    expect(await screen.findByText("2-1")).toBeInTheDocument();
    expect(await screen.findByText(/Batman \(Dark Knight\)/)).toBeInTheDocument();
  });

  test("updates event status via dropdown", async () => {
    // Initial GET
    mockFetchSuccess({
      id: 1,
      name: "Hero Cup",
      date: "2025-09-12",
      status: "drafting",
      entrants: [],
      matches: [],
    });
    // PUT update
    mockFetchSuccess({
      id: 1,
      name: "Hero Cup",
      date: "2025-09-12",
      status: "published",
      entrants: [],
      matches: [],
    });
    // Reload GET
    mockFetchSuccess({
      id: 1,
      name: "Hero Cup",
      date: "2025-09-12",
      status: "published",
      entrants: [],
      matches: [],
    });

    renderWithRouter(<EventDetail />, { route: "/events/1" });
    expect(await screen.findByText(/Hero Cup/)).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText(/status/i));
    await userEvent.click(screen.getByRole("option", { name: /published/i }));

    expect(await screen.findByDisplayValue(/published/i)).toBeInTheDocument();
  });

  describe("scrollable lists", () => {
    test("entrants list has scroll styling", async () => {
      mockFetchSuccess({
        id: 1,
        name: "Scroll Event",
        date: "2025-09-12",
        status: "drafting",
        entrants: Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          name: `Hero ${i + 1}`,
          alias: `Alias${i + 1}`,
        })),
        matches: [],
      });

      renderWithRouter(<EventDetail />, { route: "/events/1" });
      expect(await screen.findByTestId("entrants-scroll")).toHaveStyle("overflow-y: auto");
    });

    test("matches list has scroll styling", async () => {
      mockFetchSuccess({
        id: 1,
        name: "Scroll Event",
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
      });

      renderWithRouter(<EventDetail />, { route: "/events/1" });
      expect(await screen.findByTestId("matches-scroll")).toHaveStyle("overflow-y: auto");
    });
  });
});

describe("EventDetail - edge cases", () => {
  test("shows error when event not found", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false });
    renderWithRouter(<EventDetail />, { route: "/events/404" });
    expect(await screen.findByText(/event not found/i)).toBeInTheDocument();
  });

  test("removal failure keeps entrant in list", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          name: "Hero Cup",
          entrants: [{ id: 5, name: "Thor", alias: "Odinson" }],
          matches: [],
        }),
      })
      .mockResolvedValueOnce({ ok: false });

    renderWithRouter(<EventDetail />, { route: "/events/1" });
    await userEvent.type(await screen.findByLabelText(/Entrant ID/i), "5");
    await userEvent.click(screen.getByRole("button", { name: /remove entrant/i }));
    expect(await screen.findByText(/Thor/)).toBeInTheDocument();
  });

  test("status update failure reverts dropdown", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: "Hero Cup", status: "drafting", entrants: [], matches: [] }),
      })
      .mockResolvedValueOnce({ ok: false });

    renderWithRouter(<EventDetail />, { route: "/events/1" });
    await userEvent.click(await screen.findByLabelText(/status/i));
    await userEvent.click(screen.getByRole("option", { name: /published/i }));
    expect(await screen.findByDisplayValue(/drafting/i)).toBeInTheDocument();
  });

  test("renders match with TBD winner when winner_id missing", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: "Hero Cup",
        entrants: [{ id: 1, name: "Spidey", alias: "Webhead" }],
        matches: [{ id: 101, round: 1, scores: "1-1", winner_id: null }],
      }),
    });

    renderWithRouter(<EventDetail />, { route: "/events/1" });
    expect(await screen.findByText(/tbd/i)).toBeInTheDocument();
  });
});
