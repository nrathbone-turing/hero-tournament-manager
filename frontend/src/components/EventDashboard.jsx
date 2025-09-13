// File: frontend/src/components/EventDashboard.jsx
// Purpose: Displays a list of Events fetched from the backend API.
// Notes:
// - Fetches /events on mount.
// - Shows heading, list of events, or empty state message.
// - Matches tests defined in EventDashboard.test.jsx.

import { useState, useEffect } from "react"

function EventDashboard() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("http://localhost:5500/events")
        if (!response.ok) throw new Error("Failed to fetch events")
        const data = await response.json()
        setEvents(data)
      } catch (err) {
        console.error(err)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  return (
    <div>
      <h1>Events</h1>
      {loading ? (
        <p>Loading...</p>
      ) : events.length > 0 ? (
        <ul>
          {events.map((ev) => (
            <li key={ev.id}>
              {ev.name} — {ev.date} ({ev.status})
            </li>
          ))}
        </ul>
      ) : (
        <p>No events available</p>
      )}
    </div>
  )
}

export default EventDashboard
