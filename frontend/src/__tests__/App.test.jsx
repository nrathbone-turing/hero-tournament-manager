// File: frontend/src/__tests__/App.test.jsx
// Purpose: Routing tests for App component.
// Notes:
// - Relies on global fetch mock from setupTests.js.
// - Uses data-testid attributes to reliably detect which dashboard renders.

import { screen } from "@testing-library/react"
import App from "../App"
import { renderWithRouter } from "../test-utils"

describe("App routing", () => {
  test("renders Hero Tournament Manager heading on home route", async () => {
    renderWithRouter(<App />, { route: "/" })
    expect(
      await screen.findByRole("heading", { name: /hero tournament manager/i })
    ).toBeInTheDocument()
  })

  test("renders EventDashboard on home route", async () => {
    renderWithRouter(<App />, { route: "/" })
    expect(await screen.findByTestId("event-dashboard")).toBeInTheDocument()
    expect(screen.queryByTestId("entrant-dashboard")).toBeNull()
  })

  test("renders EventDetail on event detail route", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        name: "Hero Cup",
        date: "2025-09-12",
        status: "open",
        entrants: [],
        matches: [],
      }),
    })

    renderWithRouter(<App />, { route: "/events/1" })
    expect(await screen.findByTestId("event-detail")).toBeInTheDocument()
  })

  test.skip("navigates between Dashboard and EventDetail", () => {
    // TODO: implement once EventDashboard exposes <Link> interactions
  })
})
