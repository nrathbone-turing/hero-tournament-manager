// File: frontend/src/__tests__/EventDetail.test.jsx
// Purpose: Tests for EventDetail component.
// Notes:
// - Uses renderWithRouter so component has Router context.
// - Mocks fetch responses to simulate backend API.

import { screen } from "@testing-library/react"
import EventDetail from "../components/EventDetail"
import { renderWithRouter } from "../test-utils"

describe("EventDetail", () => {
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

    renderWithRouter(<EventDetail eventId={1} />, { route: "/events/1" })

    expect(await screen.findByText(/Hero Cup/)).toBeInTheDocument()
    expect(await screen.findByText(/2025-09-12/)).toBeInTheDocument()
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

    renderWithRouter(<EventDetail eventId={1} />, { route: "/events/1" })

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

    renderWithRouter(<EventDetail eventId={1} />, { route: "/events/1" })

    expect(await screen.findByText(/Round 1/)).toBeInTheDocument()
    expect(await screen.findByText(/Winner: Spiderman/)).toBeInTheDocument()
  })
})
