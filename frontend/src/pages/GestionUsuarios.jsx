// frontend/src/pages/GestionUsuarios.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';

const GestionUsuarios = () => {
    const [users, setUsers] = useState([]);
    const [editingId, setEditingId] = useState(null); // ID del usuario que se está editando
    const [formData, setFormData] = useState({}); // Datos del formulario de edición
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/users/');
            setUsers(response.data);
            setError(null);
        } catch (err) {
            setError('Error al cargar los usuarios.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingId(user.id);
        setFormData({ ...user });
    };

    const handleCancel = () => {
        setEditingId(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (userId) => {
        try {
            await apiClient.put(`/users/${userId}`, formData);
            setEditingId(null);
            fetchUsers();
        } catch (err) {
            setError('Error al guardar los cambios.');
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            try {
                await apiClient.delete(`/users/${userId}`);
                fetchUsers();
            } catch (err) {
                setError('Error al eliminar el usuario.');
            }
        }
    };

    return (
        <div className="admin-page-container">
            <h2 style={{ textAlign: 'center', color: '#003366', marginBottom: '2rem' }}>Administrar Usuarios</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div className="table-responsive-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Correo</th>
                            <th>Usuario</th>
                            <th>Dirección</th>
                            <th>Teléfono</th>
                            <th>Categoría Cliente</th>
                            <th>Tipo Usuario</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="8">Cargando...</td></tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id}>
                                    {editingId === user.id ? (
                                        <>
                                            <td><input type="text" name="nombre" value={formData.nombre} onChange={handleChange} /></td>
                                            <td><input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} /></td>
                                            <td><input type="email" name="email" value={formData.email} onChange={handleChange} /></td>
                                            <td><input type="text" name="usuario" value={formData.usuario} onChange={handleChange} /></td>
                                            <td><input type="text" name="direccion" value={formData.direccion} onChange={handleChange} /></td>
                                            <td><input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} /></td>
                                            <td>
                                                <select name="categoria_cliente" value={formData.categoria_cliente} onChange={handleChange}>
                                                    <option value="Regular">Regular</option>
                                                    <option value="Frecuente">Frecuente</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select name="tipo_usuario" value={formData.tipo_usuario} onChange={handleChange}>
                                                    <option value="Cliente">Cliente</option>
                                                    <option value="Administrador">Administrador</option>
                                                </select>
                                            </td>
                                            <td>
                                                <button onClick={() => handleSave(user.id)} className="btn btn-success btn-sm">Guardar</button>
                                                <button onClick={handleCancel} className="btn btn-secondary btn-sm">Cancelar</button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>{user.nombre}</td>
                                            <td>{user.apellidos}</td>
                                            <td>{user.email}</td>
                                            <td>{user.usuario}</td>
                                            <td>{user.direccion}</td>
                                            <td>{user.telefono}</td>
                                            <td>{user.categoria_cliente}</td>
                                            <td>{user.tipo_usuario}</td>
                                            <td>
                                                <button onClick={() => handleEdit(user)} className="btn btn-primary btn-sm">Editar</button>
                                                <button onClick={() => handleDelete(user.id)} className="btn btn-danger btn-sm">Eliminar</button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <Link to="/admin/panel" className="admin-menu-action" style={{ marginTop: '1.5rem', maxWidth: '300px', alignSelf: 'flex-start' }}>
                Volver al Panel de Administrador
            </Link>
        </div>
    );
};

export default GestionUsuarios;