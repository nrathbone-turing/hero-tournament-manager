// File: frontend/src/components/EntrantDashboard.jsx
// Purpose: Handles adding new entrants to an event.
// Notes:
// - Simplified: no longer manages its own entrant list.
// - After adding entrant, notifies parent via onEntrantAdded.

import { useState } from "react";

export default function EntrantDashboard({ eventId, onEntrantAdded }) {
  const [formData, setFormData] = useState({ name: "", alias: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch("/entrants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, event_id: eventId }),
      });
      if (!response.ok) throw new Error("Failed to add entrant");
      setFormData({ name: "", alias: "" });
      if (onEntrantAdded) onEntrantAdded();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div data-testid="event-dashboard">
      <h3>Add Entrant</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
        </div>
        <div>
          <label htmlFor="alias">Alias</label>
          <input
            id="alias"
            value={formData.alias}
            onChange={(e) =>
              setFormData({ ...formData, alias: e.target.value })
            }
          />
        </div>
        <button type="submit">Add Entrant</button>
      </form>
    </div>
  );
}
