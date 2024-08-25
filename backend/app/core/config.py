from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./test.db"
    AUTH0_DOMAIN: str = "dev-mq6z36ctrsx6y3c0.eu.auth0.com"
    AUTH0_API_AUDIENCE: str = "http://localhost:8000"
    AUTH0_ISSUER: str = "https://dev-mq6z36ctrsx6y3c0.eu.auth0.com/"
    AUTH0_ALGORITHMS: str = "RS256"

    model_config = SettingsConfigDict(env_file=".env", extra="allow")


settings = Settings()