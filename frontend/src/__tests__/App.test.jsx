// File: frontend/src/__tests__/App.test.jsx
// Purpose: Routing tests for App component.
// Notes:
// - Verifies correct components render at given routes.
// - Uses MemoryRouter for isolated, testable routing context.

import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import App from "../App"

describe("App routing", () => {
  test("renders Hero Tournament Manager heading on home route", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText(/Hero Tournament Manager/i)).toBeInTheDocument()
    expect(screen.getByText(/Events/i)).toBeInTheDocument()
  })

  test("renders EventDashboard on home route", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText(/Events/i)).toBeInTheDocument()
  })

  test("renders EventDetail on event detail route", async () => {
    render(
      <MemoryRouter initialEntries={["/events/1"]}>
        <App />
      </MemoryRouter>
    )
    expect(await screen.findByText(/Event Detail/i)).toBeInTheDocument()
  })

  test("navigates between Dashboard and EventDetail", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    )

    // Should see Dashboard first
    expect(screen.getByText(/Events/i)).toBeInTheDocument()

    // Simulate navigation link to an event (mocked detail page)
    // For now just assert the link exists — wiring will come later
    expect(
      screen.getByRole("link", { name: /view event/i })
    ).toBeInTheDocument()
  })
})
