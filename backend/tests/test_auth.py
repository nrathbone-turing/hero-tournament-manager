# File: backend/tests/test_auth.py
# Purpose: Tests for user authentication (signup, login, logout, protected routes)
# Notes:
# - Validates JWT auth flow using flask-jwt-extended
# - Ensures protected routes require valid tokens
# - Confirms logout response is returned (but JWT revocation not enforced yet)

import pytest


def test_signup_creates_user(client):
    resp = client.post("/signup", json={
        "username": "alice",
        "email": "alice@example.com",
        "password": "password123"
    })
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["username"] == "alice"
    assert "password" not in data  # password should not be returned


def test_login_returns_token(client):
    # First signup
    client.post("/signup", json={
        "username": "bob",
        "email": "bob@example.com",
        "password": "secret"
    })

    # Then login
    resp = client.post("/login", json={
        "email": "bob@example.com",
        "password": "secret"
    })
    assert resp.status_code == 200
    data = resp.get_json()
    token = data.get("access_token") or data.get("token")
    assert token, f"Login did not return a token, got {data}"


def test_protected_route_requires_auth(client):
    resp = client.get("/protected")
    assert resp.status_code in (401, 422)  # JWT will reject missing/invalid auth


def test_protected_route_with_auth(client):
    # signup + login
    client.post("/signup", json={
        "username": "cathy",
        "email": "cathy@example.com",
        "password": "pass"
    })
    login_resp = client.post("/login", json={
        "email": "cathy@example.com",
        "password": "pass"
    })
    data = login_resp.get_json()
    token = data.get("access_token") or data.get("token")
    assert token, f"Login did not return a token, got {data}"

    # send token in header
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/protected", headers=headers)
    assert resp.status_code == 200, resp.get_json()
    assert "message" in resp.get_json()


def test_logout_returns_ok(client):
    client.post("/signup", json={
        "username": "dave",
        "email": "dave@example.com",
        "password": "mypw"
    })
    login_resp = client.post("/login", json={
        "email": "dave@example.com",
        "password": "mypw"
    })
    data = login_resp.get_json()
    token = data.get("access_token") or data.get("token")
    assert token, f"Login did not return a token, got {data}"

    headers = {"Authorization": f"Bearer {token}"}
    logout_resp = client.delete("/logout", headers=headers)
    assert logout_resp.status_code == 200
    assert "message" in logout_resp.get_json()
