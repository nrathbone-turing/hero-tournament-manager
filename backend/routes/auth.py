# File: backend/routes/auth.py
# Purpose: User authentication routes.
# Notes:
# - Provides signup, login, logout, and protected routes.
# - Uses JWT for token-based authentication.

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from backend.database import db
from backend.models import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not all([username, email, password]):
        return jsonify({"error": "Missing required fields"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400

    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify(user.to_dict()), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": token}), 200


@auth_bp.route("/logout", methods=["DELETE"])
@jwt_required()
def logout():
    # With JWT there is no true server-side logout unless you add token revocation.
    # For now, just respond OK so the client can clear its token.
    return jsonify({"message": "Logged out"}), 200


@auth_bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    return jsonify({"message": f"Hello {user.username}!"}), 200
