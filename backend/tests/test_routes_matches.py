# File: backend/tests/test_routes_matches.py
# Purpose: API route tests for Match resource (CRUD).
# Notes:
# - Uses Flask test client fixture (`client`) defined in conftest.py.
# - Matches must be linked to an Event and two Entrants.
# - Covers create, read, update, delete operations for Matches.
# - Runs against an in-memory SQLite database for isolation.

from backend.models import Event, Entrant, Match, db
from sqlalchemy import select


def seed_event_and_entrants():
    event = Event(name="Match Cup", date="2025-09-12", rules="Bo3", status="published")
    db.session.add(event)
    db.session.commit()

    entrant1 = Entrant(name="Hero A", alias="Alpha", event_id=event.id)
    entrant2 = Entrant(name="Hero B", alias="Beta", event_id=event.id)
    db.session.add_all([entrant1, entrant2])
    db.session.commit()
    return event, entrant1, entrant2


def test_create_match(client):
    event, e1, e2 = seed_event_and_entrants()
    response = client.post(
        "/matches",
        json={
            "event_id": event.id,
            "round": 1,
            "entrant1_id": e1.id,
            "entrant2_id": e2.id,
            "scores": "2-1",
            "winner_id": e1.id,
        },
    )
    assert response.status_code == 201
    assert response.get_json()["winner_id"] == e1.id


def test_get_matches(client):
    event, e1, e2 = seed_event_and_entrants()
    match = Match(
        event_id=event.id,
        round=1,
        entrant1_id=e1.id,
        entrant2_id=e2.id,
        scores="1-0",
        winner_id=e1.id,
    )
    db.session.add(match)
    db.session.commit()

    response = client.get("/matches")
    assert response.status_code == 200
    assert any(m["scores"] == "1-0" for m in response.get_json())


def test_update_match(client):
    event, e1, e2 = seed_event_and_entrants()
    match = Match(
        event_id=event.id, round=1, entrant1_id=e1.id, entrant2_id=e2.id, scores="0-0"
    )
    db.session.add(match)
    db.session.commit()

    response = client.put(f"/matches/{match.id}", json={"scores": "2-0"})
    assert response.status_code == 200
    assert response.get_json()["scores"] == "2-0"

    result = db.session.execute(select(Match).filter_by(id=match.id)).scalar_one()
    assert result.scores == "2-0"


def test_delete_match(client):
    event, e1, e2 = seed_event_and_entrants()
    match = Match(
        event_id=event.id, round=1, entrant1_id=e1.id, entrant2_id=e2.id, scores="1-1"
    )
    db.session.add(match)
    db.session.commit()

    response = client.delete(f"/matches/{match.id}")
    assert response.status_code == 204
    assert (
        db.session.execute(select(Match).filter_by(id=match.id)).scalar_one_or_none()
        is None
    )

import pytest
from backend.models import Match, db

class TestMatchEdgeCases:
    def test_create_match_same_entrants(self, client):
        event, e1, _ = seed_event_and_entrants()
        res = client.post(
            "/matches",
            json={
                "event_id": event.id,
                "round": 1,
                "entrant1_id": e1.id,
                "entrant2_id": e1.id,
                "scores": "2-0",
                "winner_id": e1.id,
            },
        )
        assert res.status_code in (400, 422)

    def test_create_match_invalid_entrant(self, client):
        event, _, _ = seed_event_and_entrants()
        res = client.post(
            "/matches",
            json={
                "event_id": event.id,
                "round": 1,
                "entrant1_id": 9999,
                "entrant2_id": 8888,
                "scores": "1-0",
                "winner_id": 9999,
            },
        )
        assert res.status_code == 404

    def test_create_match_missing_scores(self, client):
        event, e1, e2 = seed_event_and_entrants()
        res = client.post(
            "/matches",
            json={
                "event_id": event.id,
                "round": 1,
                "entrant1_id": e1.id,
                "entrant2_id": e2.id,
            },
        )
        assert res.status_code == 400

    def test_update_nonexistent_match(self, client):
        res = client.put("/matches/9999", json={"scores": "2-0"})
        assert res.status_code == 404

    def test_delete_nonexistent_match(self, client):
        res = client.delete("/matches/9999")
        assert res.status_code == 404
