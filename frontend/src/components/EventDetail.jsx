// File: frontend/src/components/EventDetail.jsx
// Purpose: Displays details for a single Event, including entrants and matches.
// Notes:
// - EventDetail is the single source of truth for entrants & matches.

import { useEffect, useState } from "react";
import EntrantDashboard from "./EntrantDashboard";
import MatchDashboard from "./MatchDashboard";

export default function EventDetail({ eventId }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchEvent() {
    try {
      const response = await fetch(`/events/${eventId}`);
      if (!response.ok) throw new Error("Failed to fetch event");
      const data = await response.json();
      setEvent(data);
    } catch (err) {
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

      {/* Entrants */}
      <EntrantDashboard
        eventId={eventId}
        entrants={event.entrants || []}
        onAddEntrant={fetchEvent}
      />

      {/* Matches */}
      <h2>Matches</h2>
      <MatchDashboard eventId={eventId} onMatchAdded={fetchEvent} />
      {event.matches && event.matches.length > 0 ? (
        <ul>
          {event.matches.map((match) => (
            <li key={match.id}>
              Round {match.round}: {match.scores} — Winner:{" "}
              {match.winner || "TBD"}
            </li>
          ))}
        </ul>
      ) : (
        <p>No matches yet</p>
      )}
    </div>
  );
}
