// File: frontend/src/components/EntrantDashboard.jsx
// Purpose: Renders entrants form + list for a specific Event.
// Notes:
// - Stateless: entrants come from props.
// - Calls onAddEntrant after POST to notify parent (EventDetail).

import { useState } from "react";

export default function EntrantDashboard({ eventId, entrants = [], onAddEntrant }) {
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

      if (typeof onAddEntrant === "function") {
        onAddEntrant(); // tell EventDetail to re-fetch
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div data-testid="entrant-dashboard">
      <h2>Entrants</h2>

      {/* Add Entrant form */}
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

      {/* Entrant list */}
      {entrants.length > 0 ? (
        <ul>
          {entrants.map((e) => (
            <li key={e.id}>
              {e.name} ({e.alias})
            </li>
          ))}
        </ul>
      ) : (
        <p>No entrants</p>
      )}
    </div>
  );
}
