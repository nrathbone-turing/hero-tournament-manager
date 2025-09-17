# backend/database.py
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
Base = db.Model


def init_db():
    db.create_all()
