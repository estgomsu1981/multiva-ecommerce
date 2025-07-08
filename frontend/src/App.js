// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Componentes de Layout y Páginas
import MainLayout from './components/MainLayout';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import LoginPage from './pages/LoginPage';
import RegistroPage from './pages/RegistroPage';
import AdminPanelPage from './pages/AdminPanelPage';
import GestionCategorias from './pages/GestionCategorias';
import GestionUsuarios from './pages/GestionUsuarios';

import './style.css';

function App() {
    return (
        <Router>
            <Routes>
                {/* --- RUTA PRINCIPAL CON LAYOUT --- */}
                <Route path="/" element={<MainLayout />}>
                    {/* Estas son las rutas que se renderizarán dentro del <Outlet> de MainLayout */}
                    <Route index element={<HomePage />} />
                    <Route path="catalogo/:categoryId" element={<CategoryPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="registro" element={<RegistroPage />} />
                    <Route path="admin/panel" element={<AdminPanelPage />} />
                    <Route path="admin/categorias" element={<GestionCategorias />} />
                    <Route path="admin/usuarios" element={<GestionUsuarios />} />
                    {/* Añade aquí otras rutas que usen el layout principal */}
                </Route>

                {/* Aquí podrías tener otras rutas que NO usen el MainLayout, si las necesitaras */}
                
            </Routes>
        </Router>
    );
}

export default App;