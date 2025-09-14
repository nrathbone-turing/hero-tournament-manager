# File: backend/scripts/seed_db.py
# Purpose: Load JSON seed data into the Flask DB.
# Notes:
# - Reads from backend/seeds/events.json, entrants.json, matches.json
# - Inserts into SQLAlchemy models via Flask app context.
# - Run with: npm run db:clear && npm run db:seed

import os
import json
from backend.app import create_app
from backend.models import db, Event, Entrant, Match

SEED_DIR = os.path.join(os.path.dirname(__file__), "..", "seeds")

def load_seed(filename):
    with open(os.path.join(SEED_DIR, filename), "r") as f:
        return json.load(f)

def run():
    app = create_app()
    with app.app_context():
        print("🌱 Seeding database...")

        events = load_seed("events.json")
        entrants = load_seed("entrants.json")
        matches = load_seed("matches.json")

        # Insert Events
        for e in events:
            db.session.add(Event(id=e["id"], name=e["name"], date=e["date"], status=e["status"]))

        # Insert Entrants
        for en in entrants:
            db.session.add(Entrant(id=en["id"], name=en["name"], alias=en["alias"], event_id=en["event_id"]))

        # Insert Matches
        for m in matches:
            db.session.add(Match(
                id=m["id"],
                round=m["round"],
                entrant1_id=m["entrant1_id"],
                entrant2_id=m["entrant2_id"],
                scores=m["scores"],
                winner_id=m["winner_id"],
                event_id=m["event_id"]
            ))

        db.session.commit()
        print(f"✅ Inserted {len(events)} events, {len(entrants)} entrants, {len(matches)} matches")

if __name__ == "__main__":
    run()
