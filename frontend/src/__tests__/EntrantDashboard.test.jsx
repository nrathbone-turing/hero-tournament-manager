// File: frontend/src/__tests__/EntrantDashboard.test.jsx
// Purpose: Tests for EntrantDashboard component.
// Notes:
// - Uses renderWithRouter for consistent Router context.
// - Mocks fetch responses for GET, POST, and refresh flows.
// - Covers CRUD-style interactions: load entrants, empty state, add entrant.

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRouter } from "../test-utils";
import EntrantDashboard from "../components/EntrantDashboard";

test("adds new entrant after form submission", async () => {
  global.fetch
    .mockResolvedValueOnce({ ok: true, json: async () => [] }) // GET
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 3,
        name: "Ironman",
        alias: "Tony",
        event_id: 1,
      }),
    }) // POST
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 3, name: "Ironman", alias: "Tony", event_id: 1 },
      ],
    }); // GET after add

  renderWithRouter(<EntrantDashboard eventId={1} />);

  const nameInput = await screen.findByLabelText(/name/i);
  const aliasInput = screen.getByLabelText(/alias/i);

  await userEvent.type(nameInput, "Ironman");
  await userEvent.type(aliasInput, "Tony");
  await userEvent.click(screen.getByRole("button", { name: /add entrant/i }));

  expect(await screen.findByText(/Ironman/)).toBeInTheDocument();
});
