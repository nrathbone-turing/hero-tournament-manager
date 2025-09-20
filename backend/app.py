# File: backend/app.py
# Purpose: Flask application entry point.
# Notes:
# - Initializes Flask app and SQLAlchemy.
# - Registers Blueprints for API routes.
# - Normalizes JWT errors to return 401 Unauthorized instead of 422.
# - Adds short-lived JWT expiry and an in-memory blocklist for logout/revocation.

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from datetime import timedelta

from backend.database import db, init_db
from backend.routes.events import bp as events_bp
from backend.routes.entrants import bp as entrants_bp
from backend.routes.matches import bp as matches_bp
from backend.routes.auth import auth_bp
from backend.blocklist import jwt_blocklist


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///tournaments.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = "super-secret-key"
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    app.config["JWT_HEADER_TYPE"] = "Bearer"
    app.config["JWT_ALGORITHM"] = "HS256"

    # Short-lived tokens for testing expiry
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(seconds=1)

    db.init_app(app)
    CORS(app)  # allow frontend on localhost:3000 to call
    Migrate(app, db)
    jwt = JWTManager(app)

    # ------------------------
    # Custom JWT error handlers (normalize to 401)
    # ------------------------
    @jwt.unauthorized_loader
    def handle_missing_token(err_str):
        return jsonify(error="Missing Authorization Header"), 401

    @jwt.invalid_token_loader
    def handle_invalid_token(err_str):
        return jsonify(error="Invalid or expired token"), 401

    @jwt.expired_token_loader
    def handle_expired_token(jwt_header, jwt_payload):
        return jsonify(error="Invalid or expired token"), 401

    @jwt.revoked_token_loader
    def handle_revoked_token(jwt_header, jwt_payload):
        return jsonify(error="Invalid or expired token"), 401

    # ------------------------
    # Blocklist check for revoked tokens
    # ------------------------
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        return jwt_payload["jti"] in jwt_blocklist

    # Register Blueprints
    app.register_blueprint(events_bp)
    app.register_blueprint(entrants_bp)
    app.register_blueprint(matches_bp)
    app.register_blueprint(auth_bp)

    with app.app_context():
        init_db()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(port=5500, debug=True)
