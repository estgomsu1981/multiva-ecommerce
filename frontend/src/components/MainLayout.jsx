// frontend/src/components/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom'; // <-- IMPORTANTE: USA OUTLET
import Header from './Header';

const MainLayout = () => {
    return (
        <>
            <Header />
            <main>
                {/* Outlet es un placeholder donde React Router renderizará el componente de la ruta actual */}
                <Outlet />
            </main>
            <footer className="main-footer">
                <p>© 2025 Multiva. Todos los derechos reservados.</p>
            </footer>
        </>
    );
};

export default MainLayout;