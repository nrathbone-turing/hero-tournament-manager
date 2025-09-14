// File: frontend/src/components/EventDetail.jsx
// Purpose: Displays details for a single Event, including entrants and matches.
// Notes:
// - Uses REACT_APP_API_URL env var for backend requests.
// - Integrates EntrantDashboard + MatchDashboard for CRUD operations.

import { useEffect, useState } from "react";
import EntrantDashboard from "./EntrantDashboard";
import MatchDashboard from "./MatchDashboard";

export default function EventDetail({ eventId }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "";

  async function fetchEvent() {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
      if (!response.ok) throw new Error("Failed to fetch event");
      const data = await response.json();
      setEvent(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  if (loading) return <p>Loading event...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!event) return <p>No event found</p>;

  return (
    <div data-testid="event-detail">
      <h1>Event Detail</h1>
      <p>
        {event.name} — {event.date} ({event.status})
      </p>

      <p>
        <a href="/" role="link">Back to Events</a>
      </p>

      <h2>Entrants</h2>
      <EntrantDashboard eventId={eventId} onEntrantAdded={fetchEvent} />
      {event.entrants?.length > 0 ? (
        <ul>
          {event.entrants.map((entrant) => (
            <li key={entrant.id}>
              {entrant.name} ({entrant.alias})
            </li>
          ))}
        </ul>
      ) : (
        <p>No entrants yet</p>
      )}

      <h2>Matches</h2>
      <MatchDashboard eventId={eventId} onMatchAdded={fetchEvent} />
      {event.matches?.length > 0 ? (
        <ul>
          {event.matches.map((m) => (
            <li key={m.id}>
              Round {m.round}: {m.scores} — Winner: {m.winner || "TBD"}
            </li>
          ))}
        </ul>
      ) : (
        <p>No matches yet</p>
      )}
    </div>
  );
}
