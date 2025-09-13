// File: frontend/src/App.jsx
// Purpose: Root React component.
// Notes:
// - Provides top-level layout and navigation shell.

import React from "react"
import EventDashboard from "./components/EventDashboard"

function App() {
  return (
    <div>
      <h1>Hero Tournament Manager</h1>
      <p>Welcome! Manage events, entrants, and matches.</p>
      <EventDashboard />
    </div>
  )
}

export default App
