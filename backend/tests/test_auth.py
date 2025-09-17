# File: backend/tests/test_auth.py
# Purpose: Tests for user authentication (signup, login, logout, protected routes)
# Notes:
# - Validates JWT auth flow using flask-jwt-extended
# - Ensures protected routes require valid tokens
# - Confirms logout response is returned (but JWT revocation not enforced yet)


def test_signup_creates_user(client):
    resp = client.post(
        "/signup",
        json={
            "username": "alice",
            "email": "alice@example.com",
            "password": "password123",
        },
    )
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["username"] == "alice"
    assert "password" not in data  # password should not be returned


def test_login_returns_token(client):
    # First signup
    client.post(
        "/signup",
        json={"username": "bob", "email": "bob@example.com", "password": "secret"},
    )

    # Then login
    resp = client.post(
        "/login", json={"email": "bob@example.com", "password": "secret"}
    )
    assert resp.status_code == 200
    data = resp.get_json()
    token = data.get("access_token") or data.get("token")
    assert token, f"Login did not return a token, got {data}"


def test_protected_route_requires_auth(client):
    resp = client.get("/protected")
    assert resp.status_code in (401, 422)  # JWT will reject missing/invalid auth


def test_protected_route_with_auth(client):
    # signup + login
    client.post(
        "/signup",
        json={"username": "cathy", "email": "cathy@example.com", "password": "pass"},
    )
    login_resp = client.post(
        "/login", json={"email": "cathy@example.com", "password": "pass"}
    )
    data = login_resp.get_json()
    token = data.get("access_token") or data.get("token")
    assert token, f"Login did not return a token, got {data}"

    # send token in header
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/protected", headers=headers)
    assert resp.status_code == 200, resp.get_json()
    assert "message" in resp.get_json()


def test_logout_returns_ok(client):
    client.post(
        "/signup",
        json={"username": "dave", "email": "dave@example.com", "password": "mypw"},
    )
    login_resp = client.post(
        "/login", json={"email": "dave@example.com", "password": "mypw"}
    )
    data = login_resp.get_json()
    token = data.get("access_token") or data.get("token")
    assert token, f"Login did not return a token, got {data}"

    headers = {"Authorization": f"Bearer {token}"}
    logout_resp = client.delete("/logout", headers=headers)
    assert logout_resp.status_code == 200
    assert "message" in logout_resp.get_json()


def test_login_with_wrong_password(client, session):
    # create user
    from backend.models import User
    user = User(username="edgeuser", email="edge@example.com")
    user.set_password("correctpass")
    session.add(user)
    session.commit()

    resp = client.post("/login", json={"email": "edge@example.com", "password": "wrongpass"})
    assert resp.status_code == 401
    assert "Invalid credentials" in resp.get_json()["error"]


def test_signup_with_duplicate_email(client, session):
    from backend.models import User
    user = User(username="dup", email="dup@example.com")
    user.set_password("pass")
    session.add(user)
    session.commit()

    resp = client.post("/signup", json={"username": "dup2", "email": "dup@example.com", "password": "pass"})
    assert resp.status_code == 400
    assert "Email already exists" in resp.get_json()["error"]


def test_protected_route_with_invalid_token(client):
    headers = {"Authorization": "Bearer not.a.real.token"}
    resp = client.get("/protected", headers=headers)
    assert resp.status_code in (401, 422)
    msg = resp.get_json().get("msg", "").lower()
    assert any(word in msg for word in ["invalid", "token", "segment"])

def test_delete_event_requires_auth(client, create_event):
    event = create_event()
    resp = client.delete(f"/events/{event.id}")
    assert resp.status_code == 401


def test_create_entrant_with_auth(client, create_event, auth_header):
    event = create_event()
    data = {"name": "HeroEdge", "alias": "Edgecase", "event_id": event.id}
    resp = client.post("/entrants", json=data, headers=auth_header)
    assert resp.status_code == 201
    body = resp.get_json()
    assert body["name"] == "HeroEdge"
    assert body["alias"] == "Edgecase"
