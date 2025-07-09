from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True, unique=True, nullable=False)
    imagen = Column(String, nullable=True)

    products = relationship("Product", back_populates="category")


# --- REEMPLAZA LA CLASE PRODUCT VACÍA CON ESTO ---
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True, nullable=False)
    descripcion = Column(String, nullable=True)
    especificacion = Column(String, nullable=True)
    precio = Column(Float, nullable=False)
    minimo_compra = Column(Integer, default=1)
    descuento = Column(Integer, default=0)
    imagen_url = Column(String, nullable=True)

    # La columna que crea la relación con la tabla 'categories'
    category_id = Column(Integer, ForeignKey("categories.id"))

    # El atributo que nos permite acceder al objeto Category desde un Product
    category = relationship("Category", back_populates="products")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    apellidos = Column(String)
    direccion = Column(String)
    usuario = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    categoria_cliente = Column(String, default="Regular")
    tipo_usuario = Column(String, default="Cliente")

class Configuracion(Base):
    __tablename__ = "configuracion"
    clave = Column(String, primary_key=True, index=True)
    valor = Column(String, nullable=True)