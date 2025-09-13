# File: backend/tests/test_routes_entrants.py
# Purpose: API route tests for Entrant resource (CRUD).
# Notes:
# - Uses Flask test client fixture (`client`) defined in conftest.py.
# - Entrants must be linked to an Event (FK relationship).
# - Covers create, read, update, delete operations for Entrants.
# - Runs against an in-memory SQLite database for isolation.

import pytest
from backend.models import Event, Entrant, db


def create_event_for_testing():
    """Helper function to create a seed Event for Entrant tests."""
    event = Event(name="Test Cup", date="2025-09-12", rules="Bo3", status="open")
    db.session.add(event)
    db.session.commit()
    return event


def test_create_entrant(client):
    event = create_event_for_testing()
    response = client.post(
        "/entrants",
        json={"name": "Spiderman", "alias": "Webslinger", "event_id": event.id},
    )
    assert response.status_code == 201
    data = response.get_json()
    assert data["name"] == "Spiderman"
    assert data["alias"] == "Webslinger"
    assert data["event_id"] == event.id


def test_get_entrants(client):
    event = create_event_for_testing()
    entrant = Entrant(name="Batman", alias="Dark Knight", event_id=event.id)
    db.session.add(entrant)
    db.session.commit()

    response = client.get("/entrants")
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert any(ent["name"] == "Batman" for ent in data)


def test_update_entrant(client):
    event = create_event_for_testing()
    entrant = Entrant(name="Temp Hero", alias="None", event_id=event.id)
    db.session.add(entrant)
    db.session.commit()

    response = client.put(
        f"/entrants/{entrant.id}", json={"alias": "Updated Alias"}
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["alias"] == "Updated Alias"


def test_delete_entrant(client):
    event = create_event_for_testing()
    entrant = Entrant(name="Delete Me", alias="Temp", event_id=event.id)
    db.session.add(entrant)
    db.session.commit()

    response = client.delete(f"/entrants/{entrant.id}")
    assert response.status_code == 204
    assert Entrant.query.get(entrant.id) is None
