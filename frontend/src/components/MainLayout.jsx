// frontend/src/components/MainLayout.jsx
import React from 'react';
import Header from './Header'; // Importa el header que acabamos de crear

const MainLayout = ({ children }) => {
    return (
        <>
            <Header />
            <main>
                {children} {/* Aquí se renderizará la página actual (ej: HomePage, CategoryPage) */}
            </main>
            <footer className="main-footer">
                <p>© 2025 Multiva. Todos los derechos reservados.</p>
            </footer>
        </>
    );
};

export default MainLayout;