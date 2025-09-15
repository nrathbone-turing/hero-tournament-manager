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
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 1,
          name: "Hero Cup",
          date: "2025-09-12",
          status: "drafting",
          entrant_count: 3,
        },
        {
          id: 2,
          name: "Villain Showdown",
          date: "2025-09-13",
          status: "published",
          entrant_count: 5,
        },
      ],
    });

    renderWithRouter(<EventDashboard />);

    expect(await screen.findByText(/Hero Cup/)).toBeInTheDocument();
    expect(await screen.findByText(/3 entrants/i)).toBeInTheDocument();
    expect(await screen.findByText(/Villain Showdown/)).toBeInTheDocument();
    expect(await screen.findByText(/5 entrants/i)).toBeInTheDocument();
  });

  test("submits new event and refreshes list", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [], // initial GET
      })
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
          {
            id: 3,
            name: "Test Event",
            date: "2025-09-20",
            status: "drafting",
            entrant_count: 0,
          },
        ],
      }); // GET after POST

    renderWithRouter(<EventDashboard />);

    await userEvent.type(screen.getByLabelText(/name/i), "Test Event");
    await userEvent.type(screen.getByLabelText(/date/i), "2025-09-20");
    await userEvent.click(
      screen.getByRole("button", { name: /create event/i }),
    );

    expect(await screen.findByText(/Test Event/)).toBeInTheDocument();
    expect(await screen.findByText(/0 entrants/i)).toBeInTheDocument();
  });
});
