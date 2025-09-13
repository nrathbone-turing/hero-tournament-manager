// File: frontend/src/__tests__/EntrantDashboard.test.jsx
// Purpose: Tests for EntrantDashboard component.
// Notes:
// - Uses renderWithRouter so Router context is consistent.
// - Mocks fetch responses to simulate backend API.

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../test-utils";
import EntrantDashboard from "../components/EntrantDashboard";

describe("EntrantDashboard", () => {
  test("renders Entrants heading", () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithRouter(<EntrantDashboard eventId={1} />);
    expect(screen.getByText(/entrants/i)).toBeInTheDocument();
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
    expect(await screen.findByText(/Spiderman/)).toBeInTheDocument();
    expect(await screen.findByText(/Batman/)).toBeInTheDocument();
  });

  test("shows empty state when no entrants exist", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithRouter(<EntrantDashboard eventId={1} />);
    expect(await screen.findByText(/no entrants/i)).toBeInTheDocument();
  });

  test("adds new entrant after form submission", async () => {
    // GET empty → POST → GET with new entrant
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 3,
          name: "Ironman",
          alias: "Tony",
          event_id: 1,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 3, name: "Ironman", alias: "Tony", event_id: 1 },
        ],
      });

    renderWithRouter(<EntrantDashboard eventId={1} />);

    await userEvent.type(screen.getByLabelText(/name/i), "Ironman");
    await userEvent.type(screen.getByLabelText(/alias/i), "Tony");
    await userEvent.click(screen.getByRole("button", { name: /add entrant/i }));

    expect(await screen.findByText(/Ironman/)).toBeInTheDocument();
  });
});
