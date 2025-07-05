import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Carga las variables del archivo .env del directorio actual de trabajo.
# Como ejecutas "uvicorn" desde "backend/", buscará "backend/.env".
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Una pequeña verificación para dar un error más claro si la URL no se encuentra
if DATABASE_URL is None:
    raise ValueError("No se encontró la variable de entorno DATABASE_URL. Asegúrate de que tu archivo .env está configurado correctamente.")

engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_recycle=300,  # Recicla conexiones cada 300 segundos (5 minutos)
    pool_pre_ping=True, # Verifica si la conexión está viva antes de usarla
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Función para obtener una sesión de DB en cada petición a la API
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()