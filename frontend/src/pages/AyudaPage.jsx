import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthWall } from '../components/ChatInterface'; // Importamos solo AuthWall
import AuthContext from '../context/AuthContext';
import apiClient from '../api/axios';

const AyudaPage = () => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const chatBoxRef = useRef(null); // Para el scroll automático

    // Efecto para hacer scroll hacia abajo cada vez que se añade un mensaje
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (inputValue.trim() === '' || isBotTyping) return;

        const userMessage = { text: inputValue, sender: 'user' };
        const newMessagesForUI = [...messages, userMessage];
        setMessages(newMessagesForUI);
        setInputValue('');
        setIsBotTyping(true);

        const messagesForAPI = newMessagesForUI.map(msg => ({
            role: msg.sender === 'bot' ? 'assistant' : 'user',
            content: msg.text,
        }));
        
        try {
            const response = await apiClient.post('/chat/completions', messagesForAPI);
            let botResponseText = response.data.choices[0].message.content;
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
            
            {!user && (
                <AuthWall>
                    <p>Para una atención personalizada, por favor <Link to="/login">inicia sesión</Link>.</p>
                </AuthWall>
            )}

            <div className="chat-container">
                <div className="chat-box" ref={chatBoxRef}>
                    <div className="chat-message bot-message">
                        Hola 👋, soy <strong>Multiva Assist</strong>. Estoy aquí para resolver cualquier duda que tengas sobre nuestros productos, servicios o procesos de compra. ¿En qué te puedo ayudar?
                    </div>
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