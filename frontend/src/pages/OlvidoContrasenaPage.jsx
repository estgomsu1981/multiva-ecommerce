// frontend/src/pages/OlvidoContrasenaPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';

const OlvidoContrasenaPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            const response = await apiClient.post(`/.netlify/functions/password-recovery/${email}`);
            console.log('Solicitud de recuperación enviada para el email:', email);
            setMessage(response.data.message);
        } catch (err) {
            setError('Ocurrió un error. Por favor, intenta de nuevo.');
        }
    };

    return (
        <div className="form-container">
            <h2>Restablecer Contraseña</h2>
            <p style={{ textAlign: 'center', color: '#6c757d', marginBottom: '2rem' }}>
                Por favor, introduce tu dirección de correo para recibir un enlace de restablecimiento.
            </p>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Correo electrónico</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Enviar enlace
                </button>
            </form>
            {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
            {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
            <Link to="/login" className="form-link">Volver a Inicio de Sesión</Link>
        </div>
    );
};

export default OlvidoContrasenaPage;