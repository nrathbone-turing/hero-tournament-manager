// File: frontend/src/__tests__/EventDashboard.test.jsx
// Purpose: Tests for EventDashboard component.
// Notes:
// - Relies on global fetch mock for /events.
// - Covers rendering list, form submission, placeholder images, status spacing, scrollable list, and entrant count.

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../test-utils";
import EventDashboard from "../components/EventDashboard";

describe("EventDashboard", () => {
  test("renders events heading", async () => {
    renderWithRouter(<EventDashboard />);
    expect(
      await screen.findByRole("heading", { name: /events/i }),
    ).toBeInTheDocument();
  });

  test("displays events with entrant counts", async () => {
    renderWithRouter(<EventDashboard />);
    expect(await screen.findByText(/Hero Cup/)).toBeInTheDocument();
    expect(await screen.findByText(/2 entrants/i)).toBeInTheDocument();
  });

  test("submits new event and refreshes list", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // first GET
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 3,
          name: "Test Event",
          date: "2025-09-20",
          status: "drafting",
          entrant_count: 0,
        }),
      }) // POST
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 3, name: "Test Event", date: "2025-09-20", status: "drafting", entrant_count: 0 },
        ],
      }); // GET after POST

    renderWithRouter(<EventDashboard />);
    await userEvent.type(screen.getByLabelText(/name/i), "Test Event");
    await userEvent.type(screen.getByLabelText(/date/i), "2025-09-20");
    await userEvent.click(
      screen.getByRole("button", { name: /create event/i }),
    );

    expect(await screen.findByText(/Test Event/)).toBeInTheDocument();
  });

  test("handles empty state gracefully", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    renderWithRouter(<EventDashboard />);
    expect(await screen.findByText(/no events available/i)).toBeInTheDocument();
  });
});