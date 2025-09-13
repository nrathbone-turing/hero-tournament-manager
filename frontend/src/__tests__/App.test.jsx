// File: frontend/src/__tests__/App.test.jsx
// Purpose: Smoke test for App component.
// Notes:
// - Verifies the App renders without crashing.

import { render, screen } from "@testing-library/react"
import App from "../App"

test("renders Hero Tournament Manager heading", () => {
  render(<App />)
  expect(screen.getByText(/Hero Tournament Manager/i)).toBeInTheDocument()
})
