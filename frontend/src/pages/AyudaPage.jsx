// frontend/src/pages/AyudaPage.jsx
import React, { useState, useEffect, useContext } from 'react'; // <-- Añade useState y useEffect
import ChatInterface, { AuthWall } from '../components/ChatInterface';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom'; // Importa Link
import apiClient from '../api/axios'; // Importa apiClient para las solicitudes

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
        setMessages(prevMessages => [...prevMessages, userMessage]);

        // --- LLAMADA A LA API DE OPENROUTER ---
        const sendMessageToOpenRouter = async (messagesToSend) => {
            try {
                const response = await apiClient.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    {
                        model: 'mistralai/mistral-7b-instruct',
                        messages: [
                            {
                                role: 'system',
                                content: "Sos Multiva Assist, un asistente de ventas especializado en responder preguntas sobre una ferretería en Costa Rica.  Puedes responder preguntas sobre envíos, métodos de pago (transferencia bancaria, SINPE), productos, la empresa, etc. Si no sabes la respuesta exacta, ofrece información general o sugiere contactar a un agente.",
                            },
                            ...messagesToSend.map(msg => ({ role: msg.sender, content: msg.text })),
                        ],
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${process.env.REACT_APP_OPENROUTER_API_KEY}`,  // Reemplaza con tu API key real de OpenRouter
                            'Content-Type': 'application/json',
                            'HTTP-Referer': 'http://localhost',  // O tu URL
                            'X-Title': 'Asistente Ferretería',
                        },
                    }
                );

                // Procesar la respuesta del modelo
                const botResponseText = response.data.choices[0].message.content;
                const botResponse = { text: botResponseText, sender: 'bot' };
                setMessages(prevMessages => [...prevMessages, botResponse]);

            } catch (error) {
                console.error("Error en la comunicación con OpenRouter:", error);
                // En caso de error, mostramos un mensaje genérico al usuario
                const errorResponse = { text: "Lo siento, hubo un problema. Por favor, intenta de nuevo más tarde.", sender: 'bot' };
                setMessages(prevMessages => [...prevMessages, errorResponse]);
            }
        };

        // --- Crear un array limpio de mensajes para enviar ---
        const messagesToSend = [...messages, userMessage].map(msg => ({
            role: msg.sender,
            content: msg.text,
        }));

        sendMessageToOpenRouter(messagesToSend);
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