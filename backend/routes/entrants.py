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
    """Delete an Entrant by ID.
    - Hard delete if not referenced in matches
    - Soft delete (mark dropped) if referenced in matches
    """
    entrant = Entrant.query.get_or_404(entrant_id)

    from backend.models import Match  # avoid circular import

    # Check if entrant is tied to any matches
    has_matches = (
        Match.query.filter(
            (Match.entrant1_id == entrant_id)
            | (Match.entrant2_id == entrant_id)
            | (Match.winner_id == entrant_id)
        ).count()
        > 0
    )

    try:
        if has_matches:
            entrant.soft_delete()
            db.session.commit()
            print(f"⚠️ Entrant {entrant_id} marked as dropped (still in matches)")
            return jsonify(entrant.to_dict()), 200
        else:
            db.session.delete(entrant)
            db.session.commit()
            print(f"✅ Entrant {entrant_id} fully deleted (no matches)")
            return "", 204
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error deleting entrant {entrant_id}: {e}")
        return jsonify(error="Failed to delete entrant"), 500
