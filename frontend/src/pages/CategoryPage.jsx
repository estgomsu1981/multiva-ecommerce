import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axios';
import AuthContext from '../context/AuthContext';

const CategoryPage = () => {
    const { categoryId } = useParams();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Obtenemos los datos de autenticación y el descuento de cliente frecuente del contexto
    const { user, frequentClientDiscount } = useContext(AuthContext);


    useEffect(() => {
        if (!categoryId) {
            setError('ID de categoría no especificado.');
            setLoading(false);
            return;
        }

        const fetchAllData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [categoryResponse, productsResponse] = await Promise.all([
                    apiClient.get(`/categories/${categoryId}`),
                    apiClient.get(`/categories/${categoryId}/products`)
                ]);
                
                setCategory({
                    ...categoryResponse.data,
                    products: productsResponse.data
                });

            } catch (err) {
                console.error("Error fetching data:", err);
                setError('No se pudo cargar la categoría o sus productos.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [categoryId]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(price);
    };

    // Función para calcular el descuento final y el color de la etiqueta
    const getFinalDiscount = (productDiscount) => {
    const isFrequentClient = user && user.categoria === 'Frecuente';
    const clientDiscount = isFrequentClient ? frequentClientDiscount : 0;
    
    // El descuento final es el mayor entre el del producto y el del cliente
    const finalDiscountPercentage = Math.max(productDiscount, clientDiscount);
    
    let tagColor = 'red'; // Por defecto, la etiqueta es roja (descuento del producto)
    
    // Condición para que la etiqueta sea verde:
    // 1. El descuento del cliente debe ser mayor que 0.
    // 2. El descuento del cliente debe ser el que se está aplicando (es decir, mayor que el del producto).
    if (clientDiscount > 0 && clientDiscount > productDiscount) {
        tagColor = 'green';
    }
    
    return {
        percentage: finalDiscountPercentage,
        color: tagColor,
    };
};

    // --- RENDERIZADO CONDICIONAL ---

    if (loading) {
        return <div className="container"><p>Cargando productos...</p></div>;
    }

    if (error) {
        return <div className="container"><p style={{ color: 'red' }}>{error}</p></div>;
    }

    if (!category) {
        return <div className="container"><p>No se encontró la categoría.</p></div>;
    }
    
    // --- RENDERIZADO PRINCIPAL ---
    return (
        <div className="container">
            <h2 className="section-title">Productos de {category.nombre}</h2>
            
            <div className="product-grid">
                {category.products && category.products.length > 0 ? (
                    category.products.map(product => {
                        // Lógica de descuento para cada producto
                        const finalDiscountInfo = getFinalDiscount(product.descuento || 0);
                        const hasDiscount = finalDiscountInfo.percentage > 0;
                        const finalPrice = product.precio * (1 - finalDiscountInfo.percentage / 100);

                        return (
                            <div key={product.id} className="product-card">
                                {hasDiscount && (
                                    <div 
                                        className="discount-tag"
                                        style={{ backgroundColor: finalDiscountInfo.color === 'green' ? 'var(--success-color)' : 'var(--danger-color)' }}
                                    >
                                        {finalDiscountInfo.percentage}% OFF
                                    </div>
                                )}
                                
                                <img src={product.imagen_url || '/images/placeholder.png'} alt={product.nombre} />
                                
                                <h3>{product.nombre}</h3>
                                
                                <div className="price-container">
                                    {hasDiscount ? (
                                        <>
                                            <span className="original-price">{formatPrice(product.precio)}</span>
                                            <span className="discounted-price">{formatPrice(finalPrice)}</span>
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
                        );
                    })
                ) : (
                    <p>No hay productos en esta categoría.</p>
                )}
            </div>
            
            <Link to="/carrito" className="btn btn-warning go-to-cart-link">
                🛒 Ir al carrito
            </Link>
        </div>
    );
};

export default CategoryPage;