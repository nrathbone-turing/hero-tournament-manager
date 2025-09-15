// File: frontend/src/components/EventDashboard.jsx
// Purpose: Manage list of events and allow event creation.
// Notes:
// - Fetches events from backend and shows entrant counts.
// - Distinguishes between fetch and create errors.
// - Provides inline error messages with role="alert".

import { useEffect, useState } from "react";
import { API_BASE_URL } from "../api";
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
} from "@mui/material";

export default function EventDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [createError, setCreateError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    status: "drafting",
  });

  async function fetchEvents() {
    try {
      const res = await fetch(`${API_BASE_URL}/events`);
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(data);
      setFetchError(null);
    } catch (err) {
      setFetchError("Failed to fetch events");
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
      const res = await fetch(`${API_BASE_URL}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create event");
      const newEvent = await res.json();
      setEvents([...events, newEvent]);
      setFormData({ name: "", date: "", status: "drafting" });
      setCreateError(null);
    } catch (err) {
      setCreateError("Failed to create event");
    }
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" align="center" gutterBottom>
        Events
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : fetchError ? (
        <Typography color="error" role="alert" align="center">
          {fetchError}
        </Typography>
      ) : events.length === 0 ? (
        <>
          <Paper
            data-testid="hero-image-placeholder"
            sx={{ p: 4, textAlign: "center" }}
          >
            Hero Image Placeholder
          </Paper>
          <Typography align="center">No events yet</Typography>
        </>
      ) : (
        <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
          {events.map((event) => (
            <Paper key={event.id} sx={{ p: 2, flex: 1 }}>
              <Typography variant="h6">{event.name}</Typography>
              <Typography variant="body2">{event.date}</Typography>
              <Typography variant="body2">Status: {event.status}</Typography>
              <Typography variant="body2">
                {event.entrants?.length || 0} entrants
              </Typography>
            </Paper>
          ))}
        </Box>
      )}

      <Box
        component="form"
        role="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          label="Event Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <TextField
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          select
          label="Status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          required
        >
          <MenuItem value="drafting">Drafting</MenuItem>
          <MenuItem value="published">Published</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
        </TextField>
        <Button type="submit" variant="contained" color="primary">
          Create Event
        </Button>
      </Box>

      {createError && (
        <Typography color="error" role="alert" sx={{ mt: 2 }}>
          {createError}
        </Typography>
      )}
    </Container>
  );
}
