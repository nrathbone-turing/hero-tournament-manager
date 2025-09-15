# File: backend/routes/events.py
# Purpose: Defines Flask Blueprint for Event CRUD routes.
# Notes:
# - Supports create, read (list), update, and delete.
# - Adds entrant_count in event list response.
# - Enriches matches with entrant names when returning a single event.

from flask import Blueprint, request, jsonify
from sqlalchemy import func
from backend.models import db, Event, Entrant

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
    return jsonify(event.to_dict()), 201


@bp.route("", methods=["GET"])
def get_events():
    """Retrieve all Events with entrant counts."""
    events = (
        db.session.query(
            Event.id,
            Event.name,
            Event.date,
            Event.rules,
            Event.status,
            func.count(Entrant.id).label("entrant_count"),
        )
        .outerjoin(Entrant, Entrant.event_id == Event.id)
        .group_by(Event.id)
        .all()
    )

    return (
        jsonify(
            [
                {
                    "id": e.id,
                    "name": e.name,
                    "date": (
                        e.date.isoformat() if hasattr(e.date, "isoformat") else e.date
                    ),
                    "rules": e.rules,
                    "status": e.status,
                    "entrant_count": e.entrant_count,
                }
                for e in events
            ]
        ),
        200,
    )


@bp.route("/<int:event_id>", methods=["GET"])
def get_event(event_id):
    """Retrieve a single Event with entrants + matches (with names)."""
    event = Event.query.get_or_404(event_id)
    data = event.to_dict(include_related=True)
    # enrich matches with entrant names
    data["matches"] = [m.to_dict(include_names=True) for m in event.matches]
    return jsonify(data), 200


@bp.route("/<int:event_id>", methods=["PUT"])
def update_event(event_id):
    """Update an Event by ID."""
    event = Event.query.get_or_404(event_id)
    data = request.get_json()
    for key, value in data.items():
        setattr(event, key, value)
    db.session.commit()
    return jsonify(event.to_dict()), 200


@bp.route("/<int:event_id>", methods=["DELETE"])
def delete_event(event_id):
    """Delete an Event by ID."""
    event = Event.query.get_or_404(event_id)
    db.session.delete(event)
    db.session.commit()
    return "", 204
