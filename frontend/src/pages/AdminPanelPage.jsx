// frontend/src/pages/AdminPanelPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const AdminPanelPage = () => {
    return (
        <div className="container">
            <div className="admin-panel-container">
                <h2 className="admin-panel-title">Panel de Administrador</h2>

                <ul className="admin-menu-group">
                    {/* Grupo de Gestión de Inventario */}
                    <li>
                        <div className="admin-menu-header">Gestión de Inventario</div>
                        <ul className="admin-submenu">
                            <li><Link to="/admin/productos">› Gestión de Productos</Link></li>
                            <li><Link to="/admin/categorias">› Gestión de Categorías</Link></li>
                            <li><Link to="/admin/descuentos">› Gestión de Descuento Cliente Frecuente</Link></li>
                        </ul>
                    </li>

                    {/* Grupo de Gestión de Usuarios */}
                    <li>
                        <div className="admin-menu-header">Gestión de Usuarios</div>
                        <ul className="admin-submenu">
                            <li><Link to="/admin/usuarios">› Administrar Usuarios/Clientes</Link></li>
                        </ul>
                    </li>
                    <li>
                        <div className="admin-menu-header">Gestión de AI</div>
                        <ul className="admin-submenu">
                            <li><Link to="/admin/prompt">› Administrar Prompt del ChatBot</Link></li>
                        </ul>
                    </li>
                    {/* Botón para volver al sitio principal */}
                    <li>
                        <Link to="/" className="admin-menu-action">Volver al Sitio Principal</Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default AdminPanelPage;