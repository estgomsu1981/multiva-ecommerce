# --- Imports de Librerías ---
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, status
from fastapi.responses import JSONResponse 
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
import json
import httpx

# --- Imports de la Aplicación ---
from . import crud, models, schemas, security
from .core.config import settings
from .database import engine, get_db
from .config import configure_cloudinary

# --- Inicialización de la Aplicación ---
configure_cloudinary()
models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="Multiva API")

# --- Configuración de CORS ---
origins = [
    "http://localhost:3000",
    "https://multiva-ecommerce.onrender.com",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================================
# Endpoints de Autenticación y Usuarios (Públicos)
# ==========================================================================

@app.post("/token", response_model=schemas.Token, tags=["Auth"])
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, username=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Nombre de usuario o contraseña incorrectos", headers={"WWW-Authenticate": "Bearer"})
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {
        "sub": user.usuario, "nombre": user.nombre, "rol": user.tipo_usuario,
        "categoria_cliente": user.categoria_cliente, "email": user.email,
        "direccion": user.direccion, "telefono": user.telefono
    }
    access_token = security.create_access_token(data=token_data, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model=schemas.User, tags=["Users"])
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, email=user.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El correo electrónico ya está registrado")
    if crud.get_user_by_username(db, username=user.usuario):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El nombre de usuario ya existe")
    return crud.create_user(db=db, user=user)

@app.get("/users/me", response_model=schemas.User, tags=["Users"])
def read_users_me(current_user: models.User = Depends(security.get_current_user)):
    return current_user

@app.put("/users/me/contact", response_model=schemas.User, tags=["Users"])
def update_my_contact_info(contact_data: schemas.UserContactUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_user)):
    return crud.update_user(db, user_id=current_user.id, user_update=contact_data)

# ==========================================================================
# Endpoints Públicos (Catálogo y Productos)
# ==========================================================================

@app.get("/categories/", response_model=List[schemas.Category], tags=["Public"])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_categories(db, skip=skip, limit=limit)

@app.get("/categories/{category_id}/products", response_model=List[schemas.Product], tags=["Public"])
def read_products_for_category(category_id: int, db: Session = Depends(get_db)):
    if not crud.get_category(db, category_id=category_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")
    return crud.get_products_by_category(db, category_id=category_id)

@app.get("/products/discounted", response_model=List[schemas.Product], tags=["Public"])
def read_discounted_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_discounted_products(db, skip=skip, limit=limit)

# ==========================================================================
# Endpoints del Chatbot
# ==========================================================================

@app.post("/chat/completions", tags=["Chat"])
async def chat_with_bot(messages: List[Dict[str, Any]], db: Session = Depends(get_db)):
    # ... (toda la lógica del chat que ya funciona)
    # He omitido el cuerpo por brevedad, pero debe ser el que ya tienes.

# ==========================================================================
# Endpoints de Administración (TODO: Protegerlos)
# ==========================================================================

# --- GESTIÓN DE USUARIOS (ADMIN) ---
@app.get("/admin/users", response_model=List[schemas.User], tags=["Admin"])
def admin_read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_users(db, skip=skip, limit=limit)

@app.put("/admin/users/{user_id}", response_model=schemas.User, tags=["Admin"])
def admin_update_user(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(get_db)):
    updated_user = crud.update_user(db, user_id=user_id, user_update=user_update)
    if updated_user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return updated_user

@app.delete("/admin/users/{user_id}", response_model=schemas.User, tags=["Admin"])
def admin_delete_user(user_id: int, db: Session = Depends(get_db)):
    deleted_user = crud.delete_user(db, user_id=user_id)
    if deleted_user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return deleted_user

# --- GESTIÓN DE PRODUCTOS (ADMIN) ---
@app.get("/admin/products", response_model=List[schemas.Product], tags=["Admin"])
def admin_read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_products(db, skip=skip, limit=limit)

@app.post("/admin/products", response_model=schemas.Product, tags=["Admin"])
def admin_create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db=db, product=product)

@app.put("/admin/products/{product_id}", response_model=schemas.Product, tags=["Admin"])
def admin_update_product(product_id: int, product: schemas.ProductCreate, db: Session = Depends(get_db)):
    updated_product = crud.update_product(db, product_id=product_id, product_update=product)
    if updated_product is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return updated_product

@app.delete("/admin/products/{product_id}", response_model=schemas.Product, tags=["Admin"])
def admin_delete_product(product_id: int, db: Session = Depends(get_db)):
    deleted_product = crud.delete_product(db, product_id=product_id)
    if deleted_product is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return deleted_product

# --- GESTIÓN DE FAQ (ADMIN) ---
@app.get("/admin/faq/pending", response_model=List[schemas.Faq], tags=["Admin"])
def get_pending_questions(db: Session = Depends(get_db)):
    return crud.get_pending_faqs(db)

@app.put("/admin/faq/{faq_id}/answer", response_model=schemas.Faq, tags=["Admin"])
def answer_pending_question(faq_id: int, respuesta: str, db: Session = Depends(get_db)):
    answered_faq = crud.answer_faq(db, faq_id=faq_id, respuesta=respuesta)
    if not answered_faq:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    return answered_faq

@app.delete("/admin/faq/{faq_id}", response_model=schemas.Faq, tags=["Admin"])
def delete_question(faq_id: int, db: Session = Depends(get_db)):
    deleted_faq = crud.delete_faq(db, faq_id=faq_id)
    if not deleted_faq:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    return deleted_faq

# --- GESTIÓN DE PROMPTS (ADMIN) ---
# ... (Los endpoints de /admin/prompt y /admin/prompt/history que ya tienes)

# ==========================================================================
# Endpoints de Utilidades y Configuración
# ==========================================================================
# ... (Los endpoints de /upload y /configuracion que ya tienes)