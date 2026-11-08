import os

# Ensure all tests run against lightning-fast in-memory SQLite regardless of collection order
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
