// File: frontend/src/__tests__/App.test.jsx
// Purpose: Routing tests for App component.
// Notes:
// - Uses renderWithRouter to simplify MemoryRouter wrapping.

import { screen } from "@testing-library/react";
import App from "../App";
import { renderWithRouter } from "../test-utils";

describe("App routing", () => {
  test("renders Hero Tournament Manager heading on home route", () => {
    renderWithRouter(<App />, { route: "/" });
    expect(screen.getByText(/Hero Tournament Manager/i)).toBeInTheDocument();
  });

  test("renders EventDashboard on home route", () => {
    renderWithRouter(<App />, { route: "/" });
    expect(screen.getByText(/events/i)).toBeInTheDocument();
  });

  test("renders EventDetail on event detail route", async () => {
    renderWithRouter(<App />, { route: "/events/1" });
    expect(await screen.findByText(/Event Detail/i)).toBeInTheDocument();
  });

  test.skip("navigates between Dashboard and EventDetail", () => {
    // Will implement once EventDashboard has <Link>
  });
});
