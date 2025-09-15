// File: frontend/src/__tests__/EventDashboard.test.jsx
// Purpose: Tests for EventDashboard component.
// Notes:
// - Relies on global fetch mock for /events.
// - Covers rendering list, form submission, placeholder images, status spacing, scrollable list, and entrant count.

import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../test-utils";
import EventDashboard from "../components/EventDashboard";

describe("EventDashboard", () => {
  test("renders events heading", async () => {
    renderWithRouter(<EventDashboard />);
    expect(await screen.findByRole("heading", { name: /events/i })).toBeInTheDocument();
  });

  test("displays events returned from API", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: "Hero Cup", date: "2025-09-12", status: "drafting", entrant_count: 8 },
        { id: 2, name: "Villain Showdown", date: "2025-09-13", status: "published", entrant_count: 12 },
      ],
    });

    renderWithRouter(<EventDashboard />);
    expect(await screen.findByText(/Hero Cup/)).toBeInTheDocument();
    expect(await screen.findByText(/Villain Showdown/)).toBeInTheDocument();
    expect(await screen.findByText(/8 entrants/)).toBeInTheDocument();
    expect(await screen.findByText(/12 entrants/)).toBeInTheDocument();
  });

  test("submits new event and refreshes list", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] }) // initial GET
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 3, name: "Test Event", date: "2025-09-20", status: "drafting", entrant_count: 0 }),
      }) // POST
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 3, name: "Test Event", date: "2025-09-20", status: "drafting", entrant_count: 0 }],
      }); // GET after POST

    renderWithRouter(<EventDashboard />);

    await userEvent.type(screen.getByLabelText(/event name/i), "Test Event");
    await userEvent.type(screen.getByLabelText(/date/i), "2025-09-20");
    await userEvent.click(screen.getByRole("button", { name: /create event/i }));

    expect(await screen.findByText(/Test Event/)).toBeInTheDocument();
  });

  test("renders placeholder hero image containers", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithRouter(<EventDashboard />);
    expect(await screen.findAllByTestId("hero-image-placeholder")).toHaveLength(2);
  });

  test("status dropdown label is accessible", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithRouter(<EventDashboard />);
    const dropdown = await screen.findByLabelText(/status/i);
    expect(dropdown).toBeInTheDocument();
  });

  test("shows scrollable list when more than 5 events", async () => {
    const events = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      name: `Event ${i + 1}`,
      date: "2025-09-12",
      status: "drafting",
      entrant_count: i + 1,
    }));

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => events,
    });

    renderWithRouter(<EventDashboard />);
    const list = await screen.findByTestId("event-list");
    expect(list).toHaveStyle({ overflowY: "auto" });

    const items = within(list).getAllByRole("link");
    expect(items.length).toBe(8); // still renders all
  });
});
