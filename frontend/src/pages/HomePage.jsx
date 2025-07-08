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