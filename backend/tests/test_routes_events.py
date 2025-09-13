# File: backend/tests/test_routes_events.py
# Purpose: API route tests for Event resource (CRUD).
# Notes:
# - Uses Flask test client fixture (`client`) defined in conftest.py.
# - Covers create, read, update, delete operations for Event.
# - Runs against an in-memory SQLite database for isolation.

import pytest
from backend.models import Event, db
from sqlalchemy import select


def test_create_event(client):
    response = client.post(
        "/events",
        json={"name": "Hero Cup", "date": "2025-09-12", "rules": "Bo3", "status": "open"},
    )
    assert response.status_code == 201
    data = response.get_json()
    assert data["name"] == "Hero Cup"
    assert data["status"] == "open"


def test_get_events(client):
    # Arrange: create a seed event
    event = Event(name="Seed Event", date="2025-01-01", rules="Bo1", status="open")
    db.session.add(event)
    db.session.commit()

    # Act: call endpoint
    response = client.get("/events")

    # Assert
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert any(ev["name"] == "Seed Event" for ev in data)


def test_update_event(client):
    # Arrange: create an event
    event = Event(name="Temp Event", status="open")
    db.session.add(event)
    db.session.commit()

    # Act: update status
    response = client.put(f"/events/{event.id}", json={"status": "closed"})

    # Assert
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "closed"


def test_delete_event(client):
    # Arrange: create an event
    event = Event(name="Delete Me", status="open")
    db.session.add(event)
    db.session.commit()

    # Act: delete it
    response = client.delete(f"/events/{event.id}")

    # Assert
    assert response.status_code == 204
    result = db.session.execute(select(Event).filter_by(id=event.id)).scalar_one_or_none()
    assert result is None
