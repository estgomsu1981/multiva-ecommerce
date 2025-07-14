import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthWall } from '../components/ChatInterface'; // Asumimos que ChatInterface exporta AuthWall
import AuthContext from '../context/AuthContext';
import apiClient from '../api/axios';

const AyudaPage = () => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const chatBoxRef = useRef(null);

    // Efecto para hacer scroll hacia abajo cada vez que se añade un mensaje
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    // Establece el mensaje de bienvenida inicial del bot solo una vez
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

    const handleSendMessage = async () => {
        if (inputValue.trim() === '' || isBotTyping) return;

        const userInput = inputValue; // Guardamos la pregunta original del usuario
        const userMessage = { text: userInput, sender: 'user' };
        
        // Añadimos el mensaje del usuario al estado para una respuesta visual inmediata
        const newMessagesForUI = [...messages, userMessage];
        setMessages(newMessagesForUI);
        setInputValue('');
        setIsBotTyping(true);

        // Preparamos el historial para enviar a nuestra API
        // Excluimos el mensaje de bienvenida que contiene JSX
        const messagesForAPI = newMessagesForUI.filter(msg => typeof msg.text === 'string').map(msg => ({
            role: msg.sender === 'bot' ? 'assistant' : 'user',
            content: msg.text,
        }));
        
        try {
            const response = await apiClient.post('/chat/completions', messagesForAPI);
            let botResponseText = response.data.choices[0].message.content;

            // --- LÓGICA PARA DETECTAR #REVISAR Y REGISTRAR LA PREGUNTA ---
            if (botResponseText.includes("#REVISAR")) {
                console.log("Detectado #REVISAR. Registrando pregunta...");
                // Quitamos la etiqueta para no mostrarla al usuario
                botResponseText = botResponseText.replace(/#REVISAR/g, '').trim();
                
                // Llamamos a la API en segundo plano para guardar la pregunta
                try {
                    await apiClient.post('/faq/pending', { pregunta: userInput });
                    console.log(`Pregunta registrada: "${userInput}"`);
                } catch (logError) {
                    // Este error no se muestra al usuario, solo en consola.
                    console.error("No se pudo registrar la pregunta pendiente:", logError);
                }
            }
            // -----------------------------------------------------------

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
            
            {!user && (
                <AuthWall>
                    <p>Para una atención personalizada, por favor <Link to="/login">inicia sesión</Link>.</p>
                </AuthWall>
            )}

            <div className="chat-container">
                <div className="chat-box" ref={chatBoxRef}>
                    {/* El mensaje de bienvenida ahora se maneja con el estado, pero se podría separar */}
                    {messages.map((msg, index) => (
                        <div key={index} className={`chat-message ${msg.sender === 'bot' ? 'bot-message' : 'user-message'}`}>
                            {msg.text}
                        </div>
                    ))}
                </div>
                <div className="input-area">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={isBotTyping ? "Multiva Assist está escribiendo..." : "Escribe tu pregunta..."}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={isBotTyping}
                    />
                    <button onClick={handleSendMessage} disabled={isBotTyping} className="btn btn-primary">
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AyudaPage;