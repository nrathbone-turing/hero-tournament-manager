# File: backend/routes/matches.py
# Purpose: Defines Flask Blueprint for Match CRUD routes.
# Notes:
# - Casts IDs to integers defensively.
# - Validates that winner_id matches entrant1_id or entrant2_id.
# - Returns matches with entrant names for frontend convenience.

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from backend.models import db, Match

bp = Blueprint("matches", __name__, url_prefix="/matches")


@bp.route("", methods=["POST"])
@jwt_required()
def create_match():
    """Create a new Match."""
    data = request.get_json() or {}
    try:
        event_id = int(data.get("event_id"))
        entrant1_id = int(data.get("entrant1_id"))
        entrant2_id = int(data.get("entrant2_id"))
        round_num = int(data.get("round")) if data.get("round") else None
        winner_id = int(data["winner_id"]) if data.get("winner_id") else None

        # Validation: winner must match one of the entrants
        if winner_id and winner_id not in (entrant1_id, entrant2_id):
            return jsonify(error="Winner ID must match one of the entrants"), 400

        match = Match(
            event_id=event_id,
            round=round_num,
            entrant1_id=entrant1_id,
            entrant2_id=entrant2_id,
            scores=data.get("scores"),
            winner_id=winner_id,
        )
        db.session.add(match)
        db.session.commit()
        return jsonify(match.to_dict(include_names=True)), 201
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error creating match: {e}")
        return jsonify(error="Failed to create match"), 500


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

    try:
        db.session.delete(match)
        db.session.commit()
        print(f"✅ Deleted match {match_id}")
        return "", 204
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error deleting match {match_id}: {e}")
        return jsonify(error="Failed to delete match"), 500
