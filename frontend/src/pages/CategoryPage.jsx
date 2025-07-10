import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axios';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext'; 

const CategoryPage = () => {
    const { categoryId } = useParams();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantities, setQuantities] = useState({}); 

    const { user, frequentClientDiscount } = useContext(AuthContext);
    const { addItemToCart } = useContext(CartContext); 

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

    // --- FUNCIONES MOVIDAS AL NIVEL CORRECTO ---

    const handleQuantityChange = (productId, value) => {
        const quantity = parseInt(value, 10);
        if (quantity >= 1) {
            setQuantities(prev => ({ ...prev, [productId]: quantity }));
        }
    };

    const handleAddToCart = (product) => {


        const quantity = quantities[product.id] || product.minimo_compra;

        // --- VALIDACIÓN DE CANTIDAD MÍNIMA ---
        if (quantity < product.minimo_compra) {
            alert(`La cantidad mínima para ${product.nombre} es ${product.minimo_compra}.`);
            // Opcional: Resetea la cantidad en el input al mínimo
            setQuantities(prev => ({ ...prev, [product.id]: product.minimo_compra }));
            return; // Detiene la ejecución de la función
        }
        
        const finalDiscountInfo = getFinalDiscount(product.descuento || 0);     
        const finalPrice = product.precio * (1 - finalDiscountInfo.percentage / 100);        

        const productToAdd = {
            id: product.id,
            nombre: product.nombre,
            precio: Number(product.precio) || 0,
            finalPrice: Number(finalPrice) || 0,
            descuento: Number(finalDiscountInfo.percentage) || 0,
            minimo_compra: product.minimo_compra, 
        };

        console.log("CategoryPage: Enviando al contexto", { 
            productToAdd, 
            quantity 
        });

        console.log("Añadiendo al carrito:", { productToAdd, quantity });
     
        addItemToCart(productToAdd, quantity);
        alert(`${quantity} x ${product.nombre} añadido(s) al carrito!`);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(price);
    };

    const getFinalDiscount = (productDiscount) => {
        const isFrequentClient = user && user.categoria === 'Frecuente';
        const clientDiscount = isFrequentClient ? frequentClientDiscount : 0;
        const finalDiscountPercentage = Math.max(productDiscount, clientDiscount);
        let tagColor = 'red';
        if (clientDiscount > 0 && clientDiscount > productDiscount) {
            tagColor = 'green';
        }
        return {
            percentage: finalDiscountPercentage,
            color: tagColor,
        };
    };

    // --- RENDERIZADO ---

    if (loading) {
        return <div className="container"><p>Cargando productos...</p></div>;
    }

    if (error) {
        return <div className="container"><p style={{ color: 'red' }}>{error}</p></div>;
    }

    if (!category) {
        return <div className="container"><p>No se encontró la categoría.</p></div>;
    }
    
    return (
        <div className="container">
            <h2 className="section-title">Productos de {category.nombre}</h2>
            <div className="product-grid">
                {category.products && category.products.length > 0 ? (
                    category.products.map(product => {
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
                                    <input 
                                        type="number" 
                                        min={product.minimo_compra} 
                                        value={quantities[product.id] || product.minimo_compra}
                                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                    />
                                </div>
                                <button onClick={() => handleAddToCart(product)} className="btn add-to-cart-btn">
                                    Agregar al carrito
                                </button>
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