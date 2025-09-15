# File: backend/models.py
# Purpose: Defines SQLAlchemy models for Hero Tournament Manager with validations.
# Notes:
# - Enforces DB-level constraints: non-null names, valid statuses, sane match setup.
# - Includes to_dict() methods with optional related info.

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Enum, CheckConstraint

db = SQLAlchemy()

# Allowed event statuses
EVENT_STATUSES = ("drafting", "published", "cancelled", "completed")


class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String, nullable=True)
    rules = db.Column(db.String, nullable=True)
    status = db.Column(
        Enum(*EVENT_STATUSES, name="event_status", validate_strings=True), nullable=False, default="drafting"
    )

    entrants = db.relationship(
        "Entrant", back_populates="event", cascade="all, delete-orphan"
    )
    matches = db.relationship(
        "Match", back_populates="event", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Event {self.name} ({self.date}) - {self.status}>"

    def to_dict(self, include_related=False):
        data = {
            "id": self.id,
            "name": self.name,
            "date": self.date,
            "rules": self.rules,
            "status": self.status,
            "entrant_count": len(self.entrants) if self.entrants else 0,
            }
        if include_related:
            data["entrants"] = [e.to_dict() for e in self.entrants]
            data["matches"] = [m.to_dict() for m in self.matches]
        return data


class Entrant(db.Model):
    __tablename__ = "entrants"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    alias = db.Column(db.String(80), nullable=True)
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False)

    event = db.relationship("Event", back_populates="entrants")

    def __repr__(self):
        return f"<Entrant {self.name} ({self.alias})>"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "alias": self.alias,
            "event_id": self.event_id,
        }


class Match(db.Model):
    __tablename__ = "matches"

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"), nullable=False)
    round = db.Column(db.Integer, nullable=True)
    entrant1_id = db.Column(db.Integer, db.ForeignKey("entrants.id"), nullable=True)
    entrant2_id = db.Column(db.Integer, db.ForeignKey("entrants.id"), nullable=True)
    scores = db.Column(db.String, nullable=True)
    winner_id = db.Column(db.Integer, db.ForeignKey("entrants.id"), nullable=True)

    __table_args__ = (
        CheckConstraint(
            "entrant1_id IS NULL OR entrant1_id != entrant2_id",
            name="check_distinct_entrants",
        ),
    )

    event = db.relationship("Event", back_populates="matches")

    def __repr__(self):
        return f"<Match Event {self.event_id} Round {self.round}>"

    def to_dict(self, include_names=False):
        data = {
            "id": self.id,
            "event_id": self.event_id,
            "round": self.round,
            "entrant1_id": self.entrant1_id,
            "entrant2_id": self.entrant2_id,
            "scores": self.scores,
            "winner_id": self.winner_id,
        }

        if include_names:
            from backend.models import Entrant  # avoid circular imports

            data["entrant1"] = (
                Entrant.query.get(self.entrant1_id).to_dict()
                if self.entrant1_id
                else None
            )
            data["entrant2"] = (
                Entrant.query.get(self.entrant2_id).to_dict()
                if self.entrant2_id
                else None
            )
            data["winner"] = (
                Entrant.query.get(self.winner_id).to_dict()
                if self.winner_id
                else None
            )

        return data
