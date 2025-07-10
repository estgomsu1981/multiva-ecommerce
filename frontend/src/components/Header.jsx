import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/axios';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    // --- LÍNEA CORREGIDA ---
    // Pedimos todo lo que necesitamos del CartContext de una sola vez
    const { clearCart, cartItems } = useContext(CartContext);
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);

    console.log("Usuario en Header:", user);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await apiClient.get('/categories/');
                setCategories(response.data);
            } catch (err) {
                console.error("Failed to fetch categories for header", err);
            }
        };
        fetchCategories();
    }, []);

    const handleLogout = () => {
        logout();
        clearCart();
        navigate('/');
    };

    const handleNavToggle = (e) => {
        const nav = e.currentTarget.nextElementSibling;
        if (nav) {
            nav.classList.toggle('is-open');
        }
    };
    
    const totalItemsInCart = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <header className="main-header">
            <div className="header-left-section">
                <Link to="/"><img src="/images/logo.png" alt="Logo Multiva" className="logo" /></Link>
                {user && (
                    <span className="user-greeting">
                        Hola, {user.nombre || user.username}!
                    </span>
                )}
            </div>

            <button className="nav-toggle-btn" aria-label="Toggle navigation" onClick={handleNavToggle}>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
            </button>

            <nav className="main-nav">
                <Link to="/">Inicio</Link>
                <div className="dropdown">
                    <button className="dropdown-toggle-btn">Catálogo</button>
                    <div className="dropdown-content">
                        {categories.map(cat => (
                            <Link key={cat.id} to={`/catalogo/${cat.id}`}>{cat.nombre}</Link>
                        ))}
                    </div>
                </div>
                
                <div className="nav-spacer"></div>

                <Link to="/descuentos">Descuentos</Link>
                <Link to="/preguntas-frecuentes">Preguntas Frecuentes</Link>
                <Link to="/acerca-de-la-empresa">Acerca de la empresa</Link>
                <Link to="/ayuda">Ayuda</Link>
                
                {user && user.tipo_usuario === 'Administrador' && (
                    <Link to="/admin/panel">Panel de Administrador</Link>
                )}
                
                <div className="dropdown">
                    <button className="dropdown-toggle-btn">Mi Cuenta</button>
                    <div className="dropdown-content">
                        {user ? (
                            <button onClick={handleLogout} className="dropdown-logout-btn">
                                Logout
                            </button>
                        ) : (
                            <>
                                <Link to="/login">Iniciar Sesión</Link>
                                <Link to="/registro">Registrarse</Link>
                            </>
                        )}
                    </div>
                </div>
                
                <Link to="/carrito" className="cart-icon-link">
                    <img src="/images/carrito.png" alt="Carrito" style={{ height: '24px', verticalAlign: 'middle' }} />
                    {totalItemsInCart > 0 && (
                        <span className="cart-counter">{totalItemsInCart}</span>
                    )}
                </Link>
            </nav>
        </header>
    );
};

export default Header;