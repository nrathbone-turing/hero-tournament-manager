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
      <EventDashboard />
    </div>
  )
}

export default App
