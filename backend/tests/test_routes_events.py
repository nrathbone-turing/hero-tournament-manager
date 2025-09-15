# File: backend/tests/test_routes_events.py
# Purpose: API route tests for Event resource (CRUD).
# Notes:
# - Uses Flask test client fixture (`client`) defined in conftest.py.
# - Covers create, read, update, delete operations for Event.
# - Runs against an in-memory SQLite database for isolation.

from backend.models import Event, Entrant, db
from sqlalchemy import select


def test_create_event(client):
    response = client.post(
        "/events",
        json={
            "name": "Hero Cup",
            "date": "2025-09-12",
            "rules": "Bo3",
            "status": "drafting",
        },
    )
    assert response.status_code == 201
    data = response.get_json()
    assert data["status"] == "drafting"
    assert "id" in data


def test_get_events_with_counts(client):
    event = Event(name="Seed Event", date="2025-01-01", rules="Bo1", status="published")
    db.session.add(event)
    db.session.commit()

    # Add 2 entrants for the event
    e1 = Entrant(name="Alpha", alias="A", event=event)
    e2 = Entrant(name="Beta", alias="B", event=event)
    db.session.add_all([e1, e2])
    db.session.commit()

    response = client.get("/events")
    assert response.status_code == 200
    data = response.get_json()

    seed_event = next(ev for ev in data if ev["name"] == "Seed Event")
    assert seed_event["entrant_count"] == 2  # dynamic count works


def test_update_event(client):
    event = Event(name="Temp Event", status="drafting")
    db.session.add(event)
    db.session.commit()

    response = client.put(f"/events/{event.id}", json={"status": "cancelled"})
    assert response.status_code == 200
    assert response.get_json()["status"] == "cancelled"

    result = db.session.execute(select(Event).filter_by(id=event.id)).scalar_one()
    assert result.status == "cancelled"


def test_delete_event(client):
    event = Event(name="Delete Me", status="drafting")
    db.session.add(event)
    db.session.commit()

    response = client.delete(f"/events/{event.id}")
    assert response.status_code == 204
    assert (
        db.session.execute(select(Event).filter_by(id=event.id)).scalar_one_or_none()
        is None
    )

class TestEventEdgeCases:
    def test_create_event_missing_name(self, client):
        res = client.post("/events", json={"date": "2025-09-12", "status": "drafting"})
        assert res.status_code == 400  # expecting validation error

    def test_update_event_invalid_status(self, client):
        event = Event(name="Edge Event", status="drafting")
        db.session.add(event)
        db.session.commit()

        res = client.put(f"/events/{event.id}", json={"status": "invalid"})
        assert res.status_code in (400, 422)

    def test_get_nonexistent_event(self, client):
        res = client.get("/events/9999")
        assert res.status_code == 404

    def test_delete_nonexistent_event(self, client):
        res = client.delete("/events/9999")
        assert res.status_code == 404