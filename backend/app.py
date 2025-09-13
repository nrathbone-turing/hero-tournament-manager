# File: backend/app.py
# Purpose: Flask application entry point.
# Notes:
# - Initializes Flask app and SQLAlchemy.
# - Registers Blueprints for API routes.

from flask import Flask
from backend.models import db
from flask_migrate import Migrate
from backend.routes.events import bp as events_bp
from backend.routes.entrants import bp as entrants_bp
from backend.routes.matches import bp as matches_bp
from flask_cors import CORS


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///tournaments.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    CORS(app)  # <-- allow frontend on localhost:3000 to call
    migrate = Migrate(app, db)

    # Register Blueprints
    app.register_blueprint(events_bp)
    app.register_blueprint(entrants_bp)
    app.register_blueprint(matches_bp)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(port=5500, debug=True)
