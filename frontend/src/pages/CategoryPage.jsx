// frontend/src/pages/CategoryPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axios';
import AuthContext from '../context/AuthContext'; // Para el header

const CategoryPage = () => {
    const { categoryId } = useParams(); // Obtiene el ID de la categoría de la URL
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Copiamos la lógica del header de HomePage para consistencia
    const { user, logout } = useContext(AuthContext);

    useEffect(() => {
        const fetchCategoryData = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(`/categories/${categoryId}`);
                setCategory(response.data);
            } catch (err) {
                setError('No se pudo cargar la categoría o no existe.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryData();
    }, [categoryId]); // Se vuelve a ejecutar si el ID de la categoría cambia

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(price);
    };

    if (loading) return <div className="container"><p>Cargando productos...</p></div>;
    if (error) return <div className="container"><p style={{color: 'red'}}>{error}</p></div>;

    return (
        <>
            <div className="container">
                <h1>Productos de la Categoría X</h1>
                <p>Contenido de la página de categoría...</p>  
            </div>
            {/* Footer opcional */}
        </>
    );
};

export default CategoryPage;