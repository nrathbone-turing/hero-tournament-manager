# File: backend/app.py
# Purpose: Flask application entry point.
# Notes:
# - Initializes Flask app and SQLAlchemy.
# - Registers Blueprints for API routes.

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate

from backend.database import db, init_db
from backend.routes.events import bp as events_bp
from backend.routes.entrants import bp as entrants_bp
from backend.routes.matches import bp as matches_bp
from backend.routes.auth import auth_bp


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///tournaments.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = "super-secret-key"
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    app.config["JWT_HEADER_TYPE"] = "Bearer"
    app.config["JWT_ALGORITHM"] = "HS256"


    db.init_app(app)
    CORS(app)  # <-- allow frontend on localhost:3000 to call
    Migrate(app, db)
    JWTManager(app)

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
