import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import AuthContext from '../context/AuthContext';
import HeroSection from '../components/HeroSection';

const HomePage = () => {
    // Hooks de estado y contexto
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar categorías al montar el componente
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await apiClient.get('/categories/');
                setCategories(response.data);
            } catch (err) {
                setError('No se pudieron cargar las categorías. Por favor, intente más tarde.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // --- MANEJADORES DE EVENTOS ---
    const handleLogout = () => {
        logout();
        navigate('/'); // Redirige al inicio después de cerrar sesión
    };

    const handleNavToggle = (e) => {
        const nav = e.currentTarget.nextElementSibling;
        nav.classList.toggle('is-open');
    };

    return (
        <>
            {/* ====== HEADER DINÁMICO ====== */}
            <header className="main-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <a href="/"><img src="/images/logo.png" alt="Logo Multiva" className="logo" /></a>
                    {/* Saludo personalizado si el usuario ha iniciado sesión */}
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
                    
                    {/* Renderizado condicional del panel de administrador */}
                    {user && user.rol === 'Administrador' && (
                        <a href="/admin/panel">Panel Administrador</a>
                    )}

                    <div className="dropdown">
                        <button className="dropdown-toggle-btn">Mi Cuenta</button>
                        <div className="dropdown-content">
                            {user ? (
                                <button 
                                    onClick={handleLogout} 
                                    className="dropdown-logout-btn"
                                >
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
            
            <HeroSection />

            <div className="container">
                <h2 className="section-title">Nuestras Categorías</h2>
                {loading && <p>Cargando categorías...</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {!loading && !error && (
                    <div className="category-grid">
                        {categories.map((category) => (
                            <a key={category.id} href={`/catalogo/${category.id}`} className="category-card">
                                <img 
                                    src={category.imagen || '/images/placeholder.png'}
                                    alt={category.nombre} 
                                    className="category-card-image" 
                                />
                                <h3 className="category-card-title">{category.nombre}</h3>
                            </a>
                        ))}
                    </div>
                )}
            </div>

            <footer className="main-footer">
                <p>© 2025 Multiva. Todos los derechos reservados.</p>
            </footer>
        </>
    );
};

export default HomePage;