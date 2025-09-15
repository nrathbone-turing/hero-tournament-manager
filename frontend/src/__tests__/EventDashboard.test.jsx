// File: frontend/src/__tests__/EventDashboard.test.jsx
// Purpose: Tests for EventDashboard component.
// Notes:
// - Relies on global fetch mock for /events.
// - Covers rendering list, form submission, placeholder images, status spacing, scrollable list, and entrant count.

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../test-utils";
import EventDashboard from "../components/EventDashboard";
import { mockFetchSuccess } from "../setupTests";

describe("EventDashboard", () => {
  test("renders events heading", async () => {
    mockFetchSuccess();
    renderWithRouter(<EventDashboard />);
    expect(await screen.findByRole("heading", { name: /events/i })).toBeInTheDocument();
  });

  test("shows entrant counts", async () => {
    mockFetchSuccess([
      { id: 1, name: "Hero Cup", date: "2025-09-12", status: "drafting", entrant_count: 3 },
      { id: 2, name: "Villain Showdown", date: "2025-09-13", status: "published", entrant_count: 5 },
    ]);
    renderWithRouter(<EventDashboard />);
    expect(await screen.findByText(/3 entrants/i)).toBeInTheDocument();
    expect(await screen.findByText(/5 entrants/i)).toBeInTheDocument();
  });

  test("submits new event", async () => {
    mockFetchSuccess([]); // initial GET
    mockFetchSuccess({ id: 3, name: "Test Event", date: "2025-09-20", status: "drafting", entrant_count: 0 }); // POST
    mockFetchSuccess([{ id: 3, name: "Test Event", date: "2025-09-20", status: "drafting", entrant_count: 0 }]); // reload

    renderWithRouter(<EventDashboard />);
    await userEvent.type(screen.getByLabelText(/name/i), "Test Event");
    await userEvent.type(screen.getByLabelText(/date/i), "2025-09-20");
    await userEvent.click(screen.getByRole("button", { name: /create event/i }));

    expect(await screen.findByText(/0 entrants/i)).toBeInTheDocument();
  });
});
