from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    date = db.Column(db.String)
    rules = db.Column(db.String)
    status = db.Column(db.String)
    entrants = db.relationship("Entrant", backref="event", lazy=True)
    matches = db.relationship("Match", backref="event", lazy=True)

class Entrant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    alias = db.Column(db.String)
    event_id = db.Column(db.Integer, db.ForeignKey("event.id"), nullable=False)

class Match(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey("event.id"), nullable=False)
    round = db.Column(db.Integer)
    entrant1_id = db.Column(db.Integer, db.ForeignKey("entrant.id"))
    entrant2_id = db.Column(db.Integer, db.ForeignKey("entrant.id"))
    scores = db.Column(db.String)
    winner_id = db.Column(db.Integer, db.ForeignKey("entrant.id"))