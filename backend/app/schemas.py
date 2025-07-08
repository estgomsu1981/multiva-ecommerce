from pydantic import BaseModel, EmailStr
from typing import Optional, List

# --- Esquemas de Base (Sin relaciones) ---
class ProductBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    especificacion: Optional[str] = None
    precio: float
    minimo_compra: int = 1
    descuento: int = 0
    imagen_url: Optional[str] = None

class CategoryBase(BaseModel):
    nombre: str
    imagen: Optional[str] = None

# --- Esquemas para Lectura (Con relaciones) ---

# Primero, un esquema de categoría que NO conoce a sus productos
class CategoryForProduct(CategoryBase):
    id: int
    class Config:
        from_attributes = True

# Ahora, un esquema de producto que SÍ conoce a su categoría
class Product(ProductBase):
    id: int
    category: CategoryForProduct # <-- Relación definida aquí

    class Config:
        from_attributes = True

# Finalmente, un esquema de categoría que SÍ conoce a sus productos
class Category(CategoryBase):
    id: int
    products: List[Product] = [] # <-- Relación definida aquí

    class Config:
        from_attributes = True

# --- Esquemas para Creación/Actualización ---
class ProductCreate(ProductBase):
    category_id: int

class CategoryCreate(CategoryBase):
    pass

# --- El resto de tus esquemas (User, Token, etc.) ---
# ... (Pega aquí el resto de tus esquemas de User y Token sin cambios) ...
class UserBase(BaseModel):
    email: EmailStr
    usuario: str
    nombre: str
    apellidos: str
    direccion: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    nombre: Optional[str] = None
    apellidos: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None
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