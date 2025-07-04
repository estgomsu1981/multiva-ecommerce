# backend/app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    # --- NUEVAS VARIABLES PARA TOKENS (JWT) ---
    SECRET_KEY: str = "una_clave_secreta_muy_larga_y_dificil_de_adivinar"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 # El token durará 30 minutos

    class Config:
        env_file = ".env"

settings = Settings()