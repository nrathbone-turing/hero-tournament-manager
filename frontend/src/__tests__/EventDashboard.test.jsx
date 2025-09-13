// File: frontend/src/__tests__/EventDashboard.test.jsx
// Purpose: Unit tests for EventDashboard component.
// Notes:
// - Uses React Testing Library to test rendering and API integration.
// - Covers: initial render, successful API fetch, empty state.

import { render, screen, waitFor } from "@testing-library/react"
import EventDashboard from "../components/EventDashboard"

// Mock the fetch API
beforeEach(() => {
  global.fetch = jest.fn()
})

afterEach(() => {
  jest.restoreAllMocks()
})

test("renders Events heading", () => {
  render(<EventDashboard />)
  expect(screen.getByRole("heading", { name: /events/i })).toBeInTheDocument()
})

test("displays events returned from API", async () => {
  const mockEvents = [
    { id: 1, name: "Hero Cup", date: "2025-09-12", status: "open" },
    { id: 2, name: "Villain Showdown", date: "2025-09-13", status: "closed" },
  ]

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockEvents,
  })

  render(<EventDashboard />)

  const items = await screen.findAllByRole("listitem")
  expect(items[0]).toHaveTextContent("Hero Cup")
  expect(items[1]).toHaveTextContent("Villain Showdown")
})

test("shows empty state when no events exist", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => [],
  })

  render(<EventDashboard />)

  // Use regex for robustness against punctuation/spacing
  expect(await screen.findByText(/no events available/i)).toBeInTheDocument()
})

test("renders event creation form", () => {
  render(<EventDashboard />)

  expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
  expect(screen.getByRole("button", { name: /create event/i })).toBeInTheDocument()
})

test("adds new event after form submission", async () => {
  const mockEvents = [
    { id: 1, name: "Hero Cup", date: "2025-09-12", status: "open" },
  ]

  // First fetch = existing events
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockEvents,
  })

  // Second fetch = updated events after creation
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => [
      ...mockEvents,
      { id: 2, name: "Villain Showdown", date: "2025-09-13", status: "closed" },
    ],
  })

  render(<EventDashboard />)

  // Fill out the form
  screen.getByLabelText(/name/i).value = "Villain Showdown"
  screen.getByLabelText(/date/i).value = "2025-09-13"
  screen.getByLabelText(/status/i).value = "closed"

  screen.getByRole("button", { name: /create event/i }).click()

  await waitFor(() => {
    expect(screen.getByText("Villain Showdown")).toBeInTheDocument()
  })
})
