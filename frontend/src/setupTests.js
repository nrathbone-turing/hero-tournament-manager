// File: frontend/src/setupTests.js
// Purpose: Global test setup for React Testing Library.
// Notes:
// - Provides default jest.fn for fetch.
// - Includes helpers for success/failure responses.
// - Suppresses noisy warnings.

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
    json: async () => data,
  });
}

export function mockFetchFailure(error = { error: "API Error" }) {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => error,
  });
}

// Silence act / router / MUI warnings
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (/apiFetch failed/.test(args[0])) return;
    if (/not wrapped in act/.test(args[0])) return;
    if (/MUI: The prop `xs` of `Grid` is deprecated/.test(args[0])) return;
    originalError.call(console, ...args);
  };
  console.warn = (...args) => {
    if (/React Router Future Flag Warning/.test(args[0])) return;
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
