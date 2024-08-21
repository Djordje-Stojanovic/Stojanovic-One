import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.auth import create_access_token, get_password_hash
from app.models.user import User
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.config import settings

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


def create_test_token(user: User):
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )


def test_register_user(test_db):
    response = client.post(
        "/auth/register", json={"email": "test@example.com", "password": "testpassword"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert "token_type" in response.json()


def test_login_user(test_db):
    user = create_test_user(test_db, "test@example.com", "testpassword")
    response = client.post(
        "/auth/token", data={"username": "test@example.com", "password": "testpassword"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert "token_type" in response.json()


def test_get_user_profile(test_db):
    user = create_test_user(test_db, "test@example.com", "testpassword")
    token = create_test_token(user)
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/users/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"


def test_update_user_profile(test_db):
    user = create_test_user(test_db, "test@example.com", "testpassword")
    token = create_test_token(user)
    headers = {"Authorization": f"Bearer {token}"}
    response = client.put(
        "/users/me", json={"first_name": "Test", "last_name": "User"}, headers=headers
    )
    assert response.status_code == 200
    assert response.json()["first_name"] == "Test"
    assert response.json()["last_name"] == "User"


def test_delete_user_account(test_db):
    user = create_test_user(test_db, "test@example.com", "testpassword")
    token = create_test_token(user)
    headers = {"Authorization": f"Bearer {token}"}
    response = client.delete("/users/me", headers=headers)
    assert response.status_code == 204
