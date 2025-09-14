// File: frontend/src/setupTests.js
// Purpose: Global test setup for React Testing Library.
// Notes:
// - Ensures consistent API base URL for tests.
// - Provides default global.fetch mock (override per test if needed).
// - Suppresses noisy React warnings (act, React Router).

import "@testing-library/jest-dom";

// Always provide API base URL for tests
process.env.REACT_APP_API_URL = "http://localhost:3001";

// Default fetch mock
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          { id: 1, name: "Hero Cup", date: "2025-09-12", status: "open" },
          {
            id: 2,
            name: "Villain Showdown",
            date: "2025-09-13",
            status: "closed",
          },
        ]),
    })
  );
});

// Reset mocks between tests
afterEach(() => {
  jest.clearAllMocks();
});

// Silence warnings
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (/not wrapped in act/.test(args[0])) return;
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
