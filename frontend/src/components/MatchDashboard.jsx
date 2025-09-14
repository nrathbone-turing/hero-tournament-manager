// File: frontend/src/components/MatchDashboard.jsx
// Purpose: Displays and manages Matches for a specific Event.
// Notes:
// - Fetches matches for a given eventId.
// - Provides form to add matches.
// - Re-fetches matches after creation.

import { useEffect, useState } from "react";

export default function MatchDashboard({ eventId }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    round: "",
    entrant1_id: "",
    entrant2_id: "",
    scores: "",
    winner: "",
  });

  async function fetchMatches() {
    try {
      const response = await fetch(`/matches?event_id=${eventId}`);
      if (!response.ok) throw new Error("Failed to fetch matches");
      const data = await response.json();
      setMatches(data);
    } catch (err) {
      console.error(err);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMatches();
  }, [eventId]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch("/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, event_id: eventId }),
      });
      if (!response.ok) throw new Error("Failed to add match");
      await fetchMatches();
      setFormData({
        round: "",
        entrant1_id: "",
        entrant2_id: "",
        scores: "",
        winner: "",
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <h2>Matches</h2>

      {/* Add Match form */}
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

      {/* Match list */}
      {loading ? (
        <p>Loading...</p>
      ) : matches.length > 0 ? (
        <ul>
          {matches.map((m) => (
            <li key={m.id}>
              Round {m.round}: {m.scores} — Winner: {m.winner || "TBD"}
            </li>
          ))}
        </ul>
      ) : (
        <p>No matches</p>
      )}
    </div>
  );
}
