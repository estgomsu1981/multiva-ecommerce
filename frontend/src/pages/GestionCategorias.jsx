import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';

// --- NUEVO ---
// Componente pequeño y estilizado para el enlace de la imagen
const ImageUrlLink = ({ url }) => {
    if (!url) return 'N/A';

    // Estilos para evitar que la URL larga rompa la tabla
    const style = {
        display: 'block',
        maxWidth: '200px', // Límite de ancho para la celda
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis', // Añade "..." al final
        fontSize: '0.85em',
        color: '#555',
    };

    return (
        <a href={url} target="_blank" rel="noopener noreferrer" style={style} title={url}>
            {url}
        </a>
    );
};


const GestionCategorias = () => {
    // --- ESTADOS (sin cambios) ---
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ id: null, nombre: '', imagen: null });
    const [imageFile, setImageFile] = useState(null);

    // --- EFECTOS Y FUNCIONES (sin cambios) ---
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/categories/');
            setCategories(response.data);
            setError(null);
        } catch (err) {
            setError('Error al cargar las categorías.');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadImage = async () => {
        if (!imageFile) return currentCategory.imagen;

        const formData = new FormData();
        formData.append('file', imageFile);

        try {
            const response = await apiClient.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data.url;
        } catch (err) {
            setError('Error al subir la imagen.');
            throw err;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const imageUrl = await handleUploadImage();
            const categoryData = { nombre: currentCategory.nombre, imagen: imageUrl };
            if (isEditing) {
                await apiClient.put(`/categories/${currentCategory.id}`, categoryData);
            } else {
                await apiClient.post('/categories/', categoryData);
            }
            fetchCategories();
            handleCloseForm();
        } catch (err) {
            if (!error) setError('Error al guardar la categoría.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
            try {
                await apiClient.delete(`/categories/${id}`);
                fetchCategories();
            } catch (err) {
                setError('Error al eliminar la categoría.');
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentCategory({ ...currentCategory, [name]: value });
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleShowCreateForm = () => {
        setIsEditing(false);
        setCurrentCategory({ id: null, nombre: '', imagen: null });
        setImageFile(null);
        setIsFormVisible(true);
    };

    const handleShowEditForm = (category) => {
        setIsEditing(true);
        setCurrentCategory(category);
        setImageFile(null);
        setIsFormVisible(true);
    };

    const handleCloseForm = () => {
        setIsFormVisible(false);
    };


    // --- RENDERIZADO (CON CAMBIOS) ---
    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Gestión de Categorías</h2>
                <button onClick={handleShowCreateForm} className="btn btn-success">Crear Nueva Categoría</button>
            </div>

            {isFormVisible && (
                <div style={{ backgroundColor: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    <h3>{isEditing ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
                    <form onSubmit={handleSubmit}>
                        <label>
                            Nombre de Categoría:
                            <input
                                type="text"
                                name="nombre"
                                value={currentCategory.nombre}
                                onChange={handleInputChange}
                                required
                            />
                        </label>
                        <label>
                            Imagen:
                            <input type="file" onChange={handleImageChange} accept="image/*" />
                        </label>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        <div>
                            <button type="submit" className="btn btn-success">Guardar</button>
                            <button type="button" onClick={handleCloseForm} className="btn btn-secondary">Cancelar</button>
                        </div>
                    </form>
                </div>
            )}
            
            <div className="table-responsive-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            {/* --- CAMBIO 1: Encabezados de tabla actualizados --- */}
                            <th>Imagen</th>
                            <th>URL</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5">Cargando...</td></tr>
                        ) : (
                            categories.map((cat) => (
                                <tr key={cat.id}>
                                    <td>{cat.id}</td>
                                    <td>{cat.nombre}</td>
                                    
                                    {/* --- CAMBIO 2: Celda para la miniatura de la imagen --- */}
                                    <td>
                                        {cat.imagen ? (
                                            <img
                                                src={cat.imagen}
                                                alt={cat.nombre}
                                                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                        ) : (
                                            'N/A'
                                        )}
                                    </td>
                                    
                                    <td>
                                        <ImageUrlLink url={cat.imagen} />
                                    </td>

                                    <td>
                                        <button onClick={() => handleShowEditForm(cat)} className="btn btn-primary btn-sm">Editar</button>
                                        <button onClick={() => handleDelete(cat.id)} className="btn btn-danger btn-sm">Eliminar</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <Link to="/admin/panel" className="admin-menu-action admin-return-button">
                Volver al Panel de Administrador
            </Link>
        </div>
    );
};

export default GestionCategorias;