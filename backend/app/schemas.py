from pydantic import BaseModel
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