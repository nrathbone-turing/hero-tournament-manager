// File: frontend/src/components/EntrantDashboard.jsx
// Purpose: MUI-styled form for adding entrants to an event.
// Notes:
// - Uses API_BASE_URL env var for backend requests.
// - Calls onEntrantAdded callback after successful POST.

import { useState } from "react";
import { API_BASE_URL } from "../api";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";

export default function EntrantDashboard({ eventId, onEntrantAdded }) {
  const [formData, setFormData] = useState({ name: "", alias: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/entrants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, event_id: eventId }),
      });
      if (!response.ok) throw new Error("Failed to add entrant");

      setFormData({ name: "", alias: "" });
      if (typeof onEntrantAdded === "function") onEntrantAdded();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Add Entrant
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <TextField
            label="Alias"
            value={formData.alias}
            onChange={(e) =>
              setFormData({ ...formData, alias: e.target.value })
            }
            required
          />
          <Button type="submit" variant="contained" color="primary">
            Add Entrant
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
