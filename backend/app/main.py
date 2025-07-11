# --- IMPORTS ---
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
import httpx # Para hacer peticiones a APIs externas

# --- IMPORTACIONES DE LA APLICACIÓN ---
from . import crud, models, schemas, security
from .core.config import settings # Para variables de entorno
from .database import engine, get_db
from .config import configure_cloudinary # Importamos desde config.py


# --- INICIALIZACIÓN ---
configure_cloudinary()
models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="Multiva API")


# --- CONFIGURACIÓN DE CORS ---
origins = [
    "http://localhost:3000",
    "https://multiva-ecommerce.onrender.com",
    # Añade aquí la URL de tu frontend de Netlify cuando la tengas
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================================
# Endpoints de Autenticación y Usuarios
# ==========================================================================

@app.post("/token", response_model=schemas.Token, tags=["Auth"])
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, username=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Nombre de usuario o contraseña incorrectos", headers={"WWW-Authenticate": "Bearer"})
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={
            "sub": user.usuario, "nombre": user.nombre, "rol": user.tipo_usuario,
            "categoria_cliente": user.categoria_cliente, "email": user.email,
            "direccion": user.direccion, "telefono": user.telefono
        }, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model=schemas.User, tags=["Users"])
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, email=user.email):
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado")
    if crud.get_user_by_username(db, username=user.usuario):
        raise HTTPException(status_code=400, detail="El nombre de usuario ya existe")
    return crud.create_user(db=db, user=user)

@app.get("/users/me", response_model=schemas.User, tags=["Users"])
def read_users_me(current_user: models.User = Depends(security.get_current_user)):
    return current_user

@app.put("/users/me/contact", response_model=schemas.User, tags=["Users"])
def update_my_contact_info(contact_data: schemas.UserContactUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_user)):
    return crud.update_user(db, user_id=current_user.id, user_update=contact_data)


# ==========================================================================
# Endpoints de Chat (Proxy a OpenRouter)
# ==========================================================================

@app.post("/chat/completions", tags=["Chat"])
async def chat_with_bot(messages: List[Dict[str, Any]]):
    api_key = settings.OPENROUTER_API_KEY
    if not api_key:
        raise HTTPException(status_code=500, detail="API Key de OpenRouter no configurada.")
    
    async with httpx.AsyncClient() as client:
        try:
            # Aquí va el prompt del sistema que definimos antes
            system_prompt = { "role": "system", "content": "Sos Multiva Assist..." }
            full_messages = [system_prompt] + messages

            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                json={"model": "mistralai/mistral-7b-instruct", "messages": full_messages},
                headers={"Authorization": f"Bearer {api_key}"}
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


# ==========================================================================
# Endpoints Públicos (Categorías, Productos, etc.)
# ==========================================================================

@app.get("/categories/", response_model=List[schemas.Category], tags=["Public"])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_categories(db, skip=skip, limit=limit)

@app.get("/categories/{category_id}", response_model=schemas.Category, tags=["Public"])
def read_category(category_id: int, db: Session = Depends(get_db)):
    # ...
    
@app.get("/categories/{category_id}/products", response_model=List[schemas.Product], tags=["Public"])
def read_products_for_category(category_id: int, db: Session = Depends(get_db)):
    # ...

@app.get("/products/discounted", response_model=List[schemas.Product], tags=["Public"])
def read_discounted_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # ...

# ==========================================================================
# Endpoints de Administración (TODO: Protegerlos)
# ==========================================================================
# ... (Aquí irían los endpoints de GET/POST/PUT/DELETE para usuarios, productos y categorías) ...

# ==========================================================================
# Endpoints de Utilidades
# ==========================================================================

@app.post("/upload", tags=["Utilities"])
async def upload_image(file: UploadFile = File(...)):
    # ... (código de subida)

# ... (El resto de tus endpoints, como los de /configuracion) ...