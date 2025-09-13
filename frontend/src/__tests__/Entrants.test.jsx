// Purpose: Tests for Entrants component.
// Notes:
// - Relies on global fetch mocks.
// - For now, only list + add flow; edit/delete can come later.

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithRouter } from "../test-utils"
import Entrants from "../components/Entrants"

describe("Entrants", () => {
  test("renders entrants heading", () => {
    renderWithRouter(<Entrants eventId={1} />)
    expect(screen.getByText(/entrants/i)).toBeInTheDocument()
  })

  test("displays entrants returned from API", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: "Spiderman", alias: "Webslinger" },
        { id: 2, name: "Batman", alias: "Dark Knight" },
      ],
    })

    renderWithRouter(<Entrants eventId={1} />)

    expect(await screen.findByText("Spiderman")).toBeInTheDocument()
    expect(screen.getByText("Batman")).toBeInTheDocument()
  })

  test("adds a new entrant via form", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [], // initial list empty
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 3,
          name: "Wonder Woman",
          alias: "Amazon Princess",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 3, name: "Wonder Woman", alias: "Amazon Princess" },
        ],
      })

    renderWithRouter(<Entrants eventId={1} />)

    await userEvent.type(screen.getByLabelText(/name/i), "Wonder Woman")
    await userEvent.type(screen.getByLabelText(/alias/i), "Amazon Princess")
    await userEvent.click(screen.getByRole("button", { name: /add entrant/i }))

    expect(await screen.findByText("Wonder Woman")).toBeInTheDocument()
  })
})
