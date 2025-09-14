// File: frontend/src/__tests__/EntrantDashboard.test.jsx
// Purpose: Tests for EntrantDashboard component.
// Notes:
// - Only tests form behavior (EventDetail owns entrant list).
// - Ensures callback is called after POST.

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../test-utils";
import EntrantDashboard from "../components/EntrantDashboard";

describe("EntrantDashboard", () => {
  test("renders Add Entrant form", () => {
    renderWithRouter(<EntrantDashboard eventId={1} />);
    expect(screen.getByRole("heading", { name: /add entrant/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/alias/i)).toBeInTheDocument();
  });

  test("submits new entrant and triggers callback", async () => {
    const mockOnAdded = jest.fn();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 3, name: "Wonder Woman", alias: "Amazon Princess" }),
    });

    renderWithRouter(<EntrantDashboard eventId={1} onEntrantAdded={mockOnAdded} />);

    await userEvent.type(screen.getByLabelText(/name/i), "Wonder Woman");
    await userEvent.type(screen.getByLabelText(/alias/i), "Amazon Princess");
    
    await userEvent.click(screen.getByRole("button", { name: /add entrant/i }));

    await waitFor(() => {
      expect(mockOnAdded).toHaveBeenCalled();
    });
  });
});
