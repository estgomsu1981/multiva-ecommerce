import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ChatInterface = ({ initialMessage, onSendMessage, disabled }) => {
    const [messages, setMessages] = useState(initialMessage ? [initialMessage] : []);
    const [inputValue, setInputValue] = useState('');

    const handleSend = () => {
        if (inputValue.trim() === '') return;

        const userMessage = { text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        
        // Llama a la función que nos pasan desde el componente padre
        onSendMessage(inputValue, setMessages);

        setInputValue('');
    };

    return (
        <div className="chat-container">
            <div className="chat-box">
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
                    placeholder="Escribí tu mensaje..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={disabled} // Se deshabilita si el usuario no está logueado
                />
                <button onClick={handleSend} disabled={disabled} className="btn btn-primary">
                    Enviar
                </button>
            </div>
        </div>
    );
};

// Componente que se muestra cuando el usuario no está autenticado
export const AuthWall = () => (
    <div className="auth-wall">
        <p>
            Para continuar, por favor <Link to="/login">inicia sesión</Link> o <Link to="/registro">crea una cuenta</Link>.
        </p>
    </div>
);

export default ChatInterface; 