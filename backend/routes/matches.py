# File: backend/routes/matches.py
# Purpose: Defines Flask Blueprint for Match CRUD routes.
# Notes:
# - Supports create, read (list), update, and delete.
# - Uses Match.to_dict() for consistent serialization.
# - Always returns matches with entrant names for frontend convenience.

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from backend.models import db, Match

bp = Blueprint("matches", __name__, url_prefix="/matches")


@bp.route("", methods=["POST"])
@jwt_required()
def create_match():
    """Create a new Match."""
    data = request.get_json()
    match = Match(
        event_id=data.get("event_id"),
        round=data.get("round"),
        entrant1_id=data.get("entrant1_id"),
        entrant2_id=data.get("entrant2_id"),
        scores=data.get("scores"),
        winner_id=data.get("winner_id"),
    )
    db.session.add(match)
    db.session.commit()
    return jsonify(match.to_dict(include_names=True)), 201


@bp.route("", methods=["GET"])
def get_matches():
    """Retrieve all Matches (optionally filter by event_id)."""
    event_id = request.args.get("event_id", type=int)
    query = Match.query
    if event_id:
        query = query.filter_by(event_id=event_id)
    matches = query.all()
    return jsonify([m.to_dict(include_names=True) for m in matches]), 200


@bp.route("/<int:match_id>", methods=["PUT"])
@jwt_required()
def update_match(match_id):
    """Update a Match by ID."""
    match = Match.query.get_or_404(match_id)
    data = request.get_json()
    for key, value in data.items():
        setattr(match, key, value)
    db.session.commit()
    return jsonify(match.to_dict(include_names=True)), 200


@bp.route("/<int:match_id>", methods=["DELETE"])
@jwt_required()
def delete_match(match_id):
    """Delete a Match by ID."""
    match = Match.query.get_or_404(match_id)
    db.session.delete(match)
    db.session.commit()
    return "", 204
