// frontend/src/pages/CotizacionPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import ChatInterface, { AuthWall } from '../components/ChatInterface';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import apiClient from '../api/axios';

const CotizacionPage = () => {
    const { user } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const [conversationState, setConversationState] = useState('confirm_data'); // confirm_data -> edit_data -> confirm_update -> final_message
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        if (user) {
            setUserData({
                nombre: user.nombre,
                email: user.email, // Necesitamos añadir email y dirección al token/contexto
                direccion: user.direccion,
                telefono: user.telefono,
            });
        }
    }, [user]);

    const handleQuoteMessage = (inputValue, setMessages) => {
        const input = inputValue.toLowerCase();

        if (conversationState === 'confirm_data') {
            if (input.includes('si') || input.includes('sí')) {
                setMessages(prev => [...prev, { text: "¡Perfecto! Hemos enviado tu solicitud de cotización. Un agente te contactará pronto.", sender: 'bot' }]);
                setConversationState('final_message');
            } else {
                setMessages(prev => [...prev, { text: "Por favor, introduce tu dirección de envío:", sender: 'bot' }]);
                setConversationState('edit_data_direccion');
            }
        } else if (conversationState === 'edit_data_direccion') {
            setUserData(prev => ({ ...prev, direccion: inputValue }));
            setMessages(prev => [...prev, { text: "Gracias. Ahora, tu correo electrónico:", sender: 'bot' }]);
            setConversationState('edit_data_email');
        } else if (conversationState === 'edit_data_email') {
            setUserData(prev => ({ ...prev, email: inputValue }));
            setMessages(prev => [...prev, { text: "Y por último, tu teléfono:", sender: 'bot' }]);
            setConversationState('edit_data_telefono');
        } else if (conversationState === 'edit_data_telefono') {
            setUserData(prev => ({ ...prev, telefono: inputValue }));
            const botMessage = (
                <>
                    <p>Gracias. Los nuevos datos son:</p>
                    <p><strong>Dirección:</strong> {userData.direccion}</p>
                    <p><strong>Correo:</strong> {userData.email}</p>
                    <p><strong>Teléfono:</strong> {inputValue}</p>
                    <p>¿Quieres actualizar estos datos en tu perfil para futuras compras? (si/no)</p>
                </>
            );
            setMessages(prev => [...prev, { text: botMessage, sender: 'bot' }]);
            setConversationState('confirm_update');
        } else if (conversationState === 'confirm_update') {
            if (input.includes('si') || input.includes('sí')) {
                // Lógica para llamar a la API y actualizar el perfil del usuario
                // apiClient.put(`/users/${user.id}`, userData)...
                setMessages(prev => [...prev, { text: "¡Datos actualizados! Tu cotización ha sido enviada.", sender: 'bot' }]);
            } else {
                setMessages(prev => [...prev, { text: "Entendido. Tu cotización con los datos temporales ha sido enviada.", sender: 'bot' }]);
            }
            setConversationState('final_message');
        }
    };

    const getInitialMessage = () => {
        if (!user) return { text: "", sender: 'bot' };
        return {
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
    };

    return (
        <div className="chat-page-container">
            <h2 className="admin-panel-title">🤖 Multiva Assist - Cotización</h2>
            
            <h3>📝 Pedido Cargado:</h3>
            <div className="table-responsive-wrapper">
                {/* (Pega aquí el código de la tabla de tu CartPage.jsx) */}
            </div>
            
            <div style={{marginTop: '2rem'}}>
                {!user ? (
                    <AuthWall />
                ) : (
                    <ChatInterface
                        initialMessage={getInitialMessage()}
                        onSendMessage={handleQuoteMessage}
                        disabled={!user || conversationState === 'final_message'}
                    />
                )}
            </div>
        </div>
    );
};

export default CotizacionPage;