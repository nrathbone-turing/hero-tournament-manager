// File: frontend/src/index.js
// Purpose: Entry point for React app.
// Notes:
// - Mounts the App component into the root DOM node.

import React from "react"
import { createRoot } from "react-dom/client"
import App from "./App"

const container = document.getElementById("root")
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
