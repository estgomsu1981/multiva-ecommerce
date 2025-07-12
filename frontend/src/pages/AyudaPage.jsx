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
    const currentConversation = [...messages, userMessage];
    setMessages(currentConversation);
    setIsBotTyping(true);

    // --- LÓGICA CORREGIDA ---
    // 1. Filtramos los mensajes para quitar los que no son string (como el mensaje de bienvenida con JSX)
    // 2. Mapeamos al formato que la API espera.
    const messagesForAPI = currentConversation
        .filter(msg => typeof msg.text === 'string') // Solo nos quedamos con los mensajes de texto
        .map(msg => ({
            role: msg.sender === 'bot' ? 'assistant' : 'user',
            content: msg.text,
        }));
    // ----------------------

    try {
        const response = await apiClient.post('/chat/completions', messagesForAPI);
        const botResponseText = response.data.choices[0].message.content;
        botResponseText = botResponseText.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim();
        const botResponse = { text: botResponseText, sender: 'bot' };
        setMessages(prev => [...prev, botResponse]);
    } catch (error) {
        console.error("Error en la comunicación con el backend del chat:", error);
        const errorResponse = { text: "Lo siento, hubo un problema. Por favor, intenta de nuevo más tarde.", sender: 'bot' };
        setMessages(prev => [...prev, errorResponse]);
    } finally {
        setIsBotTyping(false);
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