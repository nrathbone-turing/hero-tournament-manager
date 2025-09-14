// File: frontend/src/components/EventDetail.jsx
// Purpose: Displays details for a single Event, including entrants and matches.
// Notes:
// - Uses Material UI Grid layout for responsive 3-column design.
// - Entrant + Match dashboards grouped in tabs (left).
// - Entrants list fixed-width, scrollable (middle).
// - Matches displayed in a full-width table (right).

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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

  return (
    <div data-testid="event-detail">
      <Typography variant="h4" gutterBottom>
        {event.name} — {event.date} ({event.status})
      </Typography>

      <Button
        component={Link}
        to="/"
        variant="outlined"
        color="primary"
        sx={{ mb: 3 }}
      >
        Back to Events
      </Button>

      <Grid container spacing={2}>
        {/* LEFT: Entrant + Match Dashboards */}
        <Grid item xs={12} md={3}>
          <Card>
            <Tabs
              value={tab}
              onChange={(_, newVal) => setTab(newVal)}
              variant="fullWidth"
            >
              <Tab label="Add Entrant" />
              <Tab label="Add Match" />
            </Tabs>
            <CardContent>
              {tab === 0 && (
                <EntrantDashboard eventId={id} onEntrantAdded={fetchEvent} />
              )}
              {tab === 1 && (
                <MatchDashboard eventId={id} onMatchAdded={fetchEvent} />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* MIDDLE: Entrants List */}
        <Grid
          item
          xs={12}
          md={3}
          sx={{ minWidth: 220, flex: "0 0 220px" }}
        >
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6">Entrants</Typography>
              <Box
                sx={{
                  maxHeight: 400,
                  overflowY: "auto",
                  pr: 1,
                  mt: 1,
                }}
              >
                <ul style={{ paddingLeft: "1rem", margin: 0 }}>
                  {event.entrants?.map((e) => (
                    <li key={e.id}>
                      {e.id} — {e.name} ({e.alias})
                    </li>
                  ))}
                </ul>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT: Matches Table */}
        <Grid item xs={12} md>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Matches
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
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
                      (e) => e.id === m.winner_id
                    );
                    return (
                      <TableRow key={m.id}>
                        <TableCell>{m.round}</TableCell>
                        <TableCell>{m.entrant1_id}</TableCell>
                        <TableCell>{m.entrant2_id}</TableCell>
                        <TableCell>{m.scores}</TableCell>
                        <TableCell>
                          {winner
                            ? `${winner.name} (${winner.alias})`
                            : "TBD"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
