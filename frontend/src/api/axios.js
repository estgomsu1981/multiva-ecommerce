// frontend/src/api/axios.js
import axios from 'axios';

const API_BASE_URL = 'https://multiva-ecommerce.onrender.com';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- INTERCEPTOR DE PETICIONES ---
// Esta función se ejecutará ANTES de que cada petición sea enviada.
apiClient.interceptors.request.use(
    (config) => {
        // Obtenemos el token del localStorage en el momento de la petición
        const token = localStorage.getItem('accessToken');
        
        // Si el token existe, lo añadimos a la cabecera de autorización
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Devolvemos la configuración modificada para que la petición continúe
        return config; 
    },
    (error) => {
        // Manejamos errores en la configuración de la petición
        return Promise.reject(error);
    }
);

export default apiClient;