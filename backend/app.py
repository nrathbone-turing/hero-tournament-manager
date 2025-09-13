# File: backend/app.py
# Purpose: Flask application entry point.
# Notes:
# - Initializes Flask app and SQLAlchemy.
# - Registers Blueprints for API routes.

from flask import Flask
from backend.models import db
from backend.routes.events import bp as events_bp


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///tournaments.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    # Register Blueprints
    app.register_blueprint(events_bp)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(port=5500, debug=True)
