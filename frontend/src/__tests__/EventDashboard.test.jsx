// File: frontend/src/__tests__/EventDashboard.test.jsx
// Purpose: Tests for EventDashboard component.
// Notes:
// - Uses renderWithRouter for consistent Router context.

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EventDashboard from "../components/EventDashboard";
import { renderWithRouter } from "../test-utils";

test("renders Events heading", () => {
  renderWithRouter(<EventDashboard />);
  expect(screen.getByText(/events/i)).toBeInTheDocument();
});

test("displays events returned from API", async () => {
  renderWithRouter(<EventDashboard />);
  expect(await screen.findByText(/Hero Cup/)).toBeInTheDocument();
  expect(await screen.findByText(/Villain Showdown/)).toBeInTheDocument();
});

test("shows empty state when no events exist", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => [],
  });

  renderWithRouter(<EventDashboard />);
  expect(await screen.findByText(/no events available/i)).toBeInTheDocument();
});

test("adds new event after form submission", async () => {
  // Override fetch sequence: GET empty → POST → GET with new event
  global.fetch
    .mockResolvedValueOnce({ ok: true, json: async () => [] })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 2,
        name: "Villain Showdown",
        date: "2025-09-13",
        status: "closed",
      }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 2,
          name: "Villain Showdown",
          date: "2025-09-13",
          status: "closed",
        },
      ],
    });

  renderWithRouter(<EventDashboard />);

  await userEvent.type(screen.getByLabelText(/name/i), "Villain Showdown");
  await userEvent.type(screen.getByLabelText(/date/i), "2025-09-13");
  await userEvent.selectOptions(screen.getByLabelText(/status/i), "closed");
  await userEvent.click(screen.getByRole("button", { name: /create event/i }));

  expect(await screen.findByText(/Villain Showdown/)).toBeInTheDocument();
});
