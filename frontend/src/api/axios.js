// frontend/src/api/axios.js
import axios from 'axios';

// ANTES:
// const API_BASE_URL = 'http://127.0.0.1:8000';

// AHORA:
const API_BASE_URL = 'https://multiva-ecommerce.onrender.com'; // <-- ¡TU NUEVA URL DE PRODUCCIÓN!

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;