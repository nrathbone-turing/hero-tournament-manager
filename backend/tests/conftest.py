# File: backend/tests/conftest.py
# Purpose: Global pytest fixtures for backend tests.
# Provides:
# - app: Flask app created via factory (uses in-memory SQLite)
# - client: Flask test client for API requests
# - session: SQLAlchemy session scoped to test context

import pytest
from backend.app import create_app
from backend.models import db


@pytest.fixture(scope="session")
def app():
    """Create a Flask app instance for testing with in-memory DB."""
    app = create_app()
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app.config["TESTING"] = True

    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    """Provide Flask test client for making requests."""
    return app.test_client()


@pytest.fixture
def session(app):
    """Provide SQLAlchemy session for direct DB access in tests."""
    with app.app_context():
        yield db.session
        db.session.rollback()
