// File: backend/tests/api.test.js
// Purpose: Integration tests for API endpoints (events, entrants, matches).
// Notes:
// - Uses supertest to test Express app routes.
// - Data is stored in-memory for now (no DB).
// - Ensures all CRUD endpoints respond correctly.

import request from "supertest";
import app from "../server.js"; // adjust if your Express entry is named differently

describe("API Endpoints", () => {
  let eventId;
  let entrantId;
  let matchId;

  // Events
  test("GET /events returns empty list initially", async () => {
    const res = await request(app).get("/events");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test("POST /events creates a new event", async () => {
    const res = await request(app)
      .post("/events")
      .send({ name: "Hero Cup", date: "2025-09-12", status: "open" })
      .set("Accept", "application/json");
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Hero Cup");
    eventId = res.body.id;
  });

  test("GET /events/:id returns created event", async () => {
    const res = await request(app).get(`/events/${eventId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(eventId);
  });

  // Entrants
  test("GET /entrants?event_id returns empty list initially", async () => {
    const res = await request(app).get(`/entrants?event_id=${eventId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test("POST /entrants adds an entrant", async () => {
    const res = await request(app)
      .post("/entrants")
      .send({ name: "Ironman", alias: "Tony", event_id: eventId })
      .set("Accept", "application/json");
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Ironman");
    entrantId = res.body.id;
  });

  test("GET /entrants?event_id includes added entrant", async () => {
    const res = await request(app).get(`/entrants?event_id=${eventId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.find((e) => e.id === entrantId)).toBeTruthy();
  });

  // Matches
  test("GET /matches?event_id returns empty list initially", async () => {
    const res = await request(app).get(`/matches?event_id=${eventId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test("POST /matches adds a match", async () => {
    const res = await request(app)
      .post("/matches")
      .send({
        round: 1,
        entrant1_id: entrantId,
        entrant2_id: entrantId,
        scores: "2-0",
        winner: "Ironman",
        event_id: eventId,
      })
      .set("Accept", "application/json");
    expect(res.statusCode).toBe(201);
    expect(res.body.round).toBe(1);
    matchId = res.body.id;
  });

  test("GET /matches?event_id includes added match", async () => {
    const res = await request(app).get(`/matches?event_id=${eventId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.find((m) => m.id === matchId)).toBeTruthy();
  });
});
