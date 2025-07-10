// frontend/src/pages/DescuentosPage.jsx
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext'; // <-- 1. IMPORTA CARTCONTEXT

const DescuentosPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user, frequentClientDiscount } = useContext(AuthContext);
    const { addItemToCart } = useContext(CartContext); // <-- 2. USA EL CONTEXTO
    const [quantities, setQuantities] = useState({}); // <-- 3. AÑADE EL ESTADO PARA CANTIDADES

    useEffect(() => {
        // ... (la lógica de fetch no cambia)
        const fetchDiscountedProducts = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get('/products/discounted');
                setProducts(response.data);
            } catch (err) {
                setError('No se pudieron cargar los productos con descuento.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDiscountedProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        // ... (la lógica de filtrado no cambia)
        if (!user || user.categoria !== 'Frecuente') {
            return products;
        }
        return products.filter(product => product.descuento > frequentClientDiscount);
    }, [products, user, frequentClientDiscount]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(price);
    };

    // --- 4. AÑADE LAS FUNCIONES PARA EL CARRITO ---
    const handleQuantityChange = (productId, value) => {
        const quantity = parseInt(value, 10);
        if (quantity >= 1) {
            setQuantities(prev => ({ ...prev, [productId]: quantity }));
        }
    };

    const handleAddToCart = (product) => {
        // En esta página, el descuento final es simplemente el del producto.

        const quantity = quantities[product.id] || product.minimo_compra;

        if (quantity < product.minimo_compra) {
                alert(`La cantidad mínima para ${product.nombre} es ${product.minimo_compra}.`);
                // Opcional: Resetea la cantidad en el input al mínimo
                setQuantities(prev => ({ ...prev, [product.id]: product.minimo_compra }));
                return; // Detiene la ejecución de la función
        }
        
        const finalPrice = product.precio * (1 - (product.descuento || 0) / 100);

        
        const productToAdd = {
            id: product.id,
            nombre: product.nombre,
            precio: Number(product.precio) || 0,
            finalPrice: Number(finalPrice) || 0,
            descuento: Number(product.descuento) || 0,
        };

        addItemToCart(productToAdd, quantity);
        alert(`${quantity} x ${product.nombre} añadido(s) al carrito!`);
    };
    // ---------------------------------------------
        
    if (loading) return <div className="container"><p>Cargando ofertas...</p></div>;
    if (error) return <div className="container"><p style={{ color: 'red' }}>{error}</p></div>;

    return (
        <div className="container">
            <h2 className="section-title">Ofertas Especiales</h2>
            
            <div className="product-grid">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <div key={product.id} className="product-card">
                            <div className="discount-tag">{product.descuento}% OFF</div>
                            <img src={product.imagen_url || '/images/placeholder.png'} alt={product.nombre} />
                            <h3>{product.nombre}</h3>
                            <div className="price-container">
                                <span className="original-price">{formatPrice(product.precio)}</span>
                                <span className="discounted-price">{formatPrice(product.precio * (1 - product.descuento / 100))}</span>
                            </div>
                            <p className="min-purchase">Mínimo: {product.minimo_compra} unidades</p>
                            
                            {/* --- 5. CONECTA LAS FUNCIONES AL JSX --- */}
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
                            {/* -------------------------------------- */}

                            <div className="product-details">
                                <h4>Descripción:</h4>
                                <p>{product.descripcion}</p>
                                <h4>Especificaciones:</h4>
                                <p>{product.especificacion}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No hay ofertas especiales que cumplan los criterios en este momento.</p>
                )}
            </div>

            <Link to="/carrito" className="btn btn-warning go-to-cart-link">
                🛒 Ir al carrito
            </Link>
        </div>
    );
};

export default DescuentosPage;