import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Estado para el token, se inicializa desde localStorage
    const [token, setToken] = useState(() => localStorage.getItem('accessToken'));
    
    // Estado para guardar el objeto de usuario completo
    const [user, setUser] = useState(null);
    
    // Estado para el descuento de cliente frecuente
    const [frequentClientDiscount, setFrequentClientDiscount] = useState(0);

    // Este efecto se ejecuta cada vez que el token cambia (login/logout/carga inicial)
    useEffect(() => {
        const fetchUserData = async () => {
            if (token) {
                // Establecemos el token en las cabeceras de axios para esta y futuras peticiones
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                try {
                    // Hacemos la llamada al endpoint para obtener los datos del usuario logueado
                    const response = await apiClient.get('/users/me');
                    
                    // Guardamos el objeto de usuario completo que viene de la API
                    setUser(response.data); 

                    // Si el usuario es de categoría 'Frecuente', vamos a buscar su descuento
                    if (response.data.categoria_cliente === 'Frecuente') {
                        fetchDiscountConfig();
                    } else {
                        setFrequentClientDiscount(0); // Si no, el descuento es 0
                    }

                } catch (error) {
                    console.error("Sesión inválida o error al obtener datos del usuario:", error);
                    // Si la petición a /users/me falla (ej. token expirado), cerramos la sesión
                    logout();
                }
            } else {
                // Si no hay token, nos aseguramos de limpiar el estado y las cabeceras
                delete apiClient.defaults.headers.common['Authorization'];
                setUser(null);
                setFrequentClientDiscount(0);
            }
        };
        
        const fetchDiscountConfig = async () => {
            try {
                const response = await apiClient.get('/configuracion/descuento_cliente_frecuente');
                setFrequentClientDiscount(parseFloat(response.data.valor) || 0);
            } catch (error) {
                console.error("Error al cargar la configuración de descuento:", error);
                setFrequentClientDiscount(0);
            }
        };

        fetchUserData();
    }, [token]);

    // Función para iniciar sesión: guarda el nuevo token y actualiza el estado
    const login = (newToken) => {
        localStorage.setItem('accessToken', newToken);
        setToken(newToken);
    };

    // Función para cerrar sesión: limpia todo
    const logout = () => {
        localStorage.removeItem('accessToken');
        setToken(null);
        // setUser(null) y setFrequentClientDiscount(0) se limpian automáticamente por el useEffect
    };

    // El valor que el contexto proveerá a toda la aplicación
    return (
        <AuthContext.Provider value={{ token, user, login, logout, frequentClientDiscount }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;