# File: backend/routes/events.py
# Purpose: Defines Flask Blueprint for Event CRUD routes.
# Notes:
# - Supports create, read (list), update, and delete.
# - Uses SQLAlchemy models from backend.models.
# - Returns JSON responses with appropriate status codes.
# - Mounted under `/events` via url_prefix in Blueprint.

from flask import Blueprint, request, jsonify
from backend.models import db, Event

bp = Blueprint("events", __name__, url_prefix="/events")


@bp.route("", methods=["POST"])
def create_event():
    """Create a new Event."""
    data = request.get_json()
    event = Event(
        name=data.get("name"),
        date=data.get("date"),
        rules=data.get("rules"),
        status=data.get("status"),
    )
    db.session.add(event)
    db.session.commit()
    return jsonify({"id": event.id, "name": event.name, "status": event.status}), 201


@bp.route("", methods=["GET"])
def get_events():
    """Retrieve all Events."""
    events = Event.query.all()
    return jsonify(
        [
            {"id": e.id, "name": e.name, "date": e.date, "rules": e.rules, "status": e.status}
            for e in events
        ]
    ), 200


@bp.route("/<int:event_id>", methods=["PUT"])
def update_event(event_id):
    """Update an Event by ID."""
    event = Event.query.get_or_404(event_id)
    data = request.get_json()
    for key, value in data.items():
        setattr(event, key, value)
    db.session.commit()
    return jsonify(
        {"id": event.id, "name": event.name, "date": event.date, "rules": event.rules, "status": event.status}
    ), 200


@bp.route("/<int:event_id>", methods=["DELETE"])
def delete_event(event_id):
    """Delete an Event by ID."""
    event = Event.query.get_or_404(event_id)
    db.session.delete(event)
    db.session.commit()
    return "", 204