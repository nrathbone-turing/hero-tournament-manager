# File: backend/routes/events.py
# Purpose: Defines Flask Blueprint for Event CRUD routes.
# Notes:
# - Supports create, read (list), update, and delete.
# - Uses SQLAlchemy models from backend.models.
# - Returns JSON responses with appropriate status codes.
# - Mounted under `/events` via url_prefix in Blueprint.

from flask import Blueprint, request, jsonify
from backend.models import db, Event, Entrant, Match

bp = Blueprint("events", __name__, url_prefix="/events")

@bp.route("", methods=["POST"])
def create_event():
    data = request.get_json()
    event = Event(
        name=data.get("name"),
        date=data.get("date"),
        rules=data.get("rules"),
        status=data.get("status", "open"),
    )
    db.session.add(event)
    db.session.commit()
    return jsonify(event.to_dict()), 201

@bp.route("", methods=["GET"])
def get_events():
    events = Event.query.all()
    return jsonify([e.to_dict() for e in events]), 200

@bp.route("/<int:event_id>", methods=["GET"])
def get_event(event_id):
    event = Event.query.get_or_404(event_id)
    entrants = Entrant.query.filter_by(event_id=event.id).all()
    matches = Match.query.filter_by(event_id=event.id).all()
    return jsonify({
        **event.to_dict(),
        "entrants": [e.to_dict() for e in entrants],
        "matches": [m.to_dict() for m in matches],
    }), 200

@bp.route("/<int:event_id>", methods=["PUT"])
def update_event(event_id):
    event = Event.query.get_or_404(event_id)
    data = request.get_json()
    for key, value in data.items():
        setattr(event, key, value)
    db.session.commit()
    return jsonify(event.to_dict()), 200

@bp.route("/<int:event_id>", methods=["DELETE"])
def delete_event(event_id):
    event = Event.query.get_or_404(event_id)
    db.session.delete(event)
    db.session.commit()
    return "", 204
