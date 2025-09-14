// File: frontend/src/App.jsx
// Purpose: Root component for React app.
// Notes:
// - Defines app routes only, without owning a Router.
// - Router provided by index.jsx (prod) or test-utils (tests).

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
        {/* Fallback to dashboard for any unknown route (stabilizes tests) */}
        <Route path="*" element={<EventDashboard />} />
      </Routes>
    </div>
  );
}

export default App;