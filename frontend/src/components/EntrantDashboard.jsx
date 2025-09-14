// File: frontend/src/components/EntrantDashboard.jsx
// Purpose: Displays and manages Entrants for a specific Event.
// Notes:
// - Uses REACT_APP_API_URL env var for backend requests.

import { useEffect, useState } from "react";

export default function EntrantDashboard({ eventId, onEntrantAdded }) {
  const [entrants, setEntrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", alias: "" });

  const API_URL = process.env.REACT_APP_API_URL || "";

  async function fetchEntrants() {
    try {
      const response = await fetch(`${API_URL}/entrants?event_id=${eventId}`);
      if (!response.ok) throw new Error("Failed to fetch entrants");
      const data = await response.json();
      setEntrants(data);
    } catch (err) {
      console.error(err);
      setEntrants([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEntrants();
  }, [eventId]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/entrants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, event_id: eventId }),
      });
      if (!response.ok) throw new Error("Failed to add entrant");
      await fetchEntrants();
      setFormData({ name: "", alias: "" });
      if (typeof onEntrantAdded === "function") {
        onEntrantAdded();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div data-testid="entrant-dashboard">
      <h2>Entrants</h2>

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

      {loading ? (
        <p>Loading...</p>
      ) : entrants.length > 0 ? (
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
