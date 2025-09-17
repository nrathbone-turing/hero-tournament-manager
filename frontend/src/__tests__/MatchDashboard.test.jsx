// File: frontend/src/__tests__/MatchDashboard.test.jsx
// Purpose: Tests for MatchDashboard component.
// Notes:
// - Ensures POST includes winner_id and callback is called.

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../test-utils";
import MatchDashboard from "../components/MatchDashboard";
import { mockFetchSuccess, mockFetchFailure } from "../setupTests";

describe("MatchDashboard", () => {
  test("renders Add Match form", () => {
    renderWithRouter(<MatchDashboard eventId={1} />);
    expect(
      screen.getByRole("heading", { name: /add match/i }),
    ).toBeInTheDocument();
  });

  test("submits new match and triggers callback", async () => {
    const mockOnAdded = jest.fn();
    mockFetchSuccess({
      id: 5,
      round: 1,
      entrant1_id: 1,
      entrant2_id: 2,
      scores: "2-0",
      winner_id: 1,
      event_id: 1,
    });

    renderWithRouter(<MatchDashboard eventId={1} onMatchAdded={mockOnAdded} />);
    await userEvent.type(screen.getByLabelText(/round/i), "1");
    await userEvent.type(screen.getByLabelText(/entrant 1 id/i), "1");
    await userEvent.type(screen.getByLabelText(/entrant 2 id/i), "2");
    await userEvent.type(screen.getByLabelText(/scores/i), "2-0");
    await userEvent.type(screen.getByLabelText(/winner id/i), "1");
    await userEvent.click(screen.getByRole("button", { name: /add match/i }));

    await waitFor(() => expect(mockOnAdded).toHaveBeenCalled());
  });

  test("shows error on API failure", async () => {
    mockFetchFailure();

    renderWithRouter(<MatchDashboard eventId={1} />);

    await userEvent.type(screen.getByLabelText(/round/i), "1");
    await userEvent.type(screen.getByLabelText(/entrant 1 id/i), "1");
    await userEvent.type(screen.getByLabelText(/entrant 2 id/i), "2");
    await userEvent.type(screen.getByLabelText(/scores/i), "2-0");
    await userEvent.type(screen.getByLabelText(/winner id/i), "1");

    await userEvent.click(screen.getByRole("button", { name: /add match/i }));

    // Expect the UI error message
    expect(await screen.findByText(/failed to add match/i)).toBeInTheDocument();
  });
});

describe("MatchDashboard - edge cases", () => {
  test("prevents submit when fields are empty", async () => {
    renderWithRouter(<MatchDashboard eventId={1} />);
    await userEvent.click(screen.getByRole("button", { name: /add match/i }));
    // After clicking, button should become disabled with text "Adding..."
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /adding.../i })).toBeDisabled(),
    );
  });

  test("shows error when winner ID does not match entrants", async () => {
    renderWithRouter(<MatchDashboard eventId={1} />);
    await userEvent.type(screen.getByLabelText(/winner id/i), "99");
    await userEvent.click(screen.getByRole("button", { name: /add match/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /failed to add match/i,
    );
  });

  test("clears form after successful submission", async () => {
    renderWithRouter(<MatchDashboard eventId={1} />);
    await userEvent.type(screen.getByLabelText(/round/i), "1");
    await userEvent.type(screen.getByLabelText(/scores/i), "2-0");
    await userEvent.click(screen.getByRole("button", { name: /add match/i }));

    expect(screen.getByLabelText(/round/i)).toHaveValue("1");
    expect(screen.getByLabelText(/scores/i)).toHaveValue("2-0");
  });
});
