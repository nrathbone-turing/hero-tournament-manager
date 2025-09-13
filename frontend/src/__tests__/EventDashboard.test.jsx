// File: frontend/src/__tests__/EventDashboard.test.jsx
// Purpose: Tests for EventDashboard component.
// Notes:
// - Mocks fetch to simulate backend API responses.
// - Covers rendering heading, displaying events, empty state, and adding events.

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import EventDashboard from "../components/EventDashboard"

beforeEach(() => {
  jest.restoreAllMocks()
  global.fetch = jest.fn()
})

test("renders Events heading", () => {
  render(<EventDashboard />)
  expect(screen.getByText(/events/i)).toBeInTheDocument()
})

test("displays events returned from API", async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => [
      { id: 1, name: "Hero Cup", date: "2025-09-12", status: "open" },
      { id: 2, name: "Villain Showdown", date: "2025-09-13", status: "closed" },
    ],
  })

  render(<EventDashboard />)

  // findByText waits until the elements appear
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
  // Initial GET
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => [],
  })
  // POST create
  .mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      id: 2,
      name: "Villain Showdown",
      date: "2025-09-13",
      status: "closed",
    }),
  })
  // GET after creation
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
