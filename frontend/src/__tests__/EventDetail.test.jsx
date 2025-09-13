// File: frontend/src/__tests__/EventDetail.test.jsx
// Purpose: Tests for EventDetail component.
// Notes:
// - Renders details for a single event
// - Shows entrants and matches for that event
// - Uses mocked fetch calls

import { render, screen, waitFor } from "@testing-library/react"
import EventDetail from "../components/EventDetail"

describe("EventDetail", () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test("renders event name and date", async () => {
    fetch.mockResolvedValueOnce({
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

    expect(await screen.findByText("Hero Cup")).toBeInTheDocument()
    expect(screen.getByText(/2025-09-12/)).toBeInTheDocument()
  })

  test("renders entrants list", async () => {
    fetch.mockResolvedValueOnce({
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

    expect(await screen.findByText("Spiderman")).toBeInTheDocument()
    expect(screen.getByText("Batman")).toBeInTheDocument()
  })

  test("renders matches list", async () => {
    fetch.mockResolvedValueOnce({
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
