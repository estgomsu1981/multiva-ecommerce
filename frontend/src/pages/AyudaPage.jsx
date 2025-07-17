import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import SmartChat from '../components/SmartChat'; // Importamos el componente reutilizable
import AuthContext from '../context/AuthContext';
import { AuthWall } from '../components/ChatInterface'; // Podemos mantener el AuthWall

const AyudaPage = () => {
    const { user } = useContext(AuthContext);

    // El mensaje de bienvenida se define aquí y se pasa como prop
    const welcomeMessage = {
        text: (
            <>
                Hola 👋, soy <strong>Multiva Assist</strong>. Estoy aquí para resolver cualquier duda que tengas sobre nuestros productos, servicios o procesos de compra. ¿En qué te puedo ayudar?
            </>
        ),
        sender: 'bot'
    };

    return (
        <div className="chat-page-container">
            <h2 className="admin-panel-title">🤖 Multiva Assist - Centro de Ayuda</h2>
            
            {!user && (
                <AuthWall>
                    <p>Para una atención personalizada, por favor <Link to="/login">inicia sesión</Link>.</p>
                </AuthWall>
            )}

            {/* Simplemente renderizamos SmartChat pasándole el mensaje inicial */}
            <SmartChat initialMessages={[welcomeMessage]} />
        </div>
    );
};

export default AyudaPage;