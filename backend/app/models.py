from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True, unique=True, nullable=False)
    imagen = Column(String, nullable=True)
    products = relationship("Product", back_populates="category")

class Product(Base):
    pass


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    apellidos = Column(String)
    direccion = Column(String)
    usuario = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Para el futuro, como en el mockup
    categoria_cliente = Column(String, default="Regular")
    tipo_usuario = Column(String, default="Cliente")