// File: frontend/src/components/EventDetail.jsx
// Purpose: Displays details for a single Event, including entrants and matches.
// Notes:
// - Uses Material UI for styling/layout.
// - Entrants in left column, Matches in right column.
// - Resolves winner_id to entrant name/alias, falls back to TBD.

import { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  Divider,
} from "@mui/material";
import EntrantDashboard from "./EntrantDashboard";
import MatchDashboard from "./MatchDashboard";
import { API_BASE_URL } from "../api";

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

  if (loading) return <Typography>Loading event...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;
  if (!event) return <Typography>No event found</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        {event.name} — {event.date} ({event.status})
      </Typography>
      <Button
        variant="outlined"
        component={RouterLink}
        to="/"
        sx={{ mb: 3 }}
      >
        Back to Events
      </Button>

      <Grid container spacing={4}>
        {/* Entrants Column */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Entrants
              </Typography>
              <EntrantDashboard eventId={id} onEntrantAdded={fetchEvent} />
              <Divider sx={{ my: 2 }} />
              {event.entrants?.length > 0 ? (
                <List>
                  {event.entrants.map((entrant) => (
                    <ListItem key={entrant.id}>
                      {entrant.name} ({entrant.alias})
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No entrants yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Matches Column */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Matches
              </Typography>
              <MatchDashboard eventId={id} onMatchAdded={fetchEvent} />
              <Divider sx={{ my: 2 }} />
              {event.matches?.length > 0 ? (
                <List>
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
                <Typography variant="body2" color="text.secondary">
                  No matches yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
