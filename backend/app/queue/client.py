from redis import Redis

from app.config import settings

REDIS_PREFIX = "chatwpdf"

INGESTION_QUEUE_NAME = f"{REDIS_PREFIX}:queue:ingestion"


redis_connection = Redis.from_url(
    settings.UPSTASH_REDIS_URL,
    decode_responses=True,
)
