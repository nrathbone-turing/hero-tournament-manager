# File: backend/tests/test_models.py
# Purpose: Unit tests for Event, Entrant, and Match models.
# Notes:
# - Uses pytest with fixtures defined in backend/tests/conftest.py
# - Runs against an in-memory SQLite database for speed & isolation

from backend.models import Event, Entrant, Match


def test_create_event(session):
    event = Event(
        name="Hero Cup",
        date="2025-09-12",
        rules="Bo3",
        status="open",
    )
    session.add(event)
    session.commit()
    assert event.id is not None
    assert event.name == "Hero Cup"


def test_create_entrant_with_event(session):
    event = Event(
        name="Hero Cup",
        date="2025-09-12",
        rules="Bo3",
        status="open",
    )
    entrant = Entrant(
        name="Spiderman",
        alias="Webslinger",
        event=event,
    )
    session.add_all([event, entrant])
    session.commit()
    assert entrant.id is not None
    assert entrant.event == event


def test_create_match_with_event_and_entrants(session):
    event = Event(
        name="Hero Cup",
        date="2025-09-12",
        rules="Bo3",
        status="open",
    )
    entrant1 = Entrant(
        name="Spiderman",
        alias="Webslinger",
        event=event,
    )
    entrant2 = Entrant(
        name="Venom",
        alias="Symbiote",
        event=event,
    )
    match = Match(
        event=event,
        round=1,
        entrant1_id=1,
        entrant2_id=2,
        scores="2-1",
        winner_id=1,
    )
    session.add_all([event, entrant1, entrant2, match])
    session.commit()
    assert match.id is not None
    assert match.round == 1
    assert match.scores == "2-1"
