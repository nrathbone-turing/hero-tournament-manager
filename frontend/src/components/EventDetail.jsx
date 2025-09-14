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
  TableSortLabel,
  Button,
} from "@mui/material";
import EntrantDashboard from "./EntrantDashboard";
import MatchDashboard from "./MatchDashboard";
import { API_BASE_URL } from "../api";

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(0);

  // sort states
  const [entrantOrder, setEntrantOrder] = useState({ orderBy: "id", direction: "asc" });
  const [matchOrder, setMatchOrder] = useState({ orderBy: "round", direction: "asc" });

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

  // helper sort
  function handleSort(orderState, setOrderState, column) {
    const isAsc = orderState.orderBy === column && orderState.direction === "asc";
    setOrderState({ orderBy: column, direction: isAsc ? "desc" : "asc" });
  }

  function sortData(data, orderState) {
    return [...data].sort((a, b) => {
      const { orderBy, direction } = orderState;
      if (a[orderBy] < b[orderBy]) return direction === "asc" ? -1 : 1;
      if (a[orderBy] > b[orderBy]) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  const sortedEntrants = event.entrants ? sortData(event.entrants, entrantOrder) : [];
  const sortedMatches = event.matches ? sortData(event.matches, matchOrder) : [];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, px: 2 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} sx={{ mb: 3 }}>
        <Button component={Link} to="/" variant="outlined">
          Back to Events
        </Button>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          {event.name} — {event.date} ({event.status})
        </Typography>
      </Box>

      {/* 3-column layout, single row, uniform height */}
      <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
        {/* Left: Dashboards (1/4 width) */}
        <Grid item xs={12} md={3} sx={{ display: "flex" }}>
          <Paper sx={{ flex: 1, p: 2, height: 575, display: "flex", flexDirection: "column" }}>
            <Tabs value={tab} onChange={(e, val) => setTab(val)} centered>
              <Tab label="Add Entrant" />
              <Tab label="Add Match" />
            </Tabs>
            <Box sx={{ mt: 2, flex: 1, overflow: "auto" }}>
              {tab === 0 ? (
                <EntrantDashboard eventId={id} onEntrantAdded={fetchEvent} />
              ) : (
                <MatchDashboard eventId={id} onMatchAdded={fetchEvent} />
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Middle: Entrants Table (1/4 width, aligned height) */}
        <Grid item xs={12} md={3} sx={{ display: "flex" }}>
          <Paper sx={{ flex: 1, p: 2, height: 575, display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" gutterBottom>
              Entrants
            </Typography>
            <Box sx={{ flex: 1, overflow: "auto" }}>
              <Table size="small" sx={{ width: "100%" }}>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Alias</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedEntrants.map((entrant) => (
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

        {/* Right: Matches Table (wider, fills remaining space) */}
        <Grid item xs={12} md={6} sx={{ display: "flex" }}>
          <Paper sx={{ flex: 1, p: 2, height: 575, display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" gutterBottom>
              Matches
            </Typography>
            <Box sx={{ flex: 1, overflow: "auto" }}>
              <Table size="small" sx={{ width: "100%" }}>
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
                  {sortedMatches.map((m) => {
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