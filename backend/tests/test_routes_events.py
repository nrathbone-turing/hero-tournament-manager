# File: backend/tests/test_routes_events.py
# Purpose: API route tests for Event resource (CRUD).
# Notes:
# - Uses Flask test client fixture (`client`) and helpers from conftest.py.
# - Covers create, read (with entrant counts), update, and delete.

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


def test_get_events_with_counts(client, create_event, session):
    event = create_event(name="Seed Event", status="published")
    e1 = Entrant(name="Alpha", alias="A", event_id=event.id)
    e2 = Entrant(name="Beta", alias="B", event_id=event.id)
    session.add_all([e1, e2])
    session.commit()

    response = client.get("/events")
    assert response.status_code == 200
    data = response.get_json()
    seed_event = next(ev for ev in data if ev["name"] == "Seed Event")
    assert seed_event["entrant_count"] == 2


def test_update_event(client, create_event):
    event = create_event(status="drafting")
    response = client.put(f"/events/{event.id}", json={"status": "cancelled"})
    assert response.status_code == 200
    assert response.get_json()["status"] == "cancelled"

    result = db.session.execute(select(Event).filter_by(id=event.id)).scalar_one()
    assert result.status == "cancelled"


def test_delete_event(client, create_event):
    event = create_event(status="drafting")
    response = client.delete(f"/events/{event.id}")
    assert response.status_code == 204
    assert (
        db.session.execute(select(Event).filter_by(id=event.id)).scalar_one_or_none()
        is None
    )
