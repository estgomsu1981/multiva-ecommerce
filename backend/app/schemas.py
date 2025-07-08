from pydantic import BaseModel, EmailStr
from typing import Optional, List

# ==========================================================================
# Esquemas para Productos
# ==========================================================================

# Propiedades base que un producto siempre tendrá
class ProductBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    especificacion: Optional[str] = None
    precio: float
    minimo_compra: int = 1
    descuento: int = 0
    imagen_url: Optional[str] = None

# Propiedades que se recibirán al crear un producto
class ProductCreate(ProductBase):
    category_id: int

# Propiedades que se devolverán desde la API
class Product(ProductBase):
    id: int
    category_id: int

    class Config:
        from_attributes = True # Permite a Pydantic leer desde modelos de SQLAlchemy

# ==========================================================================
# Esquemas para Categorías
# ==========================================================================

# Propiedades base de una categoría
class CategoryBase(BaseModel):
    nombre: str
    imagen: Optional[str] = None

# Propiedades para crear una categoría
class CategoryCreate(CategoryBase):
    pass

# Propiedades que se devolverán desde la API
# Incluye una lista de productos asociados a la categoría
class Category(CategoryBase):
    id: int
    products: List[Product] = [] # Aquí está la relación

    class Config:
        from_attributes = True

# ==========================================================================
# Esquemas para Usuarios y Autenticación
# ==========================================================================

# Propiedades base de un usuario
class UserBase(BaseModel):
    email: EmailStr
    usuario: str
    nombre: str
    apellidos: str
    direccion: str

# Propiedades para crear un usuario (incluye la contraseña)
class UserCreate(UserBase):
    password: str

# Propiedades para actualizar un usuario desde el panel de admin
class UserUpdate(BaseModel):
    nombre: Optional[str] = None
    apellidos: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None
    categoria_cliente: Optional[str] = None
    tipo_usuario: Optional[str] = None

# Propiedades que se devolverán desde la API (NO incluye la contraseña)
class User(UserBase):
    id: int
    categoria_cliente: str
    tipo_usuario: str

    class Config:
        from_attributes = True


# --- Esquemas para Tokens JWT ---

# Propiedades del token que se devuelve al cliente
class Token(BaseModel):
    access_token: str
    token_type: str

# Propiedades que se extraen del payload del token
class TokenData(BaseModel):
    username: Optional[str] = None