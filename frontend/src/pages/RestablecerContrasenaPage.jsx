// frontend/src/pages/RestablecerContrasenaPage.jsx
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';

const RestablecerContrasenaPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    if (!token) {
        return <div className="container"><p style={{color: 'red'}}>Token de restablecimiento no válido o faltante.</p></div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        setError('');
        setMessage('');
        try {
            await apiClient.post('/reset-password/', { token, new_password: password });
            setMessage('¡Contraseña actualizada con éxito! Serás redirigido al inicio de sesión.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'El token es inválido o ha expirado.');
        }
    };

    return (
        <div className="form-container">
            <h2>Crear Nueva Contraseña</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="password">Nueva Contraseña</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Guardar Contraseña
                </button>
            </form>
            {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
            {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
        </div>
    );
};

export default RestablecerContrasenaPage;