// File: frontend/src/setupTests.js
// Purpose: Global test setup for React Testing Library.
// Notes:
// - Provides default jest.fn for fetch.
// - Includes helpers for success/failure responses.
// - Suppresses noisy logs by default, with DEBUG_LOGS / VERBOSE_API_LOGS toggles.

import "@testing-library/jest-dom";

process.env.REACT_APP_API_URL = "http://localhost:3001";

// Default fetch is always a jest.fn, configured in tests
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

// Helpers available globally for tests
export const mockEventsList = [
  { id: 1, name: "Hero Cup", date: "2025-09-12", status: "open" },
  { id: 2, name: "Villain Showdown", date: "2025-09-13", status: "closed" },
];

export function mockFetchSuccess(data = mockEventsList) {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => data,
  });
}

export function mockFetchFailure(error = { error: "API Error" }) {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    status: 500,
    statusText: "Internal Server Error",
    json: async () => error,
  });
}

// --- Log suppression with toggles ---
if (process.env.NODE_ENV === "test") {
  const showAll = process.env.DEBUG_LOGS === "true";
  const showApi = process.env.VERBOSE_API_LOGS === "true";

  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  beforeAll(() => {
    console.log = (...args) => {
      if (showAll) return originalLog(...args);
      if (showApi && /🔎 apiFetch:/.test(args[0])) return originalLog(...args);
      if (/🔎/.test(args[0])) return; // suppress other debug
      originalLog(...args);
    };

    console.error = (...args) => {
      if (showAll) return originalError(...args);
      if (/❌/.test(args[0])) return; // suppress apiFetch error logs
      if (/not wrapped in act/.test(args[0])) return;
      if (/MUI: The prop `xs` of `Grid` is deprecated/.test(args[0])) return;
      originalError(...args);
    };

    console.warn = (...args) => {
      if (showAll) return originalWarn(...args);
      if (/⚠️/.test(args[0])) return; // suppress invalid winner_id etc.
      if (/React Router Future Flag Warning/.test(args[0])) return;
      originalWarn(...args);
    };
  });

  afterAll(() => {
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
  });
}
