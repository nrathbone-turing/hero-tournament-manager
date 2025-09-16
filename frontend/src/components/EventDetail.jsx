// File: frontend/src/components/EventDetail.jsx
// Purpose: Detailed view of a single event with entrants, matches, and status controls.
// Notes:
// - Redirects to /404 or /500 with <Navigate /> for test-friendly handling.
// - Provides inline error feedback with role="alert".
// - Handles entrants, matches, and status updates.

import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
} from "@mui/material";
import EntrantDashboard from "./EntrantDashboard";
import MatchDashboard from "./MatchDashboard";
import { API_BASE_URL } from "../api";

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirect500, setRedirect500] = useState(false);
  const [redirect404, setRedirect404] = useState(false);

  async function fetchEvent() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/events/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          setRedirect404(true);
          return;
        }
        if (res.status >= 500) {
          setRedirect500(true);
          return;
        }
        throw new Error("Failed to load event data");
      }
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
      const res = await fetch(`${API_BASE_URL}/entrants/${entrantId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove entrant");
      fetchEvent();
    } catch {
      setError("Failed to remove entrant");
    }
  }

  async function handleStatusChange(newStatus) {
    if (!event) return;
    const prevStatus = event.status;
    try {
      const res = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...event, status: newStatus }),
      });
      if (!res.ok) {
        if (res.status === 404) {
          setRedirect404(true);
          return;
        }
        if (res.status >= 500) {
          setRedirect500(true);
          return;
        }
        throw new Error("Failed to update status");
      }
      await fetchEvent();
    } catch {
      setError("Failed to update status");
      setEvent({ ...event, status: prevStatus });
    }
  }

  if (redirect404) return <Navigate to="/404" replace />;
  if (redirect500) return <Navigate to="/500" replace />;

  if (loading) {
    return (
      <Container>
        <Typography variant="h6">Loading event...</Typography>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography variant="h6">Error</Typography>
        <Typography role="alert">{error}</Typography>
      </Container>
    );
  }

  if (!event) return <Navigate to="/404" replace />;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        {event.name}
      </Typography>
      <Typography>Date: {event.date}</Typography>
      <Typography>Status: {event.status}</Typography>

      {/* Entrants Section */}
      <Box mt={3}>
        <Typography variant="h6">Entrants</Typography>
        {event.entrants?.length > 0 ? (
          <Box
            data-testid="entrants-scroll"
            sx={{ maxHeight: 200, overflowY: "auto", mt: 2 }}
          >
            {event.entrants.map((entrant) => (
              <Paper key={entrant.id} sx={{ p: 1, mb: 1 }}>
                <Typography>
                  {entrant.name} ({entrant.alias})
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleRemoveEntrant(entrant.id)}
                >
                  Remove
                </Button>
              </Paper>
            ))}
          </Box>
        ) : (
          <Typography>No entrants yet</Typography>
        )}
        <EntrantDashboard eventId={id} onEntrantAdded={fetchEvent} />
      </Box>

      {/* Matches Section */}
      <Box mt={3}>
        <Typography variant="h6">Matches</Typography>
        {event.matches?.length > 0 ? (
          <Box
            data-testid="matches-scroll"
            sx={{ maxHeight: 200, overflowY: "auto", mt: 2 }}
          >
            {event.matches.map((m) => {
              const winner = event.entrants?.find((e) => e.id === m.winner_id);
              return (
                <Paper key={m.id} sx={{ p: 1, mb: 1 }}>
                  <Typography>Round {m.round}</Typography>
                  <Typography>{m.scores}</Typography>
                  <Typography>
                    Winner:{" "}
                    {m.winner_id
                      ? `${winner?.name} (${winner?.alias})`
                      : "TBD"}
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        ) : (
          <Typography>No matches yet</Typography>
        )}
        <MatchDashboard eventId={id} onMatchAdded={fetchEvent} />
      </Box>

      {/* Update Status */}
      <Box mt={3}>
        <Typography variant="h6">Update Status</Typography>
        <FormControl fullWidth>
          <InputLabel id="event-status-label">Status</InputLabel>
          <Select
            labelId="event-status-label"
            value={event?.status ?? ""}
            label="Status"
            onChange={(e) => handleStatusChange(e.target.value)}
            role="combobox"
          >
            <MenuItem value="drafting">Drafting</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
            <MenuItem value="published">Published</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Container>
  );
}
