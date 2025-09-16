# backend/tests/test_auth.py
# Tests for user authentication (signup, login, logout, protected routes)

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
    assert "access_token" in data or "session" in data


def test_protected_route_requires_auth(client):
    resp = client.get("/protected")
    assert resp.status_code == 401


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
    token = login_resp.get_json().get("access_token")

    # send token in header
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/protected", headers=headers)
    assert resp.status_code == 200
    assert "message" in resp.get_json()


def test_logout_invalidates_session(client):
    client.post("/signup", json={
        "username": "dave",
        "email": "dave@example.com",
        "password": "mypw"
    })
    login_resp = client.post("/login", json={
        "email": "dave@example.com",
        "password": "mypw"
    })
    token = login_resp.get_json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # logout
    logout_resp = client.delete("/logout", headers=headers)
    assert logout_resp.status_code == 200

    # try to access protected again
    resp = client.get("/protected", headers=headers)
    assert resp.status_code == 401
