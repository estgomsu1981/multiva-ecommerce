// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Necesitaremos esta librería

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('accessToken'));
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                // Aquí asumimos que el token incluye el nombre de usuario y el rol
                // Necesitaremos ajustar el backend para que añada esta información al token
                setUser({ 
                    username: decodedToken.sub,
                    nombre: decodedToken.nombre,
                    rol: decodedToken.rol || 'Cliente' 
                });
            } catch (error) {
                console.error("Token inválido:", error);
                logout();
            }
        } else {
            setUser(null);
        }
    }, [token]);

    const login = (newToken) => {
        localStorage.setItem('accessToken', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;