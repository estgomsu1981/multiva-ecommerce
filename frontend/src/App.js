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
import GestionProductos from './pages/GestionProductos'; 
import GestionDescuentoPage from './pages/GestionDescuentoPage';
import DescuentosPage from './pages/DescuentosPage';
import CartPage from './pages/CartPage';
import AyudaPage from './pages/AyudaPage';
import CotizacionPage from './pages/CotizacionPage';
import GestionPromptPage from './pages/GestionPromptPage';
import PreguntasSinResponderPage from './pages/PreguntasSinResponderPage';
import AcercaDePage from './pages/AcercaDePage'; 
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
                    <Route path="/admin/productos" element={<GestionProductos />} /> 
                    <Route path="/admin/descuentos" element={<GestionDescuentoPage />} />
                    <Route path="/descuentos" element={<DescuentosPage />} />
                    <Route path="/carrito" element={<CartPage />} />
                    <Route path="/ayuda" element={<AyudaPage />} />
                    <Route path="/solicitar-cotizacion" element={<CotizacionPage />} />
                    <Route path="/admin/prompt" element={<GestionPromptPage />} />
                    <Route path="/admin/preguntas-sin-responder" element={<PreguntasSinResponderPage />} />
                    <Route path="/acerca-de-la-empresa" element={<AcercaDePage />} />
                </Route>               
            </Routes>
        </Router>
    );
}

export default App;