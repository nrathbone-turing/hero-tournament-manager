// File: frontend/src/components/EventDashboard.jsx
// Purpose: Displays a list of Events and allows creation of new Events.
// Notes:
// - Styled with MUI components for consistency with the rest of the app.
// - Uses REACT_APP_API_URL env var for backend requests.

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
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom align="center">
        Events
      </Typography>

      {/* Create Event Form */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}
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

        <FormControl>
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            id="status"
            value={formData.status}
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

      {/* Event List */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : events.length > 0 ? (
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
              <ListItemText primary={e.name} secondary={`${e.date} (${e.status})`} />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography align="center" color="text.secondary">
          No events available
        </Typography>
      )}
    </Container>
  );
}

export default EventDashboard;
