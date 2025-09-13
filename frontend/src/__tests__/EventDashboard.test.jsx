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
