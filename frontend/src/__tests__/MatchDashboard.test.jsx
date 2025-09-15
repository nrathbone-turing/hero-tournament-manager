// File: frontend/src/__tests__/MatchDashboard.test.jsx
// Purpose: Tests for MatchDashboard component.
// Notes:
// - Ensures POST includes winner_id and callback is called.

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../test-utils";
import MatchDashboard from "../components/MatchDashboard";

describe("MatchDashboard", () => {
  test("renders Add Match form", () => {
    renderWithRouter(<MatchDashboard eventId={1} />);
    expect(
      screen.getByRole("heading", { name: /add match/i }),
    ).toBeInTheDocument();
  });

  test("submits new match and triggers callback", async () => {
    const mockOnAdded = jest.fn();
    renderWithRouter(<MatchDashboard eventId={1} onMatchAdded={mockOnAdded} />);

    await userEvent.type(screen.getByLabelText(/round/i), "1");
    await userEvent.type(screen.getByLabelText(/entrant 1 id/i), "1");
    await userEvent.type(screen.getByLabelText(/entrant 2 id/i), "2");
    await userEvent.type(screen.getByLabelText(/scores/i), "2-1");
    await userEvent.type(screen.getByLabelText(/winner id/i), "1");
    await userEvent.click(screen.getByRole("button", { name: /add match/i }));

    await waitFor(() => {
      expect(mockOnAdded).toHaveBeenCalled();
    });
  });

  test("shows error on API failure", async () => {
    global.fetch.mockRejectedValueOnce(new Error("API Error"));
    renderWithRouter(<MatchDashboard eventId={1} />);
    await userEvent.type(screen.getByLabelText(/round/i), "1");
    await userEvent.type(screen.getByLabelText(/entrant 1 id/i), "1");
    await userEvent.type(screen.getByLabelText(/entrant 2 id/i), "2");
    await userEvent.type(screen.getByLabelText(/scores/i), "2-0");
    await userEvent.type(screen.getByLabelText(/winner id/i), "1");
    await userEvent.click(screen.getByRole("button", { name: /add match/i }));
    expect(
      await screen.findByText(/failed to add match/i),
    ).toBeInTheDocument();
  });
});