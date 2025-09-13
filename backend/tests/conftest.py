# File: backend/tests/conftest.py
# Purpose: Global pytest fixtures for backend tests.
# Provides:
# - app: Flask app configured with in-memory SQLite DB
# - session: SQLAlchemy session scoped to test context

import pytest
from flask import Flask
from backend.models import db


@pytest.fixture(scope="session")
def app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)

    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def session(app):
    with app.app_context():
        yield db.session
        db.session.rollback()
