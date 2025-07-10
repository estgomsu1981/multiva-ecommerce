// frontend/src/pages/RegistroPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';

const RegistroPage = () => {
    // ... (toda la lógica de estados y funciones permanece igual) ...
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        direccion: '',
        telefono: '',
        usuario: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await apiClient.post('/users/', formData);
            setSuccess('¡Registro exitoso! Serás redirigido al inicio de sesión.');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Ocurrió un error en el registro.');
        }
    };

    // --- RENDERIZADO CON LAS NUEVAS CLASES CSS ---
    return (
        // Usamos la nueva clase 'form-container' en el div principal
        <div className="form-container"> 
            <h2>Crear Nueva Cuenta</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="nombre">Nombre</label>
                <input id="nombre" name="nombre" type="text" onChange={handleChange} required />
                
                <label htmlFor="apellidos">Apellidos</label>
                <input id="apellidos" name="apellidos" type="text" onChange={handleChange} required />

                <label htmlFor="direccion">Dirección</label>
                <input id="direccion" name="direccion" type="text" onChange={handleChange} required />
                
                <label htmlFor="telefono">Teléfono</label>
                <input id="telefono" name="telefono" type="tel" onChange={handleChange} required />    

                <label htmlFor="usuario">Nombre de Usuario</label>
                <input id="usuario" name="usuario" type="text" onChange={handleChange} placeholder="Ejemplo: usuario123" required />

                <label htmlFor="email">Correo electrónico</label>
                <input id="email" name="email" type="email" onChange={handleChange} required />

                <label htmlFor="password">Contraseña</label>
                <input id="password" name="password" type="password" onChange={handleChange} required />
     

                {/* El botón ya tiene la clase .btn y .btn-primary, que están estilizadas */}
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Registrarse</button>
                
                {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '1rem' }}>{error}</p>}
                {success && <p style={{ color: 'green', textAlign: 'center', marginTop: '1rem' }}>{success}</p>}
            </form>
            
            {/* Usamos la nueva clase 'form-link' para el enlace */}
            <a href="/login" className="form-link">¿Ya tienes una cuenta? Inicia Sesión</a>
        </div>
    );
};

export default RegistroPage;