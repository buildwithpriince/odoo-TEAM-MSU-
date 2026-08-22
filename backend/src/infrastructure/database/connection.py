# -*- coding: utf-8 -*-
import os
import urllib.parse
from pathlib import Path
from typing import Generator
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session

# Load environment configuration explicitly from backend/.env
current_file = Path(__file__).resolve()
backend_env = current_file.parents[3] / ".env"
root_env = current_file.parents[4] / ".env"

if backend_env.exists():
    load_dotenv(dotenv_path=backend_env, override=True)
elif root_env.exists():
    load_dotenv(dotenv_path=root_env, override=True)
else:
    load_dotenv(override=True)

raw_url = os.getenv("DATABASE_URL")

host = os.getenv("POSTGRES_HOST", "aws-0-ap-northeast-2.pooler.supabase.com")
port = os.getenv("POSTGRES_PORT", "5432")
db_name = os.getenv("POSTGRES_DB", "postgres")
user = os.getenv("POSTGRES_USER", "postgres.gbfccbsmyxtpjgppwbec")
password = os.getenv("POSTGRES_PASSWORD", "")

if raw_url and "postgresql" in raw_url:
    db_url = raw_url
elif password:
    safe_pass = urllib.parse.quote_plus(password)
    db_url = f"postgresql+psycopg2://{user}:{safe_pass}@{host}:{port}/{db_name}?sslmode=require"
else:
    db_url = "sqlite:///globetrotter.db"

# Fallback to file-based persistent database if remote PostgreSQL fails authentication
try:
    connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}
    test_engine = create_engine(db_url, connect_args=connect_args, pool_pre_ping=True)
    with test_engine.connect() as conn:
        pass
    engine = test_engine
except Exception:
    db_url = "sqlite:///globetrotter.db"
    engine = create_engine(db_url, connect_args={"check_same_thread": False}, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency providing transactional database session scope."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initializes database tables according to declarative metadata models."""
    Base.metadata.create_all(bind=engine)
