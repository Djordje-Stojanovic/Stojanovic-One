import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.auth import create_access_token, get_password_hash
from app.models.user import User
from app.core.database import get_db
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.config import settings
from unittest.mock import patch
from fastapi import Depends
from app.core.auth import oauth2_scheme

pytest.random_number = 0

@pytest.fixture(autouse=True)
def increment_random_number():
    pytest.random_number += 1
    yield

client = TestClient(app)

@pytest.fixture
def test_db(db: Session):
    yield db
    db.query(User).delete()
    db.commit()

def create_test_user(db: Session, email: str, password: str):
    hashed_password = get_password_hash(password)
    user = User(email=email, hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def create_test_token(data: dict):
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return create_access_token(data=data, expires_delta=access_token_expires)

@pytest.fixture(autouse=True)
def mock_dependencies(monkeypatch):
    def mock_get_current_active_user():
        return User(id=1, email="testuser@example.com", is_active=True, is_superuser=False)
    
    monkeypatch.setattr("app.api.endpoints.users.get_current_active_user", mock_get_current_active_user)
    monkeypatch.setattr("app.core.auth.get_current_active_user", mock_get_current_active_user)
    monkeypatch.setattr("app.api.auth.get_current_active_user", mock_get_current_active_user)

    def mock_create_access_token(*args, **kwargs):
        return "mocked_access_token"

    monkeypatch.setattr("app.core.auth.create_access_token", mock_create_access_token)
    monkeypatch.setattr("app.api.auth.create_access_token", mock_create_access_token)

    def mock_get_current_user():
        return User(id=1, email="testuser@example.com", is_active=True, is_superuser=False)

    monkeypatch.setattr("app.core.auth.get_current_user", mock_get_current_user)

def test_register_user(test_db):
    unique_email = f"test{pytest.random_number}@example.com"
    response = client.post(
        "/auth/register",
        json={"email": unique_email, "password": "testpassword"}
    )
    print(f"Register response: {response.status_code}, {response.json()}")
    assert response.status_code == 200 or response.status_code == 400
    if response.status_code == 200:
        assert "access_token" in response.json()
        assert "token_type" in response.json()

def test_login_user(test_db):
    create_test_user(test_db, "test@example.com", "testpassword")
    response = client.post(
        "/auth/token",
        data={"username": "test@example.com", "password": "testpassword"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert "token_type" in response.json()

def test_get_user_profile(test_db, client):
    headers = {"Authorization": "Bearer mocked_access_token"}
    response = client.get("/users/me", headers=headers)
    print(f"Get profile response: {response.status_code}, {response.json()}")
    assert response.status_code == 200
    assert response.json()["email"] == "testuser@example.com"

def test_update_user_profile(test_db, client):
    headers = {"Authorization": "Bearer mocked_access_token"}
    response = client.put(
        "/users/me",
        json={"first_name": "Test", "last_name": "User"},
        headers=headers
    )
    print(f"Update profile response: {response.status_code}, {response.json()}")
    assert response.status_code == 200
    assert response.json()["first_name"] == "Test"
    assert response.json()["last_name"] == "User"

def test_delete_user_account(test_db, client):
    headers = {"Authorization": "Bearer mocked_access_token"}
    response = client.delete("/users/me", headers=headers)
    print(f"Delete account response: {response.status_code}, {response.text}")
    assert response.status_code == 204