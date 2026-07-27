from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    GOOGLE_API_KEY: str

    QDRANT_URL: str

    QDRANT_API_KEY: str

    COLLECTION_NAME: str

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()  # pyright: ignore[reportCallIssue]
