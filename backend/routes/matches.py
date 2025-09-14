# File: backend/routes/matches.py
# Purpose: Defines Flask Blueprint for Match CRUD routes.
# Notes:
# - Supports create, read (list), update, and delete.
# - Matches are linked to Events and Entrants via FKs.
# - Returns JSON responses with appropriate status codes.
# - Mounted under `/matches` via url_prefix in Blueprint.

from flask import Blueprint, request, jsonify
from backend.models import db, Match

bp = Blueprint("matches", __name__, url_prefix="/matches")

@bp.route("", methods=["POST"])
def create_match():
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
    return jsonify(match.to_dict()), 201

@bp.route("", methods=["GET"])
def get_matches():
    event_id = request.args.get("event_id")
    if event_id:
        matches = Match.query.filter_by(event_id=event_id).all()
    else:
        matches = Match.query.all()
    return jsonify([m.to_dict() for m in matches]), 200

@bp.route("/<int:match_id>", methods=["PUT"])
def update_match(match_id):
    match = Match.query.get_or_404(match_id)
    data = request.get_json()
    for key, value in data.items():
        setattr(match, key, value)
    db.session.commit()
    return jsonify(match.to_dict()), 200

@bp.route("/<int:match_id>", methods=["DELETE"])
def delete_match(match_id):
    match = Match.query.get_or_404(match_id)
    db.session.delete(match)
    db.session.commit()
    return "", 204
