// File: frontend/src/api.js
// Purpose: Centralize API base URL for fetch calls.

export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

export async function deleteEntrant(eventId, entrantId) {
  const res = await fetch(`${API_BASE_URL}/events/${eventId}/entrants/${entrantId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete entrant");
  return true;
}
