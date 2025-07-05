from sqlalchemy.orm import Session
from . import models, schemas, security 

# LEER una categoría por su ID
def get_category(db: Session, category_id: int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()

# LEER una categoría por su nombre
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

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.usuario == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        usuario=user.usuario,
        nombre=user.nombre,
        apellidos=user.apellidos,
        direccion=user.direccion,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
def authenticate_user(db: Session, username: str, password: str):
    # Primero, intentamos buscar por nombre de usuario
    user = get_user_by_username(db, username=username)
    
    # Si no se encuentra, intentamos buscar por correo electrónico
    if not user:
        user = get_user_by_email(db, email=username)
    
    # Si después de ambas búsquedas no hay usuario, o si la contraseña no coincide, fallamos
    if not user or not security.verify_password(password, user.hashed_password):
        return False
        
    # Si todo es correcto, devolvemos el objeto del usuario
    return user
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

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

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

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product