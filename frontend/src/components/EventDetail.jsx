// File: frontend/src/components/EventDetail.jsx
// Purpose: Show details for a single event with entrants and matches.
// Notes:
// - Fetches single event by ID and handles not found errors.
// - Provides inline feedback instead of window.alert.
// - Handles entrant removal and status updates gracefully.

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL, deleteEntrant } from "../api";
import {
  Container,
  Typography,
  Paper,
  Button,
  Select,
  MenuItem,
  Box,
} from "@mui/material";

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchEvent() {
    try {
      const res = await fetch(`${API_BASE_URL}/events/${id}`);
      if (!res.ok) throw new Error("Event not found");
      const data = await res.json();
      setEvent(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvent();
  }, [id]);

  async function handleRemoveEntrant(entrantId) {
    try {
      await deleteEntrant(entrantId);
      setEvent({
        ...event,
        entrants: event.entrants.filter((e) => e.id !== entrantId),
      });
    } catch (err) {
      setError(`Failed to delete entrant ${entrantId}`);
    }
  }

  async function handleStatusChange(newStatus) {
    try {
      const res = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      setEvent(updated);
      setError(null);
    } catch (err) {
      setError("Failed to update status");
    }
  }

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error" role="alert">{error}</Typography>;

  if (!event) {
    return <Typography color="error" role="alert">Event not found</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {event.name}
      </Typography>
      <Typography>Date: {event.date}</Typography>
      <Typography>Status: {event.status}</Typography>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Entrants</Typography>
        {event.entrants?.length > 0 ? (
          event.entrants.map((entrant) => (
            <Paper key={entrant.id} sx={{ p: 2, mb: 1 }}>
              <Typography>{entrant.name}</Typography>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleRemoveEntrant(entrant.id)}
              >
                Remove
              </Button>
            </Paper>
          ))
        ) : (
          <Typography>No entrants yet</Typography>
        )}
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Update Status</Typography>
        <Select
          value={event.status}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <MenuItem value="drafting">Drafting</MenuItem>
          <MenuItem value="published">Published</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
        </Select>
      </Box>

      {error && (
        <Typography color="error" role="alert" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Container>
  );
}
