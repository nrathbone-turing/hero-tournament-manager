# File: backend/models.py
# Purpose: Defines SQLAlchemy models for Hero Tournament Manager.
# Models:
# - Event: Tournament event (name, date, rules, status)
# - Entrant: Player/character registered in an event
# - Match: A match within an event, with entrants, round, scores, winner

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String, nullable=True)
    rules = db.Column(db.String, nullable=True)
    status = db.Column(db.String, nullable=True)

    # Relationships
    entrants = db.relationship(
        "Entrant", back_populates="event", cascade="all, delete-orphan"
    )
    matches = db.relationship(
        "Match", back_populates="event", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Event {self.name} ({self.date})>"


class Entrant(db.Model):
    __tablename__ = "entrants"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    alias = db.Column(db.String(80), nullable=True)
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False)

    # Relationship
    event = db.relationship("Event", back_populates="entrants")

    def __repr__(self):
        return f"<Entrant {self.name} ({self.alias})>"


class Match(db.Model):
    __tablename__ = "matches"

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False)
    round = db.Column(db.Integer, nullable=True)
    entrant1_id = db.Column(db.Integer, db.ForeignKey("entrants.id"))
    entrant2_id = db.Column(db.Integer, db.ForeignKey("entrants.id"))
    scores = db.Column(db.String, nullable=True)
    winner_id = db.Column(db.Integer, db.ForeignKey("entrants.id"))

    # Relationship
    event = db.relationship("Event", back_populates="matches")

    def __repr__(self):
        return f"<Match Event {self.event_id} Round {self.round}>"
