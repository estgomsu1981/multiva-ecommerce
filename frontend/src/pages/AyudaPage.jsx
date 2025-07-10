// frontend/src/pages/AyudaPage.jsx
import React, { useState, useEffect, useContext } from 'react'; // <-- Añade useState y useEffect
import ChatInterface, { AuthWall } from '../components/ChatInterface';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom'; // Importa Link

const AyudaPage = () => {
    const { user } = useContext(AuthContext);

    // --- ESTADO PARA LOS MENSAJES ---
    const [messages, setMessages] = useState([]);

    // --- MENSAJE INICIAL ---
    const initialBotMessage = {
        text: (
            <>
                Hola 👋, soy <strong>Multiva Assist</strong>. Estoy aquí para resolver cualquier duda que tengas sobre nuestros productos, servicios o procesos de compra. ¿En qué te puedo ayudar?
            </>
        ),
        sender: 'bot'
    };

    // --- INICIALIZAR EL CHAT ---
    // Usamos useEffect para establecer el mensaje inicial solo una vez
    useEffect(() => {
        setMessages([initialBotMessage]);
    }, []); // El array vacío asegura que se ejecute solo una vez al montar

    // --- LÓGICA DE RESPUESTA ---
    const handleHelpMessage = (userInput) => {
        // Añadimos el mensaje del usuario al chat
        const userMessage = { text: userInput, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);

        // Simulamos la respuesta del bot
        setTimeout(() => {
            let botResponseText = "Gracias por tu pregunta. Un agente te contactará pronto. También puedes visitar nuestra sección de Preguntas Frecuentes.";
            if (userInput.toLowerCase().includes('envío')) {
                botResponseText = "Realizamos envíos a todo el país. Puedes ver más detalles en la página de Preguntas Frecuentes.";
            } else if (userInput.toLowerCase().includes('pago')) {
                botResponseText = "Aceptamos transferencias bancarias SINPE. Encontrarás los detalles durante el proceso de cotización.";
            }
            const botResponse = { text: botResponseText, sender: 'bot' };
            setMessages(prev => [...prev, botResponse]);
        }, 1000);
    };

    return (
        <div className="chat-page-container">
            <h2 className="admin-panel-title">🤖 Multiva Assist - Centro de Ayuda</h2>
            
            {!user && (
                <AuthWall>
                    <p>Para una atención personalizada, por favor <Link to="/login">inicia sesión</Link>.</p>
                </AuthWall>
            )}

            <ChatInterface
                messages={messages} // <-- Ahora pasamos el array de mensajes del estado
                onSendMessage={handleHelpMessage}
                // Permitimos chatear aunque no esté logueado, pero el AuthWall lo sugiere
                disabled={false} 
            />
        </div>
    );
};

export default AyudaPage;