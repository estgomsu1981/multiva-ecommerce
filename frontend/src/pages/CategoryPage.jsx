import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axios';
import AuthContext from '../context/AuthContext';

const CategoryPage = () => {
    const { categoryId } = useParams();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext); // Solo para el header

    useEffect(() => {
        const fetchCategoryData = async () => {
            setLoading(true);
            setError(null); // Línea corregida
            try {
                const response = await apiClient.get(`/categories/${categoryId}`);
                setCategory(response.data);
            } catch (err) {
                setError('No se pudo cargar la categoría o no existe.');
            } finally {
                setLoading(false);
            }
        };

        if (categoryId) {
            fetchCategoryData();
        }
    }, [categoryId]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(price);
    };

    return (
        <>
            <div className="container">
                <h2 className="section-title">Productos de {category?.nombre}</h2>
                <div className="product-grid">
                    {category?.products.length > 0 ? (
                        category.products.map(product => (
                            <div key={product.id} className="product-card">
                                {product.descuento > 0 && (
                                    <div className="discount-tag">{product.descuento}% OFF</div>
                                )}
                                <img src={product.imagen_url || '/images/placeholder.png'} alt={product.nombre} />
                                <h3>{product.nombre}</h3>
                                
                                <div className="price-container">
                                    {product.descuento > 0 ? (
                                        <>
                                            <span className="original-price">{formatPrice(product.precio)}</span>
                                            <span className="discounted-price">{formatPrice(product.precio * (1 - product.descuento / 100))}</span>
                                        </>
                                    ) : (
                                        <span className="price">{formatPrice(product.precio)}</span>
                                    )}
                                </div>

                                <p className="min-purchase">Mínimo: {product.minimo_compra} unidades</p>
                                <div className="quantity-selector">
                                    <input type="number" min={product.minimo_compra} defaultValue={product.minimo_compra} />
                                </div>
                                <button className="btn add-to-cart-btn">Agregar al carrito</button>

                                <div className="product-details">
                                    <h4>Descripción:</h4>
                                    <p>{product.descripcion}</p>
                                    <h4>Especificaciones:</h4>
                                    <p>{product.especificacion}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No hay productos en esta categoría.</p>
                    )}
                </div>
                <Link to="/carrito" className="btn btn-warning go-to-cart-link">
                    🛒 Ir al carrito
                </Link>
            </div>
        </>
    );
};

export default CategoryPage;