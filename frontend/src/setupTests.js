// File: frontend/src/setupTests.js
// Purpose: Global test setup for React Testing Library.
// Notes:
// - Runs before each test suite.
// - Mocks fetch and suppresses common React warnings.

import "@testing-library/jest-dom"

// Mock fetch globally (so tests don’t hit real backend)
beforeAll(() => {
  global.fetch = jest.fn()
})

// Reset mocks between tests
afterEach(() => {
  jest.clearAllMocks()
})
