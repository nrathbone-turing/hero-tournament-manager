# File: backend/tests/conftest.py
# Purpose: Global pytest fixtures for backend tests.
# Provides:
# - app: Flask app created via factory (uses in-memory SQLite)
# - client: Flask test client for API requests
# - session: SQLAlchemy session scoped to test context

import pytest
from backend.app import create_app
from backend.models import db, Event, Entrant


@pytest.fixture(scope="session")
def app():
    """Create a Flask app instance for testing with in-memory DB."""
    app = create_app()
    app.config.update(
        {
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "SQLALCHEMY_ENGINE_OPTIONS": {"connect_args": {"check_same_thread": False}},
            "JWT_SECRET_KEY": "test-secret",
        }
    )

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
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


# ------------------------------
# Global helpers
# ------------------------------
@pytest.fixture
def create_event(session):
    def _create_event(**kwargs):
        event = Event(
            name=kwargs.get("name", "Test Cup"),
            date=kwargs.get("date", "2025-09-12"),
            rules=kwargs.get("rules", "Bo3"),
            status=kwargs.get("status", "drafting"),
        )
        session.add(event)
        session.commit()
        return event

    return _create_event


@pytest.fixture
def seed_event_with_entrants(session, create_event):
    def _seed_event_with_entrants():
        event = create_event(name="Match Cup", status="published")
        e1 = Entrant(name="Hero A", alias="Alpha", event_id=event.id)
        e2 = Entrant(name="Hero B", alias="Beta", event_id=event.id)
        session.add_all([e1, e2])
        session.commit()
        return event, e1, e2

    return _seed_event_with_entrants
