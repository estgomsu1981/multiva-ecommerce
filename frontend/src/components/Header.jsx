// frontend/src/components/Header.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import AuthContext from '../context/AuthContext';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);

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
        navigate('/');
    };

    const handleNavToggle = (e) => {
        const nav = e.currentTarget.nextElementSibling;
        nav.classList.toggle('is-open');
    };

    return (
        <header className="main-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <a href="/"><img src="/images/logo.png" alt="Logo Multiva" className="logo" /></a>
                {user && (
                    <span style={{ color: 'white', fontWeight: 'bold' }}>
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
                <a href="/">Inicio</a>
                <div className="dropdown">
                    <button className="dropdown-toggle-btn">Catálogo</button>
                    <div className="dropdown-content">
                        {categories.map(cat => (
                            <a key={cat.id} href={`/catalogo/${cat.id}`}>{cat.nombre}</a>
                        ))}
                    </div>
                </div>
                <a href="/descuentos">Descuentos</a>
                <a href="/preguntas-frecuentes">Preguntas Frecuentes</a>
                <a href="/acerca-de-la-empresa">Acerca de la empresa</a>
                <a href="/ayuda">Ayuda</a>
                
                {user && user.rol === 'Administrador' && (
                    <a href="/admin/panel">Panel de Administrador</a>
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
                                <a href="/login">Iniciar Sesión</a>
                                <a href="/registro">Registrarse</a>
                            </>
                        )}
                    </div>
                </div>
                <a href="/carrito"><img src="/images/carrito.png" alt="Carrito" style={{ height: '24px', verticalAlign: 'middle' }} /></a>
            </nav>
        </header>
    );
};

export default Header;