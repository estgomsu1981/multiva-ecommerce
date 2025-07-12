from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime 

# ==========================================================================
# Esquemas para Productos
# ==========================================================================

class ProductBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    especificacion: Optional[str] = None
    precio: float
    minimo_compra: int = 1
    descuento: int = 0
    imagen_url: Optional[str] = None

class ProductCreate(ProductBase):
    category_id: int

# Esquema simple para leer un producto. Ya no necesita conocer a su categoría.
class Product(ProductBase):
    id: int
    category_id: int # Mantenemos el ID por si el frontend lo necesita

    class Config:
        from_attributes = True

# ==========================================================================
# Esquemas para Categorías (MUCHO MÁS SIMPLE AHORA)
# ==========================================================================

class CategoryBase(BaseModel):
    nombre: str
    imagen: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

# El único esquema de lectura que necesitamos para las categorías.|
# Ya no necesita la lista de productos.
class Category(CategoryBase):
    id: int
    class Config:
        from_attributes = True

# ==========================================================================
# Esquemas para Usuarios y Autenticación (sin cambios)
# ==========================================================================

class UserBase(BaseModel):
    email: EmailStr
    usuario: str
    nombre: str
    apellidos: str
    direccion: str
    telefono: str 

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    nombre: Optional[str] = None
    apellidos: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    categoria_cliente: Optional[str] = None
    tipo_usuario: Optional[str] = None

class User(UserBase):
    id: int
    categoria_cliente: str
    tipo_usuario: str
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class Configuracion(BaseModel):
    clave: str
    valor: Optional[str] = None
    class Config:
        from_attributes = True

class UserContactUpdate(BaseModel):
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None

class PromptHistorialBase(BaseModel):
    prompt_text: str

class PromptHistorialCreate(PromptHistorialBase):
    modificado_por: str

class PromptHistorial(PromptHistorialBase):
    id: int
    timestamp: datetime
    modificado_por: str
    class Config:
        from_attributes = True