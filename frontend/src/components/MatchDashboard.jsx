// File: frontend/src/components/MatchDashboard.jsx
// Purpose: Form for managing matches for an event.
// Notes:
// - Does NOT render list; parent (EventDetail) owns matches.
// - Calls onMatchAdded after POST.

import { useState } from "react";

export default function MatchDashboard({ eventId, onMatchAdded }) {
  const [formData, setFormData] = useState({
    round: "",
    entrant1_id: "",
    entrant2_id: "",
    scores: "",
    winner: "",
  });

  const API_URL = process.env.REACT_APP_API_URL || "";

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, event_id: eventId }),
      });
      if (!response.ok) throw new Error("Failed to add match");
      setFormData({
        round: "",
        entrant1_id: "",
        entrant2_id: "",
        scores: "",
        winner: "",
      });
      if (typeof onMatchAdded === "function") onMatchAdded();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div data-testid="match-dashboard">
      <h3>Add Match</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="round">Round</label>
          <input
            id="round"
            value={formData.round}
            onChange={(e) => setFormData({ ...formData, round: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="entrant1_id">Entrant 1 ID</label>
          <input
            id="entrant1_id"
            value={formData.entrant1_id}
            onChange={(e) =>
              setFormData({ ...formData, entrant1_id: e.target.value })
            }
          />
        </div>
        <div>
          <label htmlFor="entrant2_id">Entrant 2 ID</label>
          <input
            id="entrant2_id"
            value={formData.entrant2_id}
            onChange={(e) =>
              setFormData({ ...formData, entrant2_id: e.target.value })
            }
          />
        </div>
        <div>
          <label htmlFor="scores">Scores</label>
          <input
            id="scores"
            value={formData.scores}
            onChange={(e) =>
              setFormData({ ...formData, scores: e.target.value })
            }
          />
        </div>
        <div>
          <label htmlFor="winner">Winner</label>
          <input
            id="winner"
            value={formData.winner}
            onChange={(e) =>
              setFormData({ ...formData, winner: e.target.value })
            }
          />
        </div>
        <button type="submit">Add Match</button>
      </form>
    </div>
  );
}
