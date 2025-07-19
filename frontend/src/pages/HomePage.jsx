//import React, { useState, useEffect, useContext } from 'react';
import React, { useState, useEffect } from 'react'; (Quita , useContext).
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
//import AuthContext from '../context/AuthContext';
import HeroSection from '../components/HeroSection';
import { Link } from 'react-router-dom'; 

const HomePage = () => {
    // Hooks de estado y contexto
    //const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
   /* const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);*/

    // Cargar categorías al montar el componente
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await apiClient.get('/categories/');
                setCategories(response.data);
            } catch (err) {
               // setError('No se pudieron cargar las categorías. Por favor, intente más tarde.');
                console.error("Error al cargar categorías:", err); // Mantenemos el log
           } /* finally {
                setLoading(false);
            }*/
        };

        fetchCategories();
    }, []);

    // --- MANEJADORES DE EVENTOS ---
    /*const handleLogout = () => {
        logout();
        navigate('/'); // Redirige al inicio después de cerrar sesión
    };

    const handleNavToggle = (e) => {
        const nav = e.currentTarget.nextElementSibling;
        nav.classList.toggle('is-open');
    };*/

    return (
        <>           
            <HeroSection />

                <div className="category-grid">
                    {categories.map((category) => (
                        <Link key={category.id} to={`/catalogo/${category.id}`} className="category-card">
                            <img 
                                src={category.imagen || '/images/placeholder.png'}
                                alt={category.nombre} 
                                className="category-card-image" 
                            />
                            <h3 className="category-card-title">{category.nombre}</h3>
                        </Link>
                    ))}
                </div>
        </>
    );
};

export default HomePage;