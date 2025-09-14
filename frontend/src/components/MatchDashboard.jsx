// File: frontend/src/components/MatchDashboard.jsx
// Purpose: Form for managing matches for an event.
// Notes:
// - Posts winner_id (not winner string).
// - Calls onMatchAdded after POST.
// - Resets form after submit.

import { useState } from "react";
import { API_BASE_URL } from "../api";

export default function MatchDashboard({ eventId, onMatchAdded }) {
  const [formData, setFormData] = useState({
    round: "",
    entrant1_id: "",
    entrant2_id: "",
    scores: "",
    winner_id: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        round: parseInt(formData.round, 10),
        entrant1_id: parseInt(formData.entrant1_id, 10),
        entrant2_id: parseInt(formData.entrant2_id, 10),
        scores: formData.scores,
        winner_id: parseInt(formData.winner_id, 10),
        event_id: parseInt(eventId, 10),
      };

      const response = await fetch(`${API_BASE_URL}/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to add match");

      setFormData({
        round: "",
        entrant1_id: "",
        entrant2_id: "",
        scores: "",
        winner_id: "",
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
          <label htmlFor="winner_id">Winner ID</label>
          <input
            id="winner_id"
            value={formData.winner_id}
            onChange={(e) =>
              setFormData({ ...formData, winner_id: e.target.value })
            }
          />
        </div>
        <button type="submit">Add Match</button>
      </form>
    </div>
  );
}
