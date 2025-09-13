// File: frontend/src/setupTests.js
// Purpose: Global test setup for React Testing Library.
// Notes:
// - Runs before each test.
// - Provides a default global.fetch mock that can be overridden per test.
// - Suppresses common React warnings by ensuring state updates happen inside act.

import "@testing-library/jest-dom";

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
    }),
  );
});

// Reset mocks between tests
afterEach(() => {
  jest.clearAllMocks();
});

// Silence act(...) warnings in tests (since we handle async with findBy/waitFor)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (/not wrapped in act/.test(args[0])) return;
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
