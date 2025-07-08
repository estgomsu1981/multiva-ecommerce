// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import HomePage from './pages/HomePage';
import RegistroPage from './pages/RegistroPage';
import LoginPage from './pages/LoginPage'; 
import AdminPanelPage from './pages/AdminPanelPage'; 
import GestionCategorias from './pages/GestionCategorias'; 
import GestionUsuarios from './pages/GestionUsuarios'; 
import GestionProductos from './pages/GestionProductos';
import CategoryPage from './pages/CategoryPage'; 


import './style.css';

function App() {
    return (
        <Router>
            <Routes>

                {/* Rutas Públicas */}              
                <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
                <Route path="/catalogo/:id" element={<MainLayout><CategoryPage /></MainLayout>} />
                <Route path="/registro" element={<RegistroPage />} />
                <Route path="/login" element={<LoginPage />} /> 

                {/* Rutas de Administración */}
                <Route path="/admin/panel" element={<AdminPanelPage />} />
                <Route path="/admin/categorias" element={<GestionCategorias />} />
                <Route path="/admin/usuarios" element={<GestionUsuarios />} /> 
                <Route path="/admin/productos" element={<GestionProductos />} />
            </Routes>
        </Router>
    );
}

export default App;