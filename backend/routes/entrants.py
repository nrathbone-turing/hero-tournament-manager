# File: backend/routes/entrants.py
# Purpose: Defines Flask Blueprint for Entrant CRUD routes.
# Notes:
# - Supports create, read (list), update, and delete.
# - Entrants must be linked to an Event (via event_id FK).
# - Returns JSON responses with appropriate status codes.
# - Mounted under `/entrants` via url_prefix in Blueprint.

from flask import Blueprint, request, jsonify
from backend.models import db, Entrant

bp = Blueprint("entrants", __name__, url_prefix="/entrants")


@bp.route("", methods=["POST"])
def create_entrant():
    """Create a new Entrant."""
    data = request.get_json()
    entrant = Entrant(
        name=data.get("name"),
        alias=data.get("alias"),
        event_id=data.get("event_id"),
    )
    db.session.add(entrant)
    db.session.commit()
    return (
        jsonify(
            {
                "id": entrant.id,
                "name": entrant.name,
                "alias": entrant.alias,
                "event_id": entrant.event_id,
            }
        ),
        201,
    )


@bp.route("", methods=["GET"])
def get_entrants():
    """Retrieve all Entrants."""
    entrants = Entrant.query.all()
    return (
        jsonify(
            [
                {
                    "id": e.id,
                    "name": e.name,
                    "alias": e.alias,
                    "event_id": e.event_id,
                }
                for e in entrants
            ]
        ),
        200,
    )


@bp.route("/<int:entrant_id>", methods=["PUT"])
def update_entrant(entrant_id):
    """Update an Entrant by ID."""
    entrant = Entrant.query.get_or_404(entrant_id)
    data = request.get_json()
    for key, value in data.items():
        setattr(entrant, key, value)
    db.session.commit()
    return (
        jsonify(
            {
                "id": entrant.id,
                "name": entrant.name,
                "alias": entrant.alias,
                "event_id": entrant.event_id,
            }
        ),
        200,
    )


@bp.route("/<int:entrant_id>", methods=["DELETE"])
def delete_entrant(entrant_id):
    """Delete an Entrant by ID."""
    entrant = Entrant.query.get_or_404(entrant_id)
    db.session.delete(entrant)
    db.session.commit()
    return "", 204
