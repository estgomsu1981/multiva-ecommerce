from pydantic import BaseModel, EmailStr
from typing import Optional

# Esquema base con los campos comunes
class CategoryBase(BaseModel):
    nombre: str
    imagen: Optional[str] = None

# Esquema para la creación (lo que la API espera recibir)
class CategoryCreate(CategoryBase):
    pass

# Esquema para la lectura (lo que la API enviará como respuesta)
class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True # Permite que Pydantic lea datos desde modelos SQLAlchemy

# Esquema base con datos comunes
class UserBase(BaseModel):
    email: EmailStr  # Pydantic valida que sea un email
    usuario: str
    nombre: str
    apellidos: str
    direccion: str

# Esquema para la creación de un usuario (recibe la contraseña)
class UserCreate(UserBase):
    password: str

# Esquema para la respuesta de la API (NO incluye la contraseña)
class User(UserBase):
    id: int
    categoria_cliente: str
    tipo_usuario: str

    class Config:
        from_attributes = True
