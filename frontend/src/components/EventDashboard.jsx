// File: frontend/src/components/EventDashboard.jsx
// Purpose: Displays a list of Events and allows creation of new Events.
// Notes:
// - Fetches /events on mount.
// - Provides form to create new events.
// - Links to EventDetail for each event.

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function EventDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    status: "open",
  });

  async function fetchEvents() {
    try {
      const response = await fetch("/events");
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      console.error(err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch("/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to create event");
      await fetchEvents();
      setFormData({ name: "", date: "", status: "open" });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <h1>Events</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <button type="submit">Create Event</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : events.length > 0 ? (
        <ul>
          {events.map((e) => (
            <li key={e.id}>
              <Link to={`/events/${e.id}`}>{e.name}</Link> — {e.date} (
              {e.status})
            </li>
          ))}
        </ul>
      ) : (
        <p>No events available</p>
      )}
    </div>
  );
}

export default EventDashboard;
