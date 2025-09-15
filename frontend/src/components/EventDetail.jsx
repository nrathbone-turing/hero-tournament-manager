// File: frontend/src/components/EventDetail.jsx
// Purpose: Displays details for a single Event, including entrants and matches.
// Notes:
// - Uses Material UI for responsive layout and styling.
// - Entrants and Matches shown as sortable tables.
// - Dashboard tabs (Entrant + Match) aligned left, Entrants table center, Matches table right.
// - Grid split: 3 sections (1/4, 1/4, 2/4).

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import EntrantDashboard from "./EntrantDashboard";
import MatchDashboard from "./MatchDashboard";
import { API_BASE_URL, deleteEntrant } from "../api";

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(0);
  const [removeId, setRemoveId] = useState("");

  async function fetchEvent() {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`);
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
  }, [id]);

  if (loading) return <p>Loading event...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!event) return <p>No event found</p>;

  async function handleRemoveEntrant(e) {
    e.preventDefault();
    try {
      await deleteEntrant(id, Number(removeId)); // ensure numeric
      setRemoveId("");
      fetchEvent();
    } catch (err) {
      console.error(err);
      alert("Failed to remove entrant");
    }
  }

  async function handleStatusChange(e) {
    const newStatus = e.target.value;
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      await response.json();
      fetchEvent(); // refresh
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  }

  return (
    <Container maxWidth={false} sx={{ mt: 4, px: 2 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} sx={{ mb: 3 }}>
        <Button component={Link} to="/" variant="outlined">
          Back to Events
        </Button>
        <Typography variant="h4" component="h1">
          Event Detail
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
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
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
          <Paper sx={{ flex: 1, p: 2, height: 575, display: "flex", flexDirection: "column" }}>
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
                    sx={{ display: "flex", flexDirection: "column", gap: 2, mt: "auto" }}
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
          <Paper sx={{ flex: 1, p: 2, height: 575, display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" gutterBottom>
              Entrants
            </Typography>
            <Box sx={{ flex: 1, overflow: "auto" }}>
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
          <Paper sx={{ flex: 1, p: 2, height: 575, display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" gutterBottom>
              Matches
            </Typography>
            <Box sx={{ flex: 1, overflow: "auto" }}>
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
                    const winner = event.entrants?.find((e) => e.id === m.winner_id);
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
