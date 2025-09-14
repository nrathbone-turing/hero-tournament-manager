// File: frontend/src/components/EntrantDashboard.jsx
// Purpose: Form for managing entrants for an event.
// Notes:
// - Does NOT render list; parent (EventDetail) owns entrants.
// - Calls onEntrantAdded after POST.

import { useState } from "react";
import { API_BASE_URL } from "../api";

export default function EntrantDashboard({ eventId, onEntrantAdded }) {
  const [formData, setFormData] = useState({ name: "", alias: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/entrants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, event_id: eventId }),
      });
      if (!response.ok) throw new Error("Failed to add entrant");
      setFormData({ name: "", alias: "" });
      if (typeof onEntrantAdded === "function") onEntrantAdded();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div data-testid="entrant-dashboard">
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
