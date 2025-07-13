# --- Imports de Librerías ---
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
import json
import httpx
from typing import List, Dict, Any

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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
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
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El correo electrónico ya está registrado")
    if crud.get_user_by_username(db, username=user.usuario):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El nombre de usuario ya existe")
    return crud.create_user(db=db, user=user)

@app.get("/users/me", response_model=schemas.User, tags=["Users"])
def read_users_me(current_user: models.User = Depends(security.get_current_user)):
    return current_user

@app.put("/users/me/contact", response_model=schemas.User, tags=["Users"])
def update_my_contact_info(
    contact_data: schemas.UserContactUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(security.get_current_user)
):
    return crud.update_user(db, user_id=current_user.id, user_update=contact_data)


# ==========================================================================
# Endpoints de Chat (Proxy a OpenRouter)
# ==========================================================================

# en main.py

@app.post("/chat/completions", tags=["Chat"])
async def chat_with_bot(messages: List[Dict[str, Any]], db: Session = Depends(get_db)):
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise HTTPException(status_code=500, detail="API Key de Groq no configurada.")
    
    # Obtenemos el último mensaje del usuario para decidir si buscamos
    user_query = messages[-1]["content"] if messages else ""
    
    # --- LÓGICA DE BÚSQUEDA PRIMERO ---
    search_results = []
    # Palabras clave que activan una búsqueda en la base de datos
    keywords = ["producto", "cemento", "martillo", "alicate", "herramienta", "precio", "cuánto cuesta", "tienen", "venden", "ofrecen"]
    
    # Si el mensaje del usuario contiene alguna palabra clave, activamos la búsqueda
    if any(keyword in user_query.lower() for keyword in keywords):
        print(f"--- Búsqueda activada. Buscando: '{user_query}' ---")
        search_results = crud.search_products_by_term(db, search_term=user_query)

    # --- CONSTRUCCIÓN DEL PROMPT PARA UNA SOLA LLAMADA ---
    active_prompt_object = crud.get_active_prompt(db)
    
    # Creamos un contexto de búsqueda para el prompt
    if search_results:
        contexto_busqueda = "Resultados de la base de datos: " + json.dumps(search_results, ensure_ascii=False)
    else:
        # Si no hay resultados, el contexto estará vacío, y el prompt del sistema lo manejará
        contexto_busqueda = "Resultados de la base de datos: []"

    # Prompt del sistema actualizado
    system_prompt_content = f"""
    {active_prompt_object.prompt_text}
    
    --- CONTEXTO DE BÚSQUEDA DE PRODUCTOS ---
    {contexto_busqueda}
    --- FIN DEL CONTEXTO ---

    Basándote ÚNICAMENTE en el CONTEXTO DE BÚSQUEDA anterior, responde a la última pregunta del usuario.
    Si el contexto está vacío o no contiene información relevante para la pregunta, responde amablemente que no encontraste ese producto o información. No inventes productos ni precios.
    """
    
    system_prompt = {"role": "system", "content": system_prompt_content}
    full_messages = [system_prompt] + messages
    
    async with httpx.AsyncClient() as client:
        try:
            # --- HACEMOS UNA ÚNICA Y DIRECTA LLAMADA A GROQ ---
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                json={
                    "model": "llama-3.1-8b-instant",
                    "messages": full_messages,
                }, # Ya no necesitamos 'tools' ni 'tool_choice'
                headers={"Authorization": f"Bearer {api_key}"},
                timeout=30.0
            )
            response.raise_for_status()
            
            # Devolvemos la respuesta directamente
            return response.json()
                
        except httpx.HTTPStatusError as e:
            print(f"Error HTTP de Groq: {e.response.status_code} - {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail=f"Error de la API externa: {e.response.text}")
        except Exception as e:
            print(f"Error en el flujo del chat: {e}")
            raise HTTPException(status_code=500, detail="Error procesando la solicitud del chat.")

# ==========================================================================
# Endpoints Públicos (Categorías, Productos)
# ==========================================================================

@app.get("/categories/", response_model=List[schemas.Category], tags=["Public"])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_categories(db, skip=skip, limit=limit)

@app.get("/categories/{category_id}", response_model=schemas.Category, tags=["Public"])
def read_category(category_id: int, db: Session = Depends(get_db)):
    db_category = crud.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")
    return db_category

@app.get("/categories/{category_id}/products", response_model=List[schemas.Product], tags=["Public"])
def read_products_for_category(category_id: int, db: Session = Depends(get_db)):
    if not crud.get_category(db, category_id=category_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoría no encontrada")
    return crud.get_products_by_category(db, category_id=category_id)

@app.get("/products/discounted", response_model=List[schemas.Product], tags=["Public"])
def read_discounted_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_discounted_products(db, skip=skip, limit=limit)


# ==========================================================================
# Endpoints de Administración (TODO: Protegerlos)
# ==========================================================================

@app.get("/admin/users", response_model=List[schemas.User], tags=["Admin"])
def admin_read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_users(db, skip=skip, limit=limit)

# ... (Aquí irían el resto de endpoints de administración)


# ==========================================================================
# Endpoints de Utilidades
# ==========================================================================

@app.post("/upload", tags=["Utilities"])
async def upload_image(file: UploadFile = File(...)):
    try:
        result = security.upload_to_cloudinary(file.file, "multiva_ecommerce") # Asumiendo que la lógica está en security.py
        return {"url": result.get("secure_url")}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error al subir el archivo: {str(e)}")

@app.get("/configuracion/{clave}", response_model=schemas.Configuracion, tags=["Configuración"])
def read_configuracion(clave: str, db: Session = Depends(get_db)):
    config = crud.get_configuracion(db, clave=clave)
    if config is None:
        return crud.set_configuracion(db, clave=clave, valor="0")
    return config

@app.put("/configuracion/{clave}", response_model=schemas.Configuracion, tags=["Configuración"])
def update_configuracion(clave: str, valor: str, db: Session = Depends(get_db)):
    return crud.set_configuracion(db, clave=clave, valor=valor)

@app.get("/admin/prompt", response_model=schemas.PromptHistorial, tags=["Admin: Prompt"])
def get_current_prompt(db: Session = Depends(get_db)):
    # TODO: Proteger esta ruta
    return crud.get_active_prompt(db)

@app.put("/admin/prompt", response_model=schemas.PromptHistorial, tags=["Admin: Prompt"])
def set_current_prompt(
    prompt_data: schemas.PromptHistorialBase,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    prompt_to_create = schemas.PromptHistorialCreate(
        prompt_text=prompt_data.prompt_text,
        modificado_por=current_user.usuario
    )
    return crud.create_new_prompt(db, prompt_data=prompt_to_create)

@app.get("/admin/prompt/history", response_model=List[schemas.PromptHistorial], tags=["Admin: Prompt"])
def get_prompt_history_list(db: Session = Depends(get_db)):
    # TODO: Proteger esta ruta
    return crud.get_prompt_history(db)

@app.get("/tools/search_products", tags=["Tools"])
def search_products_tool(q: str, db: Session = Depends(get_db)):
    """
    Herramienta de búsqueda de productos para ser consumida por el LLM.
    Recibe un término de búsqueda 'q'.
    """
    results = crud.search_products_by_term(db, search_term=q)
    return {"results": results}