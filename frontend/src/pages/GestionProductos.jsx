import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';

const GestionProductos = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const initialFormState = {
        nombre: '',
        descripcion: '',
        especificacion: '',
        precio: '',
        minimo_compra: 1,
        descuento: 0,
        category_id: '',
        imagen_url: ''
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                apiClient.get('/products/'),
                apiClient.get('/categories/')
            ]);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
            setError(null);
        } catch (err) {
            setError('Error al cargar los datos.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setEditingId(product.id);
        setFormData({ ...product });
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData(initialFormState);
        setImageFile(null);
        setError(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        let imageUrl = formData.imagen_url || '';
        if (imageFile) {
            const formImageData = new FormData();
            formImageData.append('file', imageFile);
            try {
                const res = await apiClient.post('/upload', formImageData, { headers: { 'Content-Type': 'multipart/form-data' } });
                imageUrl = res.data.url;
            } catch (err) {
                setError('Error al subir la imagen.');
                return;
            }
        }

        const productData = {
            ...formData,
            imagen_url: imageUrl,
            precio: parseFloat(formData.precio) || 0,
            minimo_compra: parseInt(formData.minimo_compra, 10) || 1,
            descuento: parseInt(formData.descuento, 10) || 0,
        };

        try {
            if (editingId && editingId !== 'new') {
                await apiClient.put(`/products/${editingId}`, productData);
            } else {
                await apiClient.post('/products/', productData);
            }
            handleCancel();
            fetchData();
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Ocurrió un error al guardar el producto.';
            setError(errorMessage);
        }
    };
    
    const handleDelete = async (productId) => {
        if(window.confirm('¿Estás seguro de que deseas eliminar este producto?')){
            try {
                await apiClient.delete(`/products/${productId}`);
                fetchData();
            } catch (err) {
                setError('Error al eliminar el producto.');
            }
        }
    };
    
    const handleShowCreateForm = () => {
        setEditingId('new');
        setFormData(initialFormState);
    };

    // ----- AQUÍ COMIENZA EL RETURN, DENTRO DE LA FUNCIÓN -----
    return (
        <div className="admin-page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Gestión de Productos</h2>
                <button onClick={handleShowCreateForm} className="btn btn-success">
                    Crear Nuevo Producto
                </button>
            </div>

            {editingId && (
                <div style={{ backgroundColor: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    <h3>{editingId === 'new' ? 'Nuevo Producto' : 'Editar Producto'}</h3>
                    <form onSubmit={handleSubmit}>
                        <label>Nombre: <input type="text" name="nombre" value={formData.nombre || ''} onChange={handleChange} required /></label>
                        <label>Categoría:
                            <select name="category_id" value={formData.category_id || ''} onChange={handleChange} required>
                                <option value="">Seleccione una categoría</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                ))}
                            </select>
                        </label>
                        <label>Descripción: <textarea name="descripcion" value={formData.descripcion || ''} onChange={handleChange} rows="2"></textarea></label>
                        <label>Especificación: <textarea name="especificacion" value={formData.especificacion || ''} onChange={handleChange} rows="2"></textarea></label>
                        <label>Precio: <input type="number" name="precio" value={formData.precio || ''} onChange={handleChange} required step="0.01" /></label>
                        <label>Mínimo Compra: <input type="number" name="minimo_compra" value={formData.minimo_compra || ''} onChange={handleChange} /></label>
                        <label>Descuento (%): <input type="number" name="descuento" value={formData.descuento || ''} onChange={handleChange} /></label>
                        <label>Imagen: <input type="file" onChange={handleImageChange} accept="image/*" /></label>
                        
                        <div>
                            <button type="submit" className="btn btn-primary">Guardar</button>
                            <button type="button" onClick={handleCancel} className="btn btn-secondary">Cancelar</button>
                        </div>
                        {error && typeof error === 'string' && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
                    </form>
                </div>
            )}

            <div className="table-responsive-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Precio</th>
                            <th>Mínimo Compra</th>
                            <th>Descuento (%)</th>
                            <th>Imagen</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="8">Cargando...</td></tr>
                        ) : (
                            products.map(product => (
                                <tr key={product.id}>
                                    <td>{product.id}</td>
                                    <td>{product.nombre}</td>
                                    <td>{product.category?.nombre || 'N/A'}</td>
                                    <td>₡{parseFloat(product.precio).toFixed(2)}</td>
                                    <td>{product.minimo_compra}</td>
                                    <td>{product.descuento}%</td>
                                    <td>
                                        {product.imagen_url ? (
                                            <img src={product.imagen_url} alt={product.nombre} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}/>
                                        ) : 'N/A'}
                                    </td>
                                    <td>
                                        <button onClick={() => handleEdit(product)} className="btn btn-primary btn-sm">Editar</button>
                                        <button onClick={() => handleDelete(product.id)} className="btn btn-danger btn-sm">Eliminar</button>
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
// ----- AQUÍ TERMINA LA FUNCIÓN DEL COMPONENTE -----
}; 

export default GestionProductos;