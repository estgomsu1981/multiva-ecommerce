// frontend/src/pages/GestionDescuentoPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';

const GestionDescuentoPage = () => {
    const [descuento, setDescuento] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const CONFIG_KEY = 'descuento_cliente_frecuente';

    useEffect(() => {
        const fetchDescuento = async () => {
            try {
                const response = await apiClient.get(`/configuracion/${CONFIG_KEY}`);
                setDescuento(response.data.valor || '0');
            } catch (err) {
                setError('No se pudo cargar la configuración de descuento.');
            } finally {
                setLoading(false);
            }
        };
        fetchDescuento();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await apiClient.put(`/configuracion/${CONFIG_KEY}?valor=${descuento}`);
            setSuccess('¡Descuento guardado correctamente!');
        } catch (err) {
            setError('Error al guardar el descuento.');
        }
    };
    
    return (
        <div className="admin-page-container">
            <h2 style={{ color: '#003366' }}>Gestión de Descuento Cliente Frecuente</h2>

            <div className="config-form-container">
                <h3 style={{ color: '#0056b3', marginTop: 0 }}>Descuento para Cliente Frecuente</h3>
                <p style={{ color: '#6c757d' }}>
                    Aplica un descuento general a todos los clientes marcados como "Frecuentes". 
                    Este porcentaje se aplicará sobre el total de sus compras.
                </p>

                <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
                    <label htmlFor="porcentaje-descuento" style={{ fontWeight: 'bold' }}>Porcentaje de Descuento (%):</label>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        {loading ? (
                            <p>Cargando...</p>
                        ) : (
                            <input
                                id="porcentaje-descuento"
                                type="number"
                                value={descuento}
                                onChange={(e) => setDescuento(e.target.value)}
                                placeholder="Ej: 5"
                                min="0"
                                max="100"
                                style={{ flexGrow: 1 }}
                            />
                        )}
                        <button type="submit" className="btn btn-success">Guardar</button>
                    </div>
                </form>
                {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
                {success && <p style={{ color: 'green', marginTop: '1rem' }}>{success}</p>}
            </div>

            <Link to="/admin/panel" className="admin-menu-action admin-return-button">
                Volver al Panel de Administrador
            </Link>
        </div>
    );
};

export default GestionDescuentoPage;