// File: frontend/src/__tests__/MatchDashboard.test.jsx
// Purpose: Tests for MatchDashboard component.
// Notes:
// - Uses renderWithRouter for Router context.
// - Mocks fetch responses to simulate backend API.

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../test-utils";
import MatchDashboard from "../components/MatchDashboard";

describe("MatchDashboard", () => {
  test("renders Matches heading", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithRouter(<MatchDashboard eventId={1} />);
    expect(await screen.findByText(/matches/i)).toBeInTheDocument();
  });

  test("displays matches returned from API", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, round: 1, scores: "2-1", winner: "Spiderman" },
        { id: 2, round: 2, scores: "1-0", winner: "Batman" },
      ],
    });

    renderWithRouter(<MatchDashboard eventId={1} />);
    expect(await screen.findByText(/Round 1/)).toBeInTheDocument();
    expect(await screen.findByText(/Winner: Spiderman/)).toBeInTheDocument();
    expect(await screen.findByText(/Round 2/)).toBeInTheDocument();
    expect(await screen.findByText(/Winner: Batman/)).toBeInTheDocument();
  });

  test("shows empty state when no matches exist", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithRouter(<MatchDashboard eventId={1} />);
    expect(await screen.findByText(/no matches/i)).toBeInTheDocument();
  });

  test("adds new match after form submission", async () => {
    // GET empty → POST → GET with new match
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // initial GET
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 3,
          event_id: 1,
          round: 1,
          entrant1_id: 1,
          entrant2_id: 2,
          scores: "2-0",
          winner: "Spiderman",
        }),
      }) // POST
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 3,
            event_id: 1,
            round: 1,
            entrant1_id: 1,
            entrant2_id: 2,
            scores: "2-0",
            winner: "Spiderman",
          },
        ],
      }); // GET after add

    renderWithRouter(<MatchDashboard eventId={1} />);

    // wait for form inputs
    await screen.findByLabelText(/round/i);
    await userEvent.type(screen.getByLabelText(/round/i), "1");
    await userEvent.type(screen.getByLabelText(/entrant 1 id/i), "1");
    await userEvent.type(screen.getByLabelText(/entrant 2 id/i), "2");
    await userEvent.type(screen.getByLabelText(/scores/i), "2-0");
    await userEvent.type(screen.getByLabelText(/winner/i), "Spiderman");

    await userEvent.click(screen.getByRole("button", { name: /add match/i }));

    expect(await screen.findByText(/Winner: Spiderman/)).toBeInTheDocument();
  });
});
