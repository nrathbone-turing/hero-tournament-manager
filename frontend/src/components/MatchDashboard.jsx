// File: frontend/src/components/MatchDashboard.jsx
// Purpose: MUI-styled form for creating matches.
// Notes:
// - Uses API_BASE_URL env var for backend requests.
// - Calls onMatchAdded callback after successful POST.

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

export default function MatchDashboard({ eventId, onMatchAdded }) {
  const [formData, setFormData] = useState({
    round: "",
    entrant1_id: "",
    entrant2_id: "",
    scores: "",
    winner_id: "",
  });

  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, event_id: eventId }),
      });
      if (!response.ok) throw new Error("Failed to add match");

      setFormData({
        round: "",
        entrant1_id: "",
        entrant2_id: "",
        scores: "",
        winner_id: "",
      });
      setError(null); // clear errors on success
      if (typeof onMatchAdded === "function") onMatchAdded();
    } catch (err) {
      setError("Failed to add match");
    }
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Add Match
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Round"
            value={formData.round}
            onChange={(e) =>
              setFormData({ ...formData, round: e.target.value })
            }
            required
          />
          <TextField
            label="Entrant 1 ID"
            value={formData.entrant1_id}
            onChange={(e) =>
              setFormData({ ...formData, entrant1_id: e.target.value })
            }
            required
          />
          <TextField
            label="Entrant 2 ID"
            value={formData.entrant2_id}
            onChange={(e) =>
              setFormData({ ...formData, entrant2_id: e.target.value })
            }
            required
          />
          <TextField
            label="Scores"
            value={formData.scores}
            onChange={(e) =>
              setFormData({ ...formData, scores: e.target.value })
            }
            required
          />
          <TextField
            label="Winner ID"
            value={formData.winner_id}
            onChange={(e) =>
              setFormData({ ...formData, winner_id: e.target.value })
            }
          />
          <Button type="submit" variant="contained" color="secondary">
            Add Match
          </Button>
        </Box>

        {/*show error feedback */}
        {error && (
          <Typography color="error" role="alert" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
