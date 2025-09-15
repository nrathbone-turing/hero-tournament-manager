// File: frontend/src/__tests__/EventDetail.test.jsx
// Purpose: Tests for EventDetail component with Entrants + Matches.
// Notes:
// - EventDetail owns entrant list and re-fetches after EntrantDashboard submission.
// - Includes tests for adding/removing entrants, displaying matches, and updating status.

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EventDetail from "../components/EventDetail";
import { renderWithRouter } from "../test-utils";

describe("EventDetail", () => {
  test("renders event name and date", async () => {
    renderWithRouter(<EventDetail />, { route: "/events/1" });
    expect(await screen.findByText(/Hero Cup/)).toBeInTheDocument();
    expect(await screen.findByText(/2025-09-12/)).toBeInTheDocument();
  });

  test("renders entrants list", async () => {
    renderWithRouter(<EventDetail />, { route: "/events/1" });
    expect(await screen.findByText(/Spiderman/)).toBeInTheDocument();
    expect(await screen.findByText(/Batman/)).toBeInTheDocument();
  });

  test("adds and removes entrant updates list", async () => {
    renderWithRouter(<EventDetail />, { route: "/events/1" });

    await userEvent.type(await screen.findByLabelText(/name/i), "Ironman");
    await userEvent.type(screen.getByLabelText(/alias/i), "Tony");
    await userEvent.click(screen.getByRole("button", { name: /add entrant/i }));
    expect(await screen.findByText(/Ironman/)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/Entrant ID/i), "1");
    await userEvent.click(screen.getByRole("button", { name: /remove entrant/i }));
    await waitFor(() => {
      expect(screen.queryByText(/Spiderman/)).not.toBeInTheDocument();
    });
  });

  test("renders match winner by entrant name", async () => {
    renderWithRouter(<EventDetail />, { route: "/events/1" });
    expect(await screen.findByText("2-1")).toBeInTheDocument();
    expect(await screen.findByText(/Batman \(Dark Knight\)/)).toBeInTheDocument();
  });

  test("updates event status via dropdown", async () => {
    renderWithRouter(<EventDetail />, { route: "/events/1" });
    await userEvent.click(screen.getByLabelText(/status/i));
    await userEvent.click(screen.getByRole("option", { name: /published/i }));
    expect(await screen.findByDisplayValue(/published/i)).toBeInTheDocument();
  });
});