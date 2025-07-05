// frontend/src/pages/LoginPage.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import AuthContext from '../context/AuthContext'; 


const LoginPage = () => {
    const navigate = useNavigate();
       const { login } = useContext(AuthContext); // <-- Usa el contexto
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // El endpoint /token espera datos de formulario, no JSON.
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);

        try {
            const response = await apiClient.post('/token', params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            // Guardamos el token en localStorage para usarlo después
            login(response.data.access_token);
            
            // Redirigimos al usuario, por ejemplo, al panel de admin
            navigate('/');

        } catch (err) {
            setError(err.response?.data?.detail || 'Error al iniciar sesión');
        }
    };

    return (
        <div className="form-container">
            <h2>Iniciar Sesión</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Correo electrónico o Usuario</label>
                <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                <label htmlFor="password">Contraseña</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Ingresar</button>
                
                {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '1rem' }}>{error}</p>}
            </form>
            <div style={{ textAlign: 'center', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a href="/olvido-contrasena" className="form-link">¿Olvidaste tu contraseña?</a>
                <a href="/registro" className="form-link">¿No tienes una cuenta? Regístrate</a>
            </div>
        </div>
    );
};

export default LoginPage;