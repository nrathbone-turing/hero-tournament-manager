// File: frontend/src/api.js
// Purpose: Centralize API base URL and inject JWT auth headers into fetch calls.
// Notes:
// - Wraps fetch calls with Authorization header if token exists.
// - Exports helper for DELETE entrant (others can reuse apiFetch).

export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5500";

// Get headers including Authorization if token exists
function getAuthHeaders() {
  const token = localStorage.getItem("token"); // matches AuthContext localStorage key
  return token
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    : { "Content-Type": "application/json" };
}

// Generic fetch wrapper
export async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  // If no body (204), return true
  if (res.status === 204) return true;

  return res.json();
}

// Delete entrant by ID
export async function deleteEntrant(entrantId) {
  return apiFetch(`/entrants/${entrantId}`, { method: "DELETE" });
}
