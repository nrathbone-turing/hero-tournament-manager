// File: frontend/src/App.jsx
// Purpose: Root component for React app.
// Notes:
// - Sets up routing for dashboard and event detail.
// - Provides navigation link placeholders for now.

import { Routes, Route } from "react-router-dom";
import EventDashboard from "./components/EventDashboard";
import EventDetail from "./components/EventDetail";

function App() {
  return (
    <div>
      <h1>Hero Tournament Manager</h1>
      <Routes>
        <Route path="/" element={<EventDashboard />} />
        <Route path="/events/:id" element={<EventDetail />} />
      </Routes>
    </div>
  );
}

export default App;
