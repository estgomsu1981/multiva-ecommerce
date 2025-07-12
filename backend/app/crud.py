from sqlalchemy.orm import Session,joinedload
from . import models, schemas, security 

# ==========================================================================
# CRUD para Categorías
# ==========================================================================

# LEER una categoría por su ID
def get_category(db: Session, category_id: int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()

# LEER una categoría por su nombre (útil para validaciones)
def get_category_by_name(db: Session, name: str):
    return db.query(models.Category).filter(models.Category.nombre == name).first()

# LEER todas las categorías
def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Category).offset(skip).limit(limit).all()

# CREAR una nueva categoría
def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(nombre=category.nombre, imagen=category.imagen)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

# ACTUALIZAR una categoría
def update_category(db: Session, category_id: int, category_details: schemas.CategoryCreate):
    db_category = get_category(db, category_id)
    if db_category:
        db_category.nombre = category_details.nombre
        db_category.imagen = category_details.imagen
        db.commit()
        db.refresh(db_category)
    return db_category

# BORRAR una categoría
def delete_category(db: Session, category_id: int):
    db_category = get_category(db, category_id)
    if db_category:
        db.delete(db_category)
        db.commit()
    return db_category


# ==========================================================================
# CRUD para Productos
# ==========================================================================

# LEER todos los productos
def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()

# LEER todos los productos de una categoría específica
def get_products_by_category(db: Session, category_id: int):
    return db.query(models.Product).filter(models.Product.category_id == category_id).all()

# CREAR un nuevo producto
def create_product(db: Session, product: schemas.ProductCreate, category_id: int):
    # Usamos model_dump para convertir el esquema Pydantic a un diccionario
    db_product = models.Product(**product.model_dump(), category_id=category_id)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

# LEER un producto específico por su ID
def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

# ACTUALIZAR un producto
def update_product(db: Session, product_id: int, product_update: schemas.ProductCreate):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    
    update_data = product_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    db.commit()
    db.refresh(db_product)
    return db_product

# BORRAR un producto
def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product


# ==========================================================================
# CRUD para Usuarios y Autenticación
# ==========================================================================

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.usuario == username).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username=username)
    if not user:
        user = get_user_by_email(db, email=username)
    if not user or not security.verify_password(password, user.hashed_password):
        return False
    return user

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        usuario=user.usuario,
        nombre=user.nombre,
        apellidos=user.apellidos,
        direccion=user.direccion,
        telefono=user.telefono, 
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None
    
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
        
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

def get_configuracion(db: Session, clave: str):
    return db.query(models.Configuracion).filter(models.Configuracion.clave == clave).first()

def set_configuracion(db: Session, clave: str, valor: str):
    db_config = get_configuracion(db, clave)
    if db_config:
        db_config.valor = valor
    else:
        db_config = models.Configuracion(clave=clave, valor=valor)
        db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

def get_discounted_products(db: Session, skip: int = 0, limit: int = 100):
    # Usamos joinedload para traer la categoría, igual que en get_products
    return db.query(models.Product).options(joinedload(models.Product.category)).filter(models.Product.descuento > 0).offset(skip).limit(limit).all()


def get_active_prompt(db: Session):
    # El prompt activo es simplemente el último registro creado, ordenado por timestamp descendente.
    active_prompt = db.query(models.PromptHistorial).order_by(models.PromptHistorial.timestamp.desc()).first()
    
    if not active_prompt:
        # Si la tabla está vacía, crea el primer prompt por defecto.
        default_text = "Sos Multiva Assist, un asistente de ventas amigable... (tu prompt por defecto)"
        active_prompt = models.PromptHistorial(
            prompt_text=default_text,
            modificado_por='sistema'
        )
        db.add(active_prompt)
        db.commit()
        db.refresh(active_prompt)
    return active_prompt

# Esta función ahora SIEMPRE crea un nuevo registro
def create_new_prompt(db: Session, prompt_data: schemas.PromptHistorialCreate):
    new_prompt = models.PromptHistorial(
        prompt_text=prompt_data.prompt_text,
        modificado_por=prompt_data.modificado_por
    )
    db.add(new_prompt)
    db.commit()
    db.refresh(new_prompt)
    return new_prompt

def get_prompt_history(db: Session):
    # Devuelve el historial ordenado por fecha
    return db.query(models.PromptHistorial).order_by(models.PromptHistorial.timestamp.desc()).all()

# en crud.py
def search_products_by_term(db: Session, search_term: str):
    from sqlalchemy import text

    # Preparamos el término de búsqueda para plainto_tsquery, reemplazando espacios por '&'
    # Esto busca palabras que aparecen juntas.
    query_term = ' & '.join(search_term.split())

    sql_query = text("""
        SELECT nombre, descripcion, especificacion, precio
        FROM products
        WHERE to_tsvector('simple', nombre || ' ' || descripcion || ' ' || coalesce(especificacion, '')) @@ plainto_tsquery('simple', :term)
        ORDER BY similarity(nombre, :search_original) DESC
        LIMIT 5;
    """)
    
    result = db.execute(sql_query, {"term": query_term, "search_original": search_term})
    
    products = [dict(zip(result.keys(), row)) for row in result]
    return products