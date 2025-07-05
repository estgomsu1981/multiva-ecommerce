from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from .config import configure_cloudinary 
from . import crud, models, schemas
from .database import engine, get_db
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from app.core.config import settings
from . import security


import cloudinary
import cloudinary.uploader

configure_cloudinary()

# Esta línea es crucial: crea la tabla en tu base de datos si no existe.
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Multiva API")

origins = [
    "http://localhost:3000",          # <-- AÑADE ESTA LÍNEA (para desarrollo local del frontend)
    "https://multiva-api.onrender.com", # Tu API en producción (para la documentación)
    # En el futuro aquí irá la URL de Netlify
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Permite estos orígenes
    allow_credentials=True, # Permite cookies (si las usas en el futuro)
    allow_methods=["*"],    # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],    # Permite todos los encabezados
)

# Endpoint para CREAR una categoría
@app.post("/categories/", response_model=schemas.Category, tags=["Categories"])
def create_new_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    db_category = crud.get_category_by_name(db, name=category.nombre)
    if db_category:
        raise HTTPException(status_code=400, detail="Ya existe una categoría con este nombre")
    return crud.create_category(db=db, category=category)

# Endpoint para LEER todas las categorías
@app.get("/categories/", response_model=List[schemas.Category], tags=["Categories"])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    categories = crud.get_categories(db, skip=skip, limit=limit)
    return categories

# Endpoint para LEER una categoría específica por ID
@app.get("/categories/{category_id}", response_model=schemas.Category, tags=["Categories"])
def read_category(category_id: int, db: Session = Depends(get_db)):
    db_category = crud.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return db_category

# Endpoint para ACTUALIZAR una categoría
@app.put("/categories/{category_id}", response_model=schemas.Category, tags=["Categories"])
def update_existing_category(category_id: int, category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    db_category = crud.update_category(db, category_id=category_id, category_details=category)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return db_category

# Endpoint para BORRAR una categoría
@app.delete("/categories/{category_id}", response_model=schemas.Category, tags=["Categories"])
def delete_existing_category(category_id: int, db: Session = Depends(get_db)):
    db_category = crud.delete_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return db_category

@app.post("/upload", tags=["Utilities"])
async def upload_image(file: UploadFile = File(...)):
    """
    Este endpoint recibe un archivo y lo sube a Cloudinary.
    Devuelve la URL segura del archivo subido.
    """
    try:
        # Sube el archivo a Cloudinary
        result = cloudinary.uploader.upload(file.file, folder="multiva_ecommerce")
        # Obtenemos la URL segura del resultado
        secure_url = result.get("secure_url")
        return {"url": secure_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir el archivo: {str(e)}")
    
@app.post("/users/", response_model=schemas.User, tags=["Users"])
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Verificamos si ya existe un usuario con ese email o nombre de usuario
    if crud.get_user_by_email(db, email=user.email):
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado")
    if crud.get_user_by_username(db, username=user.usuario):
        raise HTTPException(status_code=400, detail="El nombre de usuario ya existe")
    return crud.create_user(db=db, user=user)

@app.post("/token", response_model=schemas.Token, tags=["Users"])
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Nombre de usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    access_token = security.create_access_token(
    data={
        "sub": user.usuario, 
        "nombre": user.nombre, 
        "rol": user.tipo_usuario  
    }, 
    expires_delta=access_token_expires
)
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/", response_model=List[schemas.User], tags=["Admin: Users"])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # TODO: Añadir protección para que solo los admins puedan acceder
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@app.put("/users/{user_id}", response_model=schemas.User, tags=["Admin: Users"])
def update_user_details(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(get_db)):
    # TODO: Añadir protección para que solo los admins puedan acceder
    updated_user = crud.update_user(db, user_id=user_id, user_update=user_update)
    if updated_user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return updated_user

@app.delete("/users/{user_id}", response_model=schemas.User, tags=["Admin: Users"])
def remove_user(user_id: int, db: Session = Depends(get_db)):
    # TODO: Añadir protección para que solo los admins puedan acceder
    deleted_user = crud.delete_user(db, user_id=user_id)
    if deleted_user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return deleted_user
