// frontend/src/components/Header.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // <-- IMPORTA LINK
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
                // --- CONSOLE.LOG DE ÉXITO ---
                console.log("Categorías para el menú cargadas:", response.data);
                setCategories(response.data);
            } catch (err) {
                // --- CONSOLE.LOG DE ERROR ---
                console.error("ERROR al cargar categorías para el header:", err);
            }
        };
        fetchCategories();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // ...

    return (
        <header className="main-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to="/"><img src="/images/logo.png" alt="Logo Multiva" className="logo" /></Link>
                {/* ... */}
            </div>

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
                <Link to="/descuentos">Descuentos</Link>
                <Link to="/preguntas-frecuentes">Preguntas Frecuentes</Link>
                <Link to="/acerca-de-la-empresa">Acerca de la empresa</Link>
                <Link to="/ayuda">Ayuda</Link>
                
                {user && user.rol === 'Administrador' && (
                    <Link to="/admin/panel">Panel de Administrador</Link>
                )}

                <div className="dropdown">
                    <button className="dropdown-toggle-btn">Mi Cuenta</button>
                    <div className="dropdown-content">
                        {user ? (
                            <button onClick={handleLogout} className="dropdown-logout-btn">Logout</button>
                        ) : (
                            <>
                                <Link to="/login">Iniciar Sesión</Link>
                                <Link to="/registro">Registrarse</Link>
                            </>
                        )}
                    </div>
                </div>
                <Link to="/carrito"><img src="/images/carrito.png" alt="Carrito" style={{ height: '24px', verticalAlign: 'middle' }} /></Link>
            </nav>
        </header>
    );
};

export default Header;