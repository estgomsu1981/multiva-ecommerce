import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/axios';

const SmartChat = ({ initialMessages = [] }) => {
    // El estado de los mensajes se inicializa con los mensajes que le pasen
    const [messages, setMessages] = useState(initialMessages);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const chatBoxRef = useRef(null);

    // Efecto para hacer scroll automático en el chat
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    // Toda la lógica de comunicación con el backend vive aquí
    const handleSendMessage = async () => {
        if (inputValue.trim() === '' || isBotTyping) return;

        const userInput = inputValue;
        const userMessage = { text: userInput, sender: 'user' };
        
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInputValue('');
        setIsBotTyping(true);

        const messagesForAPI = newMessages
            .filter(msg => typeof msg.text === 'string')
            .map(msg => ({
                role: msg.sender === 'bot' ? 'assistant' : 'user',
                content: msg.text,
            }));
        
        try {
            const response = await apiClient.post('/chat/completions', messagesForAPI);
            let botResponseText = response.data.choices[0].message.content;
            botResponseText = botResponseText.replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim();

            if (botResponseText.includes("#REVISAR")) {
                botResponseText = botResponseText.replace(/#REVISAR/g, '').trim();
                try {
                    await apiClient.post('/faq/pending', { pregunta: userInput });
                } catch (logError) {
                    console.error("No se pudo registrar la pregunta pendiente:", logError);
                }
            }

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
        <div className="chat-container">
            <div className="chat-box" ref={chatBoxRef}>
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
    );
};

export default SmartChat;