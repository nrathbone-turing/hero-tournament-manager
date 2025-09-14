// File: frontend/src/__tests__/MatchDashboard.test.jsx
// Purpose: Tests for MatchDashboard component.
// Notes:
// - Only tests form submission since EventDetail owns match list.
// - Ensures callback is called after POST.

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../test-utils";
import MatchDashboard from "../components/MatchDashboard";

describe("MatchDashboard", () => {
  test("renders Add Match form", () => {
    renderWithRouter(<MatchDashboard eventId={1} />);
    expect(screen.getByRole("heading", { name: /add match/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/round/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/entrant 1 id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/entrant 2 id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/scores/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/winner/i)).toBeInTheDocument();
  });

  test("submits new match and triggers callback", async () => {
    const mockOnAdded = jest.fn();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 5,
        round: 1,
        entrant1_id: 1,
        entrant2_id: 2,
        scores: "2-0",
        winner: "Spiderman",
        event_id: 1,
      }),
    });

    renderWithRouter(<MatchDashboard eventId={1} onMatchAdded={mockOnAdded} />);

    await userEvent.type(screen.getByLabelText(/round/i), "1");
    await userEvent.type(screen.getByLabelText(/entrant 1 id/i), "1");
    await userEvent.type(screen.getByLabelText(/entrant 2 id/i), "2");
    await userEvent.type(screen.getByLabelText(/scores/i), "2-0");
    await userEvent.type(screen.getByLabelText(/winner/i), "Spiderman");

    await userEvent.click(screen.getByRole("button", { name: /add match/i }));

    expect(mockOnAdded).toHaveBeenCalled();
  });
});
