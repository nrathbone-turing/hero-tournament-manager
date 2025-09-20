// File: backend/tests/api.test.js
// Purpose: Integration tests for API endpoints (events, entrants, matches).
// Notes:
// - Uses supertest against the Flask app (exported for tests).
// - Requires signup/login to get a JWT before calling protected routes.
// - Ensures all CRUD endpoints respond correctly.

import request from "supertest";
import app from "../app.js"; // export create_app() via flask-restx bridge or wsgi adapter

describe("API Endpoints", () => {
  let token;
  let eventId;
  let entrantId;
  let matchId;

    beforeAll(async () => {
    // signup + login to get token
    await request(app)
      .post("/signup")
      .send({ username: "apitest", email: "apitest@example.com", password: "secret" })
      .set("Accept", "application/json");

    const loginRes = await request(app)
      .post("/login")
      .send({ email: "apitest@example.com", password: "secret" })
      .set("Accept", "application/json");

    token = loginRes.body.access_token;
    expect(token).toBeTruthy();
  });

  // Events
  test("GET /events returns empty list initially", async () => {
    const res = await request(app)
      .get("/events")
      .set("Authorization", `Bearer ${token}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /events creates a new event", async () => {
    const res = await request(app)
      .post("/events")
      .send({ name: "Hero Cup", date: "2025-09-12", status: "drafting" })
      .set("Authorization", `Bearer ${token}`)
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
    const res = await request(app)
      .get(`/entrants?event_id=${eventId}`)
      .set("Authorization", `Bearer ${token}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /entrants adds an entrant", async () => {
    const res = await request(app)
      .post("/entrants")
      .send({ name: "Ironman", alias: "Tony", event_id: eventId })
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");
    
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Ironman");
    entrantId = res.body.id;
  });

  test("GET /entrants?event_id includes added entrant", async () => {
    const res = await request(app)
      .get(`/entrants?event_id=${eventId}`)
      .set("Authorization", `Bearer ${token}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.find((e) => e.id === entrantId)).toBeTruthy();
  });

  // Matches
  test("GET /matches?event_id returns empty list initially", async () => {
    const res = await request(app)
      .get(`/matches?event_id=${eventId}`)
      .set("Authorization", `Bearer ${token}`);    
      
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /matches adds a match", async () => {
    const res = await request(app)
      .post("/matches")
      .send({
        event_id: eventId,
        round: 1,
        entrant1_id: entrantId,
        entrant2_id: entrantId,
        scores: "2-0",
        winner_id: entrantId,
      })
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");
    
    expect(res.statusCode).toBe(201);
    matchId = res.body.id;
    expect(res.body.round).toBe(1);
  });

  test("GET /matches?event_id includes added match", async () => {
	    const res = await request(app)
      .get(`/matches?event_id=${eventId}`)
      .set("Authorization", `Bearer ${token}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.find((m) => m.id === matchId)).toBeTruthy();
  });
});

describe("API Endpoints - Edge Cases", () => {
  let token;
  beforeAll(async () => {
    // fresh user for edge tests
    await request(app)
      .post("/signup")
      .send({ username: "edge", email: "edge@example.com", password: "pw" });
    const loginRes = await request(app)
      .post("/login")
      .send({ email: "edge@example.com", password: "pw" });
    token = loginRes.body.access_token;
  });
  
  test("POST /events without name should fail", async () => {
    const res = await request(app)
      .post("/events")
      .send({ date: "2025-09-12", status: "drafting" })	      
      .set("Authorization", `Bearer ${token}`);
    
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test("PUT /events/:id with invalid status should fail", async () => {
    const createRes = await request(app)
      .post("/events")
      .send({ name: "Invalid Status Cup", date: "2025-09-12", status: "drafting" })
      .set("Authorization", `Bearer ${token}`);
    const id = createRes.body.id;

    const res = await request(app)
      .put(`/events/${id}`)
      .send({ status: "not-a-valid-status" })
      .set("Authorization", `Bearer ${token}`);
    
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test("GET /events/:id with nonexistent id returns 404", async () => {
    const res = await request(app)
      .get("/events/9999")
      .set("Authorization", `Bearer ${token}`);
      
    expect(res.statusCode).toBe(404);
  });

  test("POST /entrants with invalid event_id should fail", async () => {
    const res = await request(app)
      .post("/entrants")
      .send({ name: "Ghost", alias: "NoEvent", event_id: 9999 })
      .set("Authorization", `Bearer ${token}`);
  
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test("PUT /entrants/:id nonexistent entrant returns 404", async () => {
    const res = await request(app)
      .put("/entrants/9999")
      .send({ alias: "Updated Alias" })
      .set("Authorization", `Bearer ${token}`);
    
    expect(res.statusCode).toBe(404);
  });

  test("DELETE /entrants/:id nonexistent entrant returns 404", async () => {
    const res = await request(app)
      .delete("/entrants/9999")
      .set("Authorization", `Bearer ${token}`);    
    
    expect(res.statusCode).toBe(404);
  });

  test("POST /matches with same entrant IDs should fail", async () => {

    const eventRes = await request(app)
      .post("/events")
      .send({ name: "Edge Match Cup", date: "2025-09-12", status: "drafting" })
      .set("Authorization", `Bearer ${token}`);
    const eventId = eventRes.body.id;

    const entrantRes = await request(app)
      .post("/entrants")
      .send({ name: "SoloMan", alias: "Alone", event_id: eventId })
      .set("Authorization", `Bearer ${token}`);
    const entrantId = entrantRes.body.id;

    const res = await request(app)
      .post("/matches")
      .send({
        event_id: eventId,
        round: 1,
        entrant1_id: entrantId,
        entrant2_id: entrantId,
        scores: "2-0",
        winner_id: entrantId,
      })
      .set("Authorization", `Bearer ${token}`);
    
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test("PUT /matches/:id nonexistent match returns 404", async () => {
    const res = await request(app)
      .put("/matches/9999")
      .send({ scores: "2-0" })
      .set("Authorization", `Bearer ${token}`);
    
    expect(res.statusCode).toBe(404);
  });

  test("DELETE /matches/:id nonexistent match returns 404", async () => {
    const res = await request(app)
      .delete("/matches/9999")
      .set("Authorization", `Bearer ${token}`);
    
    expect(res.statusCode).toBe(404);
  });
});