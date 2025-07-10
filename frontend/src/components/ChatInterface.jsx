import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const ChatInterface = ({ messages, onSendMessage, disabled, placeholder = "Escribí tu mensaje..." }) => {
    const [inputValue, setInputValue] = useState('');
    const chatBoxRef = useRef(null); // Ref para hacer scroll automático

    // Efecto para hacer scroll hacia abajo cada vez que se añade un mensaje
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (inputValue.trim() === '' || disabled) return;
        onSendMessage(inputValue); // Llama a la función del padre con el texto del usuario
        setInputValue('');
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
                    placeholder={placeholder}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={disabled}
                />
                <button onClick={handleSend} disabled={disabled} className="btn btn-primary">
                    Enviar
                </button>
            </div>
        </div>
    );
};

// Componente para mostrar cuando se requiere login
export const AuthWall = ({ children }) => (
    <div className="auth-wall">
        {children || <p>Para continuar, por favor <Link to="/login">inicia sesión</Link>.</p>}
    </div>
);

export default ChatInterface;