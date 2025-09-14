// File: frontend/src/components/EventDetail.jsx
// Purpose: Three-column layout: forms (left), entrants list (middle), matches (right).
// Notes:
// - Forms remain tabbed in left column
// - Entrants list pulled into its own dedicated column
// - Matches expand to take up remaining width

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
      <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
        {event.name} — {event.date} ({event.status})
      </Typography>

      <Button
        component={Link}
        to="/"
        variant="outlined"
        sx={{ mb: 3 }}
      >
        Back to Events
      </Button>

      <Grid container spacing={2}>
        {/* Left column: Forms */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Tabs
                value={tab}
                onChange={(e, newValue) => setTab(newValue)}
                variant="fullWidth"
                sx={{ mb: 2 }}
              >
                <Tab label="Add Entrant" />
                <Tab label="Add Match" />
              </Tabs>

              {tab === 0 && (
                <Box>
                  <EntrantDashboard eventId={id} onEntrantAdded={fetchEvent} />
                </Box>
              )}
              {tab === 1 && (
                <Box>
                  <MatchDashboard eventId={id} onMatchAdded={fetchEvent} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Middle column: Entrants */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Entrants
              </Typography>
              {event.entrants?.length > 0 ? (
                <ul>
                  {event.entrants.map((entrant) => (
                    <li key={entrant.id}>
                      {entrant.id} — {entrant.name} ({entrant.alias})
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No entrants yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right column: Matches */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Matches
              </Typography>
              {event.matches?.length > 0 ? (
                <ul>
                  {event.matches.map((m) => {
                    const winner = event.entrants?.find(
                      (e) => e.id === m.winner_id
                    );
                    return (
                      <li key={m.id}>
                        Round {m.round}: {m.scores} — Winner:{" "}
                        {winner
                          ? `${winner.name} (${winner.alias})`
                          : "TBD"}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No matches yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
