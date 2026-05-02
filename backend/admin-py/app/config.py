from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    admin_py_session_secret: str = "change-me-in-production"
    admin_py_app_name: str = "Aura Backoffice"
    admin_py_secure_cookies: bool = False

    @property
    def sqlalchemy_url(self) -> str:
        url = self.database_url
        if url.startswith("postgresql://"):
            url = "postgresql+psycopg" + url[len("postgresql"):]
        return url

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()  # type: ignore[call-arg]
