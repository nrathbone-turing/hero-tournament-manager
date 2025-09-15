// File: frontend/src/setupTests.js
// Purpose: Global test setup for React Testing Library.
// Notes:
// - Ensures consistent API base URL for tests.
// - Provides default global.fetch mock (override per test if needed).
// - Suppresses noisy React warnings (act, React Router, MUI Grid deprecations).

import "@testing-library/jest-dom";

// Always provide API base URL for tests
process.env.REACT_APP_API_URL = "http://localhost:3001";

// Default fetch mock
beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.endsWith("/events")) {
      return Promise.resolve({
        ok: true,
        json: async () => [
          {
            id: 1,
            name: "Hero Cup",
            date: "2025-09-12",
            status: "drafting",
            entrant_count: 2,
          },
          {
            id: 2,
            name: "Villain Showdown",
            date: "2025-09-13",
            status: "published",
            entrant_count: 3,
          },
        ],
      });
    }

    if (url.includes("/events/1")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          id: 1,
          name: "Hero Cup",
          date: "2025-09-12",
          status: "drafting",
          entrants: [
            { id: 1, name: "Spiderman", alias: "Webslinger" },
            { id: 2, name: "Batman", alias: "Dark Knight" },
          ],
          matches: [],
        }),
      });
    }

    return Promise.resolve({
      ok: true,
      json: async () => ({}), // fallback
    });
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

// Silence warnings
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
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