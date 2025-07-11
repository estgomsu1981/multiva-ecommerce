import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import ChatInterface, { AuthWall } from '../components/ChatInterface';
import AuthContext from '../context/AuthContext';
import apiClient from '../api/axios';

const AyudaPage = () => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [isBotTyping, setIsBotTyping] = useState(false); // Para mostrar "Bot está escribiendo..."

    // Establece el mensaje de bienvenida inicial del bot
    useEffect(() => {
        const initialBotMessage = {
            text: (
                <>
                    Hola 👋, soy <strong>Multiva Assist</strong>. Estoy aquí para resolver cualquier duda que tengas sobre nuestros productos, servicios o procesos de compra. ¿En qué te puedo ayudar?
                </>
            ),
            sender: 'bot'
        };
        setMessages([initialBotMessage]);
    }, []);

    // Función que se llama cuando el usuario envía un mensaje
    const handleHelpMessage = async (userInput) => {
        const userMessage = { text: userInput, sender: 'user' };
        
        // Añade el mensaje del usuario a la conversación
        const currentConversation = [...messages, userMessage];
        setMessages(currentConversation);
        setIsBotTyping(true); // El bot empieza a "escribir"

        // Preparamos el historial para enviar a nuestra API proxy
        const messagesForAPI = currentConversation.map(msg => ({
            role: msg.sender === 'bot' ? 'assistant' : 'user',
            // Aseguramos que el contenido sea un string
            content: typeof msg.text === 'string' ? msg.text : 'Consulta del usuario', 
        }));
        
        try {
            // La petición ahora va a nuestro propio backend
            const response = await apiClient.post('/chat/completions', messagesForAPI);

            const botResponseText = response.data.choices[0].message.content;
            const botResponse = { text: botResponseText, sender: 'bot' };
            
            // Añade la respuesta del bot a la conversación
            setMessages(prev => [...prev, botResponse]);

        } catch (error) {
            console.error("Error en la comunicación con el backend del chat:", error);
            const errorResponse = { text: "Lo siento, hubo un problema. Por favor, intenta de nuevo más tarde.", sender: 'bot' };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsBotTyping(false); // El bot deja de "escribir"
        }
    };

    return (
        <div className="chat-page-container">
            <h2 className="admin-panel-title">🤖 Multiva Assist - Centro de Ayuda</h2>
            
            {/* Muestra un aviso si el usuario no está logueado, pero no bloquea el chat */}
            {!user && (
                <AuthWall>
                    <p>Para una atención personalizada, por favor <Link to="/login">inicia sesión</Link>.</p>
                </AuthWall>
            )}

            <ChatInterface
                messages={messages}
                onSendMessage={handleHelpMessage}
                disabled={isBotTyping} // Deshabilita el input mientras el bot responde
                placeholder={isBotTyping ? "Multiva Assist está escribiendo..." : "Escribe tu pregunta..."}
            />
        </div>
    );
};

export default AyudaPage;