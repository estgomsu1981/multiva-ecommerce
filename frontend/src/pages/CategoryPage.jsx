import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axios';

const CategoryPage = () => {
    const { categoryId } = useParams();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

 
// en CategoryPage.jsx

useEffect(() => {
    if (!categoryId) {
        // ... (manejo de error si no hay ID)
        return;
    }

    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Hacemos las dos llamadas en paralelo para más eficiencia
            const [categoryResponse, productsResponse] = await Promise.all([
                apiClient.get(`/categories/${categoryId}`),
                apiClient.get(`/categories/${categoryId}/products`)
            ]);
            
            // Combinamos los resultados en el estado
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

    // --- RENDERIZADO CONDICIONAL MEJORADO ---

    // 1. Mostrar estado de carga
    if (loading) {
        return (
            <div className="container">
                <p>Cargando productos...</p>
            </div>
        );
    }

    // 2. Mostrar estado de error
    if (error) {
        return (
            <div className="container">
                <p style={{ color: 'red' }}>{error}</p>
            </div>
        );
    }

    // 3. Mostrar estado de "no encontrado" si no hay categoría
    if (!category) {
        return (
            <div className="container">
                <p>No se encontró la categoría.</p>
            </div>
        );
    }
    
    // 4. Si todo está bien, mostrar el contenido principal
    return (
        <div className="container">
            <h2 className="section-title">Productos de {category.nombre}</h2>
            <div className="product-grid">
                {category.products && category.products.length > 0 ? (
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
    );
};

export default CategoryPage;