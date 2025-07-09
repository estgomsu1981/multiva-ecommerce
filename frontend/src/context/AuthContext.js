import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import apiClient from '../api/axios'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('accessToken'));
    const [user, setUser] = useState(null);
    const [frequentClientDiscount, setFrequentClientDiscount] = useState(0);

    useEffect(() => {

        const fetchDiscountConfig = async () => {
            try {
                const response = await apiClient.get('/configuracion/descuento_cliente_frecuente');
                setFrequentClientDiscount(parseFloat(response.data.valor) || 0);
            } catch (error) {
                console.error("Error al cargar el descuento de cliente frecuente:", error);
                setFrequentClientDiscount(0); // Por seguridad, si falla, el descuento es 0
            }
        };



        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                // Aquí asumimos que el token incluye el nombre de usuario y el rol
                // Necesitaremos ajustar el backend para que añada esta información al token
                setUser({ 
                    username: decodedToken.sub,
                    nombre: decodedToken.nombre,
                    rol: decodedToken.rol || 'Cliente' 
                    categoria: decodedToken.categoria_cliente || 'Regular' 
                });

                    if ((decodedToken.categoria_cliente || 'Regular') === 'Frecuente') {
                        fetchDiscountConfig();
                    } else {
                        setFrequentClientDiscount(0); 
                    }
            } catch (error) {
                console.error("Token inválido:", error);
                logout();
            }
        } else {
            setUser(null);
            setFrequentClientDiscount(0);
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
        <AuthContext.Provider value={{ token, user, login, logout, frequentClientDiscount}}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;