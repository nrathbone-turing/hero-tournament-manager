# Purpose: Centralized configuration for Flask app
# Notes:
# - Loads environment variables from .env
# - Defaults provided for dev/testing
import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "sqlite:///tournaments.db"  # fallback if .env missing
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-key")
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_TYPE = "Bearer"
    JWT_ALGORITHM = "HS256"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)  # more realistic than 1s

    # CORS / other app configs
    FRONTEND_URL = os.getenv("REACT_APP_API_URL", "http://localhost:3000")
