import React, { useContext } from 'react';
import ChatInterface, { AuthWall } from '../components/ChatInterface';
import AuthContext from '../context/AuthContext';

const AyudaPage = () => {
    const { user } = useContext(AuthContext);

    const handleHelpMessage = (inputValue, setMessages) => {
        // Lógica de respuesta del bot de ayuda
        setTimeout(() => {
            let botResponse = "Gracias por tu pregunta. Un agente te contactará pronto. También puedes visitar nuestra sección de Preguntas Frecuentes.";
            if (inputValue.toLowerCase().includes('envío')) {
                botResponse = "Realizamos envíos a todo el país. Puedes ver más detalles en la página de Preguntas Frecuentes.";
            }
            setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
        }, 1000);
    };

    const initialBotMessage = {
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
            {!user && <AuthWall />}
            <ChatInterface
                initialMessage={initialBotMessage}
                onSendMessage={handleHelpMessage}
                disabled={!user} // El chat se deshabilita si no hay usuario
            />
        </div>
    );
};

export default AyudaPage;