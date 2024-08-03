# src/stojanovic_one/auth/rate_limiting.py

from collections import defaultdict
from datetime import datetime, timedelta

class RateLimiter:
    def __init__(self, max_attempts=5, time_window=timedelta(minutes=15)):
        self.max_attempts = max_attempts
        self.time_window = time_window
        self.attempts = defaultdict(list)

    def is_rate_limited(self, username):
        now = datetime.now()
        self.attempts[username] = [t for t in self.attempts[username] if now - t < self.time_window]
        if len(self.attempts[username]) >= self.max_attempts:
            return True
        self.attempts[username].append(now)
        return False