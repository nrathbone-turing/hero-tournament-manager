// File: frontend/src/components/EventDashboard.jsx
// Purpose: Displays a list of Events and allows creation of new Events.
// Notes:
// - Includes placeholder hero images on each side of the form.
// - Status dropdown fixed for proper label alignment.
// - Event list scrollable if >5 items, sized to show 5.
// - Displays entrant count in event details.

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Paper,
} from "@mui/material";
import { API_BASE_URL } from "../api";

function EventDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    status: "drafting",
  });

  async function fetchEvents() {
    try {
      const response = await fetch(`${API_BASE_URL}/events`);
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      console.error(err);
      setEvents([]);
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
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create event: ${errorText}`);
      }
      await fetchEvents();
      setFormData({ name: "", date: "", status: "drafting" });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom align="center">
        Events
      </Typography>

      {/* Hero images + form */}
      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <Paper
          data-testid="hero-image-placeholder"
          sx={{
            flex: 1,
            height: 200,
            bgcolor: "grey.200",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Hero Image Placeholder
        </Paper>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            flex: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            id="name"
            label="Event Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <TextField
            id="date"
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            required
          />

          <FormControl fullWidth>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              id="status"
              value={formData.status}
              label="Status"
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <MenuItem value="drafting">Drafting</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>

          <Button type="submit" variant="contained" color="primary">
            Create Event
          </Button>
        </Box>

        <Paper
          data-testid="hero-image-placeholder"
          sx={{
            flex: 1,
            height: 200,
            bgcolor: "grey.200",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Hero Image Placeholder
        </Paper>
      </Box>

      {/* Event List */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : events.length > 0 ? (
        <Paper
          data-testid="event-list"
          sx={{
            maxHeight: 300, // about 5 items tall
            overflowY: "auto",
          }}
        >
          <List>
            {events.map((e) => (
              <ListItem
                key={e.id}
                component={Link}
                to={`/events/${e.id}`}
                sx={{
                  textDecoration: "none",
                  color: "inherit",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <ListItemText
                  primary={e.name}
                  secondary={`${e.date} (${e.status}) — ${e.entrant_count || 0} entrants`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      ) : (
        <Typography align="center" color="text.secondary">
          No events available
        </Typography>
      )}
    </Container>
  );
}

export default EventDashboard;
