// File: frontend/src/components/EntrantDashboard.jsx
// Purpose: MUI-styled form for adding entrants to an event.
// Notes:
// - Prevents duplicate submissions.
// - Inline error feedback with role="alert".
// - Clears errors after success.

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/entrants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, event_id: eventId }),
      });
      if (!res.ok) throw new Error("Failed to add entrant");

      setFormData({ name: "", alias: "" });
      setError(null);
      if (typeof onEntrantAdded === "function") onEntrantAdded();
    } catch (err) {
      setError("Failed to add entrant");
    } finally {
      setSubmitting(false);
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
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting}
          >
            {submitting ? "Adding..." : "Add Entrant"}
          </Button>
        </Box>
        {error && (
          <Typography color="error" role="alert" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
