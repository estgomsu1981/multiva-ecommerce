import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthWall } from '../components/ChatInterface';
import EditableUserDataForm from '../components/EditableUserDataForm';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import apiClient from '../api/axios';
import { enviarCotizacion } from '../services/quoteService';

const CotizacionPage = () => {
    const { user } = useContext(AuthContext);
    const { cartItems, clearCart } = useContext(CartContext); // <-- Corregido: pide clearCart
    
    const [messages, setMessages] = useState([]);
    const [conversationState, setConversationState] = useState('confirm_data');
    const [isEditingData, setIsEditingData] = useState(false);
    const [formMessage, setFormMessage] = useState(null);
    const [isBotTyping, setIsBotTyping] = useState(false); // <-- Corregido: añade este estado

    useEffect(() => {
        if (user && user.email) {
            const initialBotMessage = {
                text: (
                    <>
                        <p>Hola, {user.nombre}. Para continuar, por favor confirma que estos son tus datos de contacto:</p>
                        <p><strong>Correo:</strong> {user.email}</p>
                        <p><strong>Teléfono:</strong> {user.telefono}</p>
                        <p><strong>Dirección:</strong> {user.direccion}</p>
                        <p>¿Son correctos? (si/no)</p>
                    </>
                ),
                sender: 'bot'
            };
            setMessages([initialBotMessage]);
            setConversationState('confirm_data');
        }
    }, [user]);

    const handleSendQuote = async (contactData) => {
        setIsBotTyping(true); // Usa el estado
        const resultado = await enviarCotizacion({
            nombre: contactData.nombre,
            correo: contactData.email,
            telefono: contactData.telefono,
            direccion: contactData.direccion,
            pedido: cartItems
        });
        setIsBotTyping(false); // Usa el estado

        if (resultado.ok) {
            const finalMessage = { text: "¡Perfecto! Tu cotización ha sido enviada. Un agente te contactará pronto. Gracias por preferirnos.", sender: 'bot' };
            setMessages(prev => [...prev, finalMessage]);
            setConversationState('final_message');
            clearCart(); // Usa la función del contexto
        } else {
            const errorMessage = { text: `Lo siento, hubo un problema al enviar la cotización: ${resultado.mensaje}`, sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    const handleDataSave = async (updatedData) => {
        try {
            await apiClient.put(`/users/me/contact`, updatedData);
            handleSendQuote({ nombre: user.nombre, ...updatedData });
            setIsEditingData(false);
        } catch(err) {
            // ...
        }
    };

    const handleQuoteMessage = (userInput, addBotResponse) => {
        const userMessage = { text: userInput, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        const input = userInput.toLowerCase();
        if (conversationState === 'confirm_data') {
            if (input.includes('si')) {
                handleSendQuote({nombre: user.nombre, email: user.email, telefono: user.telefono, direccion: user.direccion});
            } else {
                setIsEditingData(true);
                setMessages(prev => prev.slice(0, -1));
            }
        }
    };
    
    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(Number(price) || 0);
    };

    const total = cartItems.reduce((sum, item) => sum + (Number(item.finalPrice) * Number(item.quantity)), 0);

    return (
        <div className="chat-page-container">
            <h2 className="admin-panel-title">🤖 Multiva Assist - Cotización</h2>
            
            <h3>📝 Pedido Cargado:</h3>
            <div className="table-responsive-wrapper" style={{marginBottom: '2rem'}}>
                 {/* ... (código de la tabla no cambia) ... */}
            </div>
            
            {/* ... (resto del JSX no cambia) ... */}
        </div>
    );
};

export default CotizacionPage;