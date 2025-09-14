// File: frontend/src/components/MatchDashboard.jsx
// Purpose: Form for adding matches to an event.
// Notes:
// - No local list; EventDetail owns match list.
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

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch("/matches", {
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
        <label htmlFor="round">Round</label>
        <input
          id="round"
          value={formData.round}
          onChange={(e) => setFormData({ ...formData, round: e.target.value })}
        />

        <label htmlFor="entrant1_id">Entrant 1 ID</label>
        <input
          id="entrant1_id"
          value={formData.entrant1_id}
          onChange={(e) =>
            setFormData({ ...formData, entrant1_id: e.target.value })
          }
        />

        <label htmlFor="entrant2_id">Entrant 2 ID</label>
        <input
          id="entrant2_id"
          value={formData.entrant2_id}
          onChange={(e) =>
            setFormData({ ...formData, entrant2_id: e.target.value })
          }
        />

        <label htmlFor="scores">Scores</label>
        <input
          id="scores"
          value={formData.scores}
          onChange={(e) =>
            setFormData({ ...formData, scores: e.target.value })
          }
        />

        <label htmlFor="winner">Winner</label>
        <input
          id="winner"
          value={formData.winner}
          onChange={(e) =>
            setFormData({ ...formData, winner: e.target.value })
          }
        />

        <button type="submit">Add Match</button>
      </form>
    </div>
  );
}
