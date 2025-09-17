# File: backend/blocklist.py
# Purpose: Global JWT blocklist for revoked tokens.
# Notes:
# - Shared between app.py and auth.py to avoid circular imports.

jwt_blocklist = set()
