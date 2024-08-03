# tests/auth/test_rate_limiting.py

import pytest
from datetime import timedelta
from stojanovic_one.auth.rate_limiting import RateLimiter

def test_rate_limiter():
    limiter = RateLimiter(max_attempts=3, time_window=timedelta(minutes=5))
    
    # First 3 attempts should not be rate limited
    for _ in range(3):
        assert not limiter.is_rate_limited("testuser")
    
    # 4th attempt should be rate limited
    assert limiter.is_rate_limited("testuser")

def test_rate_limiter_different_users():
    limiter = RateLimiter(max_attempts=3, time_window=timedelta(minutes=5))
    
    # 3 attempts for user1
    for _ in range(3):
        assert not limiter.is_rate_limited("user1")
    
    # user2 should not be rate limited
    assert not limiter.is_rate_limited("user2")

    # user1 should be rate limited
    assert limiter.is_rate_limited("user1")

@pytest.mark.parametrize("username", ["user1", "user2", "user3"])
def test_rate_limiter_multiple_users(username):
    limiter = RateLimiter(max_attempts=3, time_window=timedelta(minutes=5))
    
    # First 3 attempts should not be rate limited
    for _ in range(3):
        assert not limiter.is_rate_limited(username)
    
    # 4th attempt should be rate limited
    assert limiter.is_rate_limited(username)