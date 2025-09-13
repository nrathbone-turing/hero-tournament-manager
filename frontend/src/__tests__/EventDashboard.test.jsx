// File: frontend/src/__tests__/EventDashboard.test.jsx
// Purpose: Tests for EventDashboard component.
// Notes:
// - Relies on global fetch mock from setupTests.js for default responses.
// - Overrides fetch only when custom behavior is required.

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import EventDashboard from "../components/EventDashboard"

test("renders Events heading", () => {
  render(<EventDashboard />)
  expect(screen.getByText(/events/i)).toBeInTheDocument()
})

test("displays events returned from API", async () => {
  render(<EventDashboard />)

  expect(await screen.findByText(/Hero Cup/)).toBeInTheDocument()
  expect(await screen.findByText(/Villain Showdown/)).toBeInTheDocument()
})

test("shows empty state when no events exist", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => [],
  })

  render(<EventDashboard />)
  expect(await screen.findByText(/no events available/i)).toBeInTheDocument()
})

test("adds new event after form submission", async () => {
  // Override fetch sequence: GET empty → POST → GET with new event
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })
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
    })

  render(<EventDashboard />)

  await userEvent.type(screen.getByLabelText(/name/i), "Villain Showdown")
  await userEvent.type(screen.getByLabelText(/date/i), "2025-09-13")
  await userEvent.selectOptions(screen.getByLabelText(/status/i), "closed")
  await userEvent.click(screen.getByRole("button", { name: /create event/i }))

  expect(await screen.findByText(/Villain Showdown/)).toBeInTheDocument()
})
