// File: frontend/src/components/EventDetail.jsx
// Purpose: Displays details for a single Event, including entrants and matches.
// Notes:
// - Fetches event data from backend using eventId.
// - Renders event info, entrants list, and matches list.
// - Handles loading and error states gracefully.

import { useEffect, useState } from "react";

export default function EventDetail({ eventId }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
    fetchEvent();
  }, [eventId]);

  if (loading) return <p>Loading event...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!event) return <p>No event found</p>;

  return (
    <div>
      <h1>Event Detail</h1>
      <p>
        {event.name} — {event.date} ({event.status})
      </p>
      <h2>Entrants</h2>
      {event.entrants && event.entrants.length > 0 ? (
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
      {event.matches && event.matches.length > 0 ? (
        <ul>
          {event.matches.map((match) => (
            <li key={match.id}>
              Round {match.round}: {match.scores} — Winner: {match.winner}
            </li>
          ))}
        </ul>
      ) : (
        <p>No matches yet</p>
      )}
    </div>
  );
}
