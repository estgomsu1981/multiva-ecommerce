from pydantic import BaseModel, EmailStr
from typing import List, Optional


# Campos base de un producto
class ProductBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    especificacion: Optional[str] = None
    precio: float
    minimo_compra: Optional[int] = 1
    descuento: Optional[int] = 0
    imagen_url: Optional[str] = None
    category_id: int  # El ID de la categoría a la que pertenece

# Esquema para la creación de un producto
class ProductCreate(ProductBase):
    pass

# Esquema para la respuesta de la API (incluye el objeto Category completo)
class Product(ProductBase):
    id: int
    # category: Category  # <-- ¡Aquí está la magia! Anidamos el esquema de Categoría

    class Config:
        from_attributes = True

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
    products: List[Product] = []
    
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

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    
class UserUpdate(BaseModel):
    nombre: Optional[str] = None
    apellidos: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None
    categoria_cliente: Optional[str] = None
    tipo_usuario: Optional[str] = None


