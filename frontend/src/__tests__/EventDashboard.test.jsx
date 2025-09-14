// File: frontend/src/__tests__/EventDashboard.test.jsx
// Purpose: Tests for EventDashboard component.
// Notes:
// - Relies on global fetch mock for /events.
// - Covers rendering list + form submission.

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../test-utils";
import EventDashboard from "../components/EventDashboard";

describe("EventDashboard", () => {
  test("renders events heading", async () => {
    renderWithRouter(<EventDashboard />);
    expect(await screen.findByRole("heading", { name: /events/i })).toBeInTheDocument();
  });

  test("displays events returned from API", async () => {
    renderWithRouter(<EventDashboard />);
    expect(await screen.findByText(/Hero Cup/i)).toBeInTheDocument();
    expect(await screen.findByText(/Villain Showdown/i)).toBeInTheDocument();
  });

  test("submits new event and refreshes list", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [], // initial GET
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 3, name: "Test Event", date: "2025-09-20", status: "open" }),
      }) // POST
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 3, name: "Test Event", date: "2025-09-20", status: "open" }],
      }); // GET after POST

    renderWithRouter(<EventDashboard />);

    await userEvent.type(screen.getByLabelText(/name/i), "Test Event");
    await userEvent.type(screen.getByLabelText(/date/i), "2025-09-20");
    await userEvent.click(screen.getByRole("button", { name: /create event/i }));

    expect(await screen.findByText(/Test Event/)).toBeInTheDocument();
  });
});
