// File: frontend/src/components/SignupForm.jsx
// Purpose: Signup form for new users.
// Notes:
// - Controlled inputs for username, email, and password.
// - Submits to AuthContext.signup.
// - On success, displays username confirmation.

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function SignupForm() {
  const { signup } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await signup(username, email, password);
      setMessage(`Signed up as ${user.username}`);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit">Sign Up</button>
      {message && <p>{message}</p>}
    </form>
  );
}
