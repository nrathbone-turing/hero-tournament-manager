// File: frontend/src/__tests__/EventDetail.test.jsx
// Purpose: Tests for EventDetail component.
// Notes:
// - Renders details for a single event.
// - Shows entrants and matches for that event.
// - Uses mocked fetch responses with partial text matching for reliability.

import { render, screen } from "@testing-library/react"
import EventDetail from "../components/EventDetail"

describe("EventDetail", () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    global.fetch = jest.fn()
  })

  test("renders event name and date", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: "Hero Cup",
        date: "2025-09-12",
        rules: "Bo3",
        status: "open",
        entrants: [],
        matches: [],
      }),
    })

    render(<EventDetail eventId={1} />)

    expect(await screen.findByText(/Hero Cup/)).toBeInTheDocument()
    expect(screen.getByText(/2025-09-12/)).toBeInTheDocument()
    expect(screen.getByText(/open/)).toBeInTheDocument()
  })

  test("renders entrants list", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: "Hero Cup",
        date: "2025-09-12",
        rules: "Bo3",
        status: "open",
        entrants: [
          { id: 1, name: "Spiderman", alias: "Webslinger" },
          { id: 2, name: "Batman", alias: "Dark Knight" },
        ],
        matches: [],
      }),
    })

    render(<EventDetail eventId={1} />)

    expect(await screen.findByText(/Spiderman/)).toBeInTheDocument()
    expect(await screen.findByText(/Batman/)).toBeInTheDocument()
  })

  test("renders matches list", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: "Hero Cup",
        date: "2025-09-12",
        rules: "Bo3",
        status: "open",
        entrants: [],
        matches: [
          { id: 1, round: 1, scores: "2-1", winner: "Spiderman" },
        ],
      }),
    })

    render(<EventDetail eventId={1} />)

    expect(await screen.findByText(/Round 1/)).toBeInTheDocument()
    expect(screen.getByText(/Winner: Spiderman/)).toBeInTheDocument()
  })
})
