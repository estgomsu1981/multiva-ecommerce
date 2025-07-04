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
