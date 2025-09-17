# File: backend/routes/entrants.py
# Purpose: Defines Flask Blueprint for Entrant CRUD routes.
# Notes:
# - Supports create, read (list), update, and delete.
# - Uses Entrant.to_dict() for consistent serialization.

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from backend.models import db, Entrant

bp = Blueprint("entrants", __name__, url_prefix="/entrants")


@bp.route("", methods=["POST"])
@jwt_required()
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
    return jsonify(entrant.to_dict()), 201


@bp.route("", methods=["GET"])
def get_entrants():
    """Retrieve all Entrants (optionally filter by event_id)."""
    event_id = request.args.get("event_id", type=int)
    query = Entrant.query
    if event_id:
        query = query.filter_by(event_id=event_id)
    entrants = query.all()
    return jsonify([e.to_dict() for e in entrants]), 200


@bp.route("/<int:entrant_id>", methods=["PUT"])
@jwt_required()
def update_entrant(entrant_id):
    """Update an Entrant by ID."""
    entrant = Entrant.query.get_or_404(entrant_id)
    data = request.get_json()
    for key, value in data.items():
        setattr(entrant, key, value)
    db.session.commit()
    return jsonify(entrant.to_dict()), 200


@bp.route("/<int:entrant_id>", methods=["DELETE"])
@jwt_required()
def delete_entrant(entrant_id):
    """Delete an Entrant by ID."""
    entrant = Entrant.query.get_or_404(entrant_id)
    db.session.delete(entrant)
    db.session.commit()
    return "", 204
