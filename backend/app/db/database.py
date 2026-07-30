from app.config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# pool_pre_ping=True checks the connection before using it and reconnects if needed.
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=False,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
