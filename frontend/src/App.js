// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegistroPage from './pages/RegistroPage';
import LoginPage from './pages/LoginPage'; 
import AdminPanelPage from './pages/AdminPanelPage'; 
import GestionCategorias from './pages/GestionCategorias'; 
import GestionUsuarios from './pages/GestionUsuarios'; 

import './style.css';

function App() {
    return (
        <Router>
            <Routes>

                {/* Rutas Públicas */}              
                <Route path="/" element={<HomePage />} />
                <Route path="/registro" element={<RegistroPage />} />
                <Route path="/login" element={<LoginPage />} /> 

                {/* Rutas de Administración */}
                <Route path="/admin/panel" element={<AdminPanelPage />} />
                <Route path="/admin/categorias" element={<GestionCategorias />} />
                <Route path="/admin/usuarios" element={<GestionUsuarios />} /> 
            </Routes>
        </Router>
    );
}

export default App;