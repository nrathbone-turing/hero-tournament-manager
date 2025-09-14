// File: frontend/src/__tests__/EntrantDashboard.test.jsx
// Purpose: Tests for EntrantDashboard component.
// Notes:
// - EntrantDashboard now delegates entrants state to EventDetail.
// - Test only covers rendering form + callback behavior.

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../test-utils";
import EntrantDashboard from "../components/EntrantDashboard";

describe("EntrantDashboard", () => {
  test("renders form fields", () => {
    renderWithRouter(<EntrantDashboard eventId={1} onEntrantAdded={jest.fn()} />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/alias/i)).toBeInTheDocument();
  });

  test("submits new entrant and triggers callback", async () => {
    const mockOnAdded = jest.fn();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 5,
        name: "Black Panther",
        alias: "T'Challa",
        event_id: 1,
      }),
    });

    renderWithRouter(<EntrantDashboard eventId={1} onEntrantAdded={mockOnAdded} />);

    await userEvent.type(screen.getByLabelText(/name/i), "Black Panther");
    await userEvent.type(screen.getByLabelText(/alias/i), "T'Challa");
    await userEvent.click(screen.getByRole("button", { name: /add entrant/i }));

    expect(mockOnAdded).toHaveBeenCalled();
  });
});
