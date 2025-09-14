// File: frontend/src/components/EventDetail.jsx
// Purpose: Displays details for a single Event, including entrants and matches.
// Notes:
// - Uses REACT_APP_API_URL env var for backend requests.
// - Integrates EntrantDashboard + MatchDashboard for CRUD operations.
// - Updated layout with MUI Grid and min widths for better fit.

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL } from "../api";
import EntrantDashboard from "./EntrantDashboard";
import MatchDashboard from "./MatchDashboard";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
} from "@mui/material";

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        sx={{ mb: 3 }}
      >
        Back to Events
      </Button>

      <Grid container spacing={3}>
        {/* Left column: Entrant + Match forms */}
        <Grid
          item
          xs={12}
          sm={4}
          md={3}
          sx={{ minWidth: 250, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add Entrant
              </Typography>
              <EntrantDashboard eventId={id} onEntrantAdded={fetchEvent} />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add Match
              </Typography>
              <MatchDashboard eventId={id} onMatchAdded={fetchEvent} />
            </CardContent>
          </Card>
        </Grid>

        {/* Middle column: Entrants */}
        <Grid item xs={12} sm={4} md={3} sx={{ minWidth: 200 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Entrants
              </Typography>
              {event.entrants?.length > 0 ? (
                <List dense>
                  {event.entrants.map((entrant) => (
                    <ListItem key={entrant.id}>
                      {entrant.id} — {entrant.name} ({entrant.alias})
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2">No entrants yet</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right column: Matches */}
        <Grid item xs={12} sm={8} md={6} sx={{ minWidth: 400 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Matches
              </Typography>
              {event.matches?.length > 0 ? (
                <List dense>
                  {event.matches.map((m) => {
                    const winner = event.entrants?.find(
                      (e) => e.id === m.winner_id
                    );
                    return (
                      <ListItem key={m.id}>
                        Round {m.round}: {m.scores} — Winner:{" "}
                        {winner
                          ? `${winner.name} (${winner.alias})`
                          : "TBD"}
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Typography variant="body2">No matches yet</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
