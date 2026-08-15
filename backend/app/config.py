from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    GOOGLE_API_KEY: str
    QDRANT_URL: str
    QDRANT_API_KEY: str
    COLLECTION_NAME: str
    DATABASE_URL: str
    FRONTEND_URL: str

    R2_ACCOUNT_ID: str
    R2_ACCESS_KEY_ID: str
    R2_SECRET_ACCESS_KEY: str

    R2_BUCKET: str
    R2_PUBLIC_URL: str

    UPSTASH_REDIS_URL: str
    REDIS_PREFIX: str = "chatwpdf"

    MAX_UPLOAD_SIZE_MB: int = 30

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()  # pyright: ignore[reportCallIssue]
