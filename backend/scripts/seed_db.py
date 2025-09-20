# File: backend/scripts/seed_db.py
# Purpose: Load JSON seed data into the Flask DB.
# Notes:
# - Reads from backend/seeds/events.json, entrants.json, matches.json
# - Inserts into SQLAlchemy models via Flask app context.
# - Seeds exactly one admin user (no logins for BYE or entrants).
# - Resets Postgres sequences to avoid duplicate key issues.
# - Run with: npm run db:clear && npm run db:seed

import os
import json
from sqlalchemy.sql import text
from backend.app import create_app
from backend.models import db, Event, Entrant, Match, User

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
            db.session.add(
                Event(id=e["id"], name=e["name"], date=e["date"], status=e["status"])
            )

        # Insert Entrants (skip creating logins for entrants)
        for en in entrants:
            db.session.add(
                Entrant(
                    id=en["id"],
                    name=en["name"],
                    alias=en["alias"],
                    event_id=en["event_id"],
                    dropped=en.get("dropped", False),
                )
            )

        # Insert Matches
        for m in matches:
            db.session.add(
                Match(
                    id=m["id"],
                    round=m["round"],
                    entrant1_id=m["entrant1_id"],
                    entrant2_id=m["entrant2_id"],
                    scores=m["scores"],
                    winner_id=m["winner_id"],
                    event_id=m["event_id"],
                )
            )

        # Create admin user if not exists
        if not User.query.filter_by(email="admin@example.com").first():
            admin = User(username="admin", email="admin@example.com")
            admin.set_password("password123")
            db.session.add(admin)

        db.session.commit()

        # Reset sequences so autoincrement picks up after max IDs
        for table in ["events", "entrants", "matches"]:
            seq_sql = text(
                f"""
                SELECT setval(
                  pg_get_serial_sequence('{table}', 'id'),
                  COALESCE((SELECT MAX(id) FROM {table}), 1) + 1,
                  false
                )
            """
            )
            db.session.execute(seq_sql)

        db.session.commit()

        print(
            f"✅ Inserted {len(events)} events, "
            f"{len(entrants)} entrants, "
            f"{len(matches)} matches, "
            f"+ admin user"
        )
        print("🔄 Sequences reset for events, entrants, and matches.")


if __name__ == "__main__":
    run()
