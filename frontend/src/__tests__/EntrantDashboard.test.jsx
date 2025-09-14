// File: frontend/src/__tests__/EntrantDashboard.test.jsx
// Purpose: Tests for EntrantDashboard component.
// Notes:
// - Relies on global fetch mocks.
// - Covers list + add flow; edit/delete can be added later.

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../test-utils";
import EntrantDashboard from "../components/EntrantDashboard";

describe("EntrantDashboard", () => {
  test("renders entrants heading", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithRouter(<EntrantDashboard eventId={1} />);
    expect(await screen.findByText(/entrants/i)).toBeInTheDocument();
  });

  test("displays entrants returned from API", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: "Spiderman", alias: "Webslinger" },
        { id: 2, name: "Batman", alias: "Dark Knight" },
      ],
    });

    renderWithRouter(<EntrantDashboard eventId={1} />);

    expect(
      await screen.findByText(/Spiderman.*Webslinger/)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/Batman.*Dark Knight/)
    ).toBeInTheDocument();
  });

  test("adds a new entrant via form", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [], // initial GET
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 3,
          name: "Wonder Woman",
          alias: "Amazon Princess",
        }),
      }) // POST
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 3, name: "Wonder Woman", alias: "Amazon Princess" },
        ],
      }); // GET after POST

    renderWithRouter(<EntrantDashboard eventId={1} />);

    await userEvent.type(await screen.findByLabelText(/name/i), "Wonder Woman");
    await userEvent.type(
      screen.getByLabelText(/alias/i),
      "Amazon Princess"
    );
    await userEvent.click(
      screen.getByRole("button", { name: /add entrant/i })
    );

    expect(
      await screen.findByText(/Wonder Woman.*Amazon Princess/)
    ).toBeInTheDocument();
  });
});
