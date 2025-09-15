// File: frontend/src/api.js
// Purpose: Centralize API base URL for fetch calls.

export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5500"; // corrected port if backend runs here

// Delete entrant by their ID only
export async function deleteEntrant(entrantId) {
  const res = await fetch(`${API_BASE_URL}/entrants/${entrantId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete entrant ${entrantId}`);
  return true;
}
