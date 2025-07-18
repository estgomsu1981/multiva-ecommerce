# --- Imports de Librerías ---
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, status, Body
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
    "http://localhost:8888",
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
def update_my_contact_info(
    contact_data: schemas.UserContactUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(security.get_current_user)
):
    return crud.update_user(db, user_id=current_user.id, user_update=contact_data)

# ==========================================================================
# Endpoints Públicos (Catálogo y Productos)
# ==========================================================================

@app.get("/categories/", response_model=List[schemas.Category], tags=["Public"])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_categories(db, skip=skip, limit=limit)

@app.get("/categories/{category_id}", response_model=schemas.Category, tags=["Public"])
def read_category(category_id: int, db: Session = Depends(get_db)):
    db_category = crud.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
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
# Endpoints del Chatbot (LÓGICA COMPLETA RESTAURADA)
# ==========================================================================

@app.post("/chat/completions", tags=["Chat"])
async def chat_with_bot(messages: List[Dict[str, Any]], db: Session = Depends(get_db)):
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise HTTPException(status_code=500, detail="API Key de Groq no configurada.")
    
    user_query = messages[-1]["content"] if messages else ""

    # --- OBTENER TODA LA BASE DE CONOCIMIENTO (FAQ) ---
    all_faqs = crud.get_all_faqs(db)
    faq_knowledge_base = "\n".join([f"- Pregunta: {faq.pregunta}\n  Respuesta: {faq.respuesta}" for faq in all_faqs])
   
    # --- LÓGICA DE BÚSQUEDA DE PRODUCTOS (SI APLICA) ---
    search_results = []
    keywords_busqueda = ["producto", "cemento", "martillo", "alicate", "herramienta", "mueble", "eléctrico", "piso", "cocina", "tienen", "venden", "cuánto cuesta", "precio de"]
    if any(keyword in user_query.lower() for keyword in keywords_busqueda):
        print(f"--- Búsqueda de productos activada para: '{user_query}' ---")
        search_results = crud.search_products_by_term(db, search_term=user_query)
        
    # Formatear resultados de productos para el contexto
    if search_results:
        contexto_productos = "Resultados de la búsqueda de productos: " + json.dumps(search_results, ensure_ascii=False)
    else:
        contexto_productos = "Resultados de la búsqueda de productos: [No se encontraron productos para esta búsqueda]"

    # --- CONSTRUCCIÓN DEL PROMPT FINAL ---

    
     #━━━━━━━━━━  BASE DE CONOCIMIENTO  ━━━━━━━━━━
    active_prompt_object = crud.get_active_prompt(db)
    base_prompt_text = active_prompt_object.prompt_text
    
    final_system_prompt = f"""
    {base_prompt_text}

    ━━━━━━━━━━  PREGUNTAS FRECUENTES  ━━━━━━━━━━
    {faq_knowledge_base}
    
    --- CONTEXTO DE BÚSQUEDA DE PRODUCTOS ---
    {contexto_productos}
    --- FIN DEL CONTEXTO ---

    INSTRUCCIONES FINALES:
    1. Responde a la última pregunta del usuario.
    2. Si la pregunta es general, usa PREGUNTAS FRECUENTES y la BASE DE CONOCIMIENTO para responder.
    3. Si la pregunta es sobre un producto, usa el CONTEXTO DE BÚSQUEDA DE PRODUCTOS.
    4. Basa tu respuesta ESTRICTAMENTE en la información proporcionada. No inventes datos.
    """
    
    system_prompt = {"role": "system", "content": final_system_prompt}
    full_messages = [system_prompt] + messages
    print(f"--- FULL MESGE {full_messages}' ---")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                json={"model": "llama-3.1-8b-instant", "messages": full_messages},
                headers={"Authorization": f"Bearer {api_key}"}
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error en el flujo del chat: {e}")
            raise HTTPException(status_code=500, detail="Error procesando la solicitud del chat.")
        
# ==========================================================================
# Endpoints de Administración (TODO: Protegerlos)
# ==========================================================================

# --- Admin: Productos ---
@app.get("/products/", response_model=List[schemas.Product], tags=["Admin: Products"])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_products(db, skip=skip, limit=limit)

@app.post("/products/", response_model=schemas.Product, tags=["Admin: Products"])
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db, product=product)

@app.put("/products/{product_id}", response_model=schemas.Product, tags=["Admin: Products"])
def update_product(product_id: int, product: schemas.ProductUpdate, db: Session = Depends(get_db)):
    updated = crud.update_product(db, product_id=product_id, product_update=product)
    if not updated: raise HTTPException(404, "Producto no encontrado")
    return updated

@app.delete("/products/{product_id}", response_model=schemas.Product, tags=["Admin: Products"])
def delete_product(product_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_product(db, product_id=product_id)
    if not deleted: raise HTTPException(404, "Producto no encontrado")
    return deleted

# --- Admin: Categorías ---
@app.post("/categories/", response_model=schemas.Category, tags=["Admin: Categories"])
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    return crud.create_category(db, category=category)

@app.put("/categories/{category_id}", response_model=schemas.Category, tags=["Admin: Categories"])
def update_category(category_id: int, category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    updated = crud.update_category(db, category_id=category_id, category_details=category)
    if not updated: raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return updated

@app.delete("/categories/{category_id}", response_model=schemas.Category, tags=["Admin: Categories"])
def delete_category(category_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_category(db, category_id=category_id)
    if not deleted: raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return deleted

# --- Admin: Usuarios ---
@app.get("/users/", response_model=List[schemas.User], tags=["Admin: Users"])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_users(db, skip=skip, limit=limit)

@app.put("/users/{user_id}", response_model=schemas.User, tags=["Admin: Users"])
def update_user(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(get_db)):
    updated = crud.update_user(db, user_id=user_id, user_update=user_update)
    if not updated: raise HTTPException(404, "Usuario no encontrado")
    return updated

@app.delete("/users/{user_id}", response_model=schemas.User, tags=["Admin: Users"])
def delete_user(user_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_user(db, user_id=user_id)
    if not deleted: raise HTTPException(404, "Usuario no encontrado")
    return deleted

# --- Admin: FAQ ---
@app.get("/admin/faq/pending", response_model=List[schemas.Faq], tags=["Admin"])
def get_pending_questions(db: Session = Depends(get_db)):
    return crud.get_pending_faqs(db)

@app.put("/admin/faq/{faq_id}/answer", response_model=schemas.Faq, tags=["Admin"])
def answer_pending_question(faq_id: int, respuesta: str, db: Session = Depends(get_db)):
    answered = crud.answer_faq(db, faq_id=faq_id, respuesta=respuesta)
    if not answered: raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    return answered

@app.delete("/admin/faq/{faq_id}", response_model=schemas.Faq, tags=["Admin"])
def delete_question(faq_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_faq(db, faq_id=faq_id)
    if not deleted: raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    return deleted

# --- Admin: Prompts ---
@app.get("/admin/prompt", response_model=schemas.PromptHistorial, tags=["Admin"])
def get_current_prompt(db: Session = Depends(get_db)):
    return crud.get_active_prompt(db)

@app.put("/admin/prompt", response_model=schemas.PromptHistorial, tags=["Admin"])
def set_current_prompt(prompt_data: schemas.PromptHistorialBase, db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_user)):
    prompt_to_create = schemas.PromptHistorialCreate(prompt_text=prompt_data.prompt_text, modificado_por=current_user.usuario)
    return crud.create_new_prompt(db, prompt_data=prompt_to_create)

@app.get("/admin/prompt/history", response_model=List[schemas.PromptHistorial], tags=["Admin"])
def get_prompt_history_list(db: Session = Depends(get_db)):
    return crud.get_prompt_history(db)


# ============================================================
# Endpoints de Utilidades y Configuración
# ============================================================

@app.post("/upload", tags=["Utilities"])
async def upload_image(file: UploadFile = File(...)):
    try:
        # Asumiendo que esta función existe en algún módulo, ej. security.py
        # result = security.upload_to_cloudinary(file.file) 
        # return {"url": result.get("secure_url")}
        return {"url": "https://dummy.url/image.jpg"} # Placeholder
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error al subir el archivo: {str(e)}")

@app.get("/configuracion/{clave}", response_model=schemas.Configuracion, tags=["Configuración"])
def read_configuracion(clave: str, db: Session = Depends(get_db)):
    config = crud.get_configuracion(db, clave=clave)
    if not config: return crud.set_configuracion(db, clave=clave, valor="0")
    return config

@app.put("/configuracion/{clave}", response_model=schemas.Configuracion, tags=["Configuración"])
def update_configuracion(clave: str, valor: str, db: Session = Depends(get_db)):
    return crud.set_configuracion(db, clave=clave, valor=valor)

@app.post("/faq/pending", response_model=schemas.Faq, tags=["FAQ"])
def log_pending_question(faq_data: schemas.FaqCreate, db: Session = Depends(get_db)):
    return crud.create_pending_faq(db, faq_data=faq_data)

@app.post("/password-recovery/{email}", tags=["Auth"])
async def request_password_recovery(email: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=email)
    if user:
        recovery_token = security.create_password_recovery_token(email=email)
        
        # --- LÓGICA DE ENVÍO DE CORREO ---
        # La URL base DEBE ser la de Netlify, no la de tu backend
        base_url = "https://tu-sitio-frontend.netlify.app" # <-- ¡IMPORTANTE! Usa tu URL de Netlify
        reset_url = f"{base_url}/restablecer-contrasena?token={recovery_token}"
        
        # La URL de la función serverless
        netlify_function_url = f"{base_url}/.netlify/functions/send-recovery-email"
        
        print(f"--- Intentando llamar a la función de Netlify en: {netlify_function_url} ---")
        print(f"--- Enviando datos: email={email}, reset_url={reset_url} ---")

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    netlify_function_url,
                    json={"email": email, "reset_url": reset_url},
                    timeout=20.0 # Aumentamos el timeout
                )
                response.raise_for_status() # Lanza un error si la respuesta es 4xx o 5xx
                print("--- Llamada a Netlify exitosa. Respuesta:", response.json())

            except Exception as e:
                print(f"--- ¡ERROR! Al llamar a la función de Netlify: {e} ---")
                # No lanzamos un error al frontend para no revelar si el correo existe
    
    return {"message": "Si existe una cuenta asociada..."}

@app.post("/reset-password/", tags=["Auth"])
def reset_password(
    token: str = Body(...),
    new_password: str = Body(...),
    db: Session = Depends(get_db)
):
    """
    Restablece la contraseña usando un token válido.
    """
    email = security.verify_password_recovery_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Token inválido o expirado")
    
    user = crud.get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    crud.update_user_password(db, user=user, new_password=new_password)
    return {"message": "Contraseña actualizada exitosamente"}