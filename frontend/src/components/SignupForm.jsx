// File: frontend/src/components/SignupForm.jsx
// Purpose: Signup form for new users with Material UI styling.
// Notes:
// - Redirects to / after successful signup.
// - Stores access_token via useAuth (which persists to localStorage).
// - If already authenticated, redirects to / immediately.

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
} from "@mui/material";

export default function SignupForm() {
  const { signup, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(username, email, password); // handled in AuthContext
      setMessage(`Signed up as ${username}`);
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      setMessage(err.message || "Signup failed");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Sign Up
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            id="username"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            fullWidth
          />
          <TextField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" fullWidth>
            Sign Up
          </Button>
          {message && (
            <Typography color="error" role="alert">
              {message}
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
