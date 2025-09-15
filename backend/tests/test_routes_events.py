# File: backend/tests/test_routes_events.py
# Purpose: API route tests for Event resource (CRUD).
# Notes:
# - Uses Flask test client fixture (`client`) defined in conftest.py.
# - Covers create, read, update, delete operations for Event.
# - Runs against an in-memory SQLite database for isolation.

from backend.models import Event, db
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

def test_get_events(client):
    event = Event(name="Seed Event", date="2025-01-01", rules="Bo1", status="published")
    db.session.add(event)
    db.session.commit()

    response = client.get("/events")
    assert response.status_code == 200
    data = response.get_json()
    assert any(ev["name"] == "Seed Event" for ev in data)

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
    assert db.session.execute(
        select(Event).filter_by(id=event.id)
    ).scalar_one_or_none() is None
