// File: backend/server.js
// Purpose: Express server providing API endpoints for events, entrants, and matches.
// Notes:
// - Stores data in memory (arrays) for now.
// - Matches endpoints expected by frontend + tests.
// - Supports GET + POST for events, entrants, and matches.

import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// In-memory stores
let events = [];
let entrants = [];
let matches = [];

// Auto-increment IDs
let eventIdCounter = 1;
let entrantIdCounter = 1;
let matchIdCounter = 1;

// --- Routes ---

// Events
app.get("/events", (req, res) => {
  res.json(events);
});

app.post("/events", (req, res) => {
  const { name, date, status } = req.body;
  if (!name || !date || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const newEvent = {
    id: eventIdCounter++,
    name,
    date,
    status,
    entrants: [],
    matches: [],
  };
  events.push(newEvent);
  res.status(201).json(newEvent);
});

app.get("/events/:id", (req, res) => {
  const event = events.find((e) => e.id === parseInt(req.params.id));
  if (!event) return res.status(404).json({ error: "Event not found" });
  // Include entrants + matches for this event
  const eventWithDetails = {
    ...event,
    entrants: entrants.filter((ent) => ent.event_id === event.id),
    matches: matches.filter((m) => m.event_id === event.id),
  };
  res.json(eventWithDetails);
});

// Entrants
app.get("/entrants", (req, res) => {
  const { event_id } = req.query;
  if (!event_id) return res.json(entrants);
  res.json(entrants.filter((e) => e.event_id === parseInt(event_id)));
});

app.post("/entrants", (req, res) => {
  const { name, alias, event_id } = req.body;
  if (!name || !alias || !event_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const newEntrant = {
    id: entrantIdCounter++,
    name,
    alias,
    event_id: parseInt(event_id),
  };
  entrants.push(newEntrant);
  res.status(201).json(newEntrant);
});

// Matches
app.get("/matches", (req, res) => {
  const { event_id } = req.query;
  if (!event_id) return res.json(matches);
  res.json(matches.filter((m) => m.event_id === parseInt(event_id)));
});

app.post("/matches", (req, res) => {
  const { round, entrant1_id, entrant2_id, scores, winner, event_id } = req.body;
  if (!round || !entrant1_id || !entrant2_id || !scores || !winner || !event_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const newMatch = {
    id: matchIdCounter++,
    round,
    entrant1_id: parseInt(entrant1_id),
    entrant2_id: parseInt(entrant2_id),
    scores,
    winner,
    event_id: parseInt(event_id),
  };
  matches.push(newMatch);
  res.status(201).json(newMatch);
});

// Export for testing
export default app;

// Only start server if run directly (not during tests)
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
