// File: frontend/src/components/EventDetail.jsx
// Purpose: Detailed view of a single event with entrants, matches, and status controls.
// Notes:
// - Redirects to /404 or /500 with <Navigate /> for test-friendly handling.
// - Provides inline error feedback with role="alert".
// - Handles entrants, matches, and status updates.

import { useEffect, useState, useCallback } from "react";
import { useParams, Navigate, Link as RouterLink } from "react-router-dom";
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
  Grid,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
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

  const [tab, setTab] = useState(0);
  const [removeId, setRemoveId] = useState("");

  const fetchEvent = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  async function handleRemoveEntrant(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/entrants/${removeId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove entrant");
      setRemoveId("");
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
    <Container maxWidth={false} sx={{ mt: 4, px: 2 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} sx={{ mb: 3 }}>
        <Button component={RouterLink} to="/" variant="outlined">
          Back to Events
        </Button>
        <Typography variant="subtitle1" color="text.secondary">
          Event Details
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {event.name} — {event.date}
        </Typography>
        <FormControl size="small">
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            label="Status"
            value={event.status || ""}
            onChange={handleStatusChange}
          >
            <MenuItem value="drafting">Drafting</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* 3-column layout */}
      <Grid
        container
        spacing={2}
        sx={{ alignItems: "stretch", flexWrap: { xs: "wrap", md: "nowrap" } }}
      >
        {/* Left */}
        <Grid size={{ xs: 12, md: 3 }} sx={{ display: "flex" }}>
          <Paper
            sx={{
              flex: 1,
              p: 2,
              height: 575,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Tabs value={tab} onChange={(e, val) => setTab(val)} centered>
              <Tab label="Add Entrant" />
              <Tab label="Add Match" />
            </Tabs>
            <Box
              sx={{
                mt: 2,
                flex: 1,
                overflow: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {tab === 0 ? (
                <>
                  <EntrantDashboard eventId={id} onEntrantAdded={fetchEvent} />
                  <Box
                    component="form"
                    onSubmit={handleRemoveEntrant}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      mt: "auto",
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Remove Entrant
                    </Typography>
                    <TextField
                      label="Entrant ID"
                      type="number"
                      value={removeId}
                      onChange={(e) => setRemoveId(e.target.value)}
                      required
                      size="small"
                    />
                    <Button type="submit" variant="contained" color="error">
                      Remove Entrant
                    </Button>
                  </Box>
                </>
              ) : (
                <MatchDashboard eventId={id} onMatchAdded={fetchEvent} />
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Middle */}
        <Grid size={{ xs: 12, md: 3 }} sx={{ display: "flex" }}>
          <Paper
            sx={{
              flex: 1,
              p: 2,
              height: 575,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Entrants
            </Typography>
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                maxHeight: 500,
                "&::-webkit-scrollbar": {
                  width: "10px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#f1f1f1",
                  borderRadius: "10px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#888",
                  borderRadius: "10px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#555",
                },
              }}
              data-testid="entrants-scroll"
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Alias</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {event.entrants?.map((entrant) => (
                    <TableRow key={entrant.id}>
                      <TableCell>{entrant.id}</TableCell>
                      <TableCell>{entrant.name}</TableCell>
                      <TableCell>{entrant.alias}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Grid>

        {/* Right */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex" }}>
          <Paper
            sx={{
              flex: 1,
              p: 2,
              height: 575,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Matches
            </Typography>
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                maxHeight: 500,
                "&::-webkit-scrollbar": {
                  width: "10px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#f1f1f1",
                  borderRadius: "10px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#888",
                  borderRadius: "10px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#555",
                },
              }}
              data-testid="matches-scroll"
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Round</TableCell>
                    <TableCell>Entrant 1</TableCell>
                    <TableCell>Entrant 2</TableCell>
                    <TableCell>Scores</TableCell>
                    <TableCell>Winner</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {event.matches?.map((m) => {
                    const winner = event.entrants?.find(
                      (e) => e.id === m.winner_id,
                    );
                    return (
                      <TableRow key={m.id}>
                        <TableCell>{m.id}</TableCell>
                        <TableCell>{m.round}</TableCell>
                        <TableCell>{m.entrant1_id}</TableCell>
                        <TableCell>{m.entrant2_id}</TableCell>
                        <TableCell>{m.scores}</TableCell>
                        <TableCell>
                          {winner ? `${winner.name} (${winner.alias})` : "TBD"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
