# File: backend/tests/test_routes_entrants.py
# Purpose: API route tests for Entrant resource (CRUD).
# Notes:
# - Uses Flask test client fixture (`client`) defined in conftest.py.
# - Entrants must be linked to an Event (FK relationship).
# - Covers create, read, update, delete operations for Entrants.
# - Runs against an in-memory SQLite database for isolation.

from backend.models import Event, Entrant, db
from sqlalchemy import select


def create_event_for_testing():
    """Helper function to create a seed Event for Entrant tests."""
    event = Event(name="Test Cup", date="2025-09-12", rules="Bo3", status="drafting")
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
    assert any(ent["name"] == "Batman" for ent in data)


def test_update_entrant(client):
    event = create_event_for_testing()
    entrant = Entrant(name="Temp Hero", alias="None", event_id=event.id)
    db.session.add(entrant)
    db.session.commit()

    response = client.put(f"/entrants/{entrant.id}", json={"alias": "Updated Alias"})
    assert response.status_code == 200
    assert response.get_json()["alias"] == "Updated Alias"

    result = db.session.execute(select(Entrant).filter_by(id=entrant.id)).scalar_one()
    assert result.alias == "Updated Alias"


def test_delete_entrant(client):
    event = create_event_for_testing()
    entrant = Entrant(name="Delete Me", alias="Temp", event_id=event.id)
    db.session.add(entrant)
    db.session.commit()

    response = client.delete(f"/entrants/{entrant.id}")
    assert response.status_code == 204
    assert (
        db.session.execute(
            select(Entrant).filter_by(id=entrant.id)
        ).scalar_one_or_none()
        is None
    )

class TestEntrantEdgeCases:
    def test_create_entrant_missing_name(self, client):
        event = create_event_for_testing()
        res = client.post("/entrants", json={"alias": "Nameless", "event_id": event.id})
        assert res.status_code == 400

    def test_create_entrant_with_invalid_event(self, client):
        res = client.post(
            "/entrants",
            json={"name": "Ghost", "alias": "NoEvent", "event_id": 9999},
        )
        assert res.status_code == 404

    def test_update_nonexistent_entrant(self, client):
        res = client.put("/entrants/9999", json={"alias": "DoesNotExist"})
        assert res.status_code == 404

    def test_delete_nonexistent_entrant(self, client):
        res = client.delete("/entrants/9999")
        assert res.status_code == 404