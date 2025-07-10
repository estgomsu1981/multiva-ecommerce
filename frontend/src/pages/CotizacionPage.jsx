import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import ChatInterface, { AuthWall } from '../components/ChatInterface';
import EditableUserDataForm from '../components/EditableUserDataForm';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import apiClient from '../api/axios';

const CotizacionPage = () => {
    const { user } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    
    const [messages, setMessages] = useState([]);
    const [conversationState, setConversationState] = useState('confirm_data');
    const [isEditingData, setIsEditingData] = useState(false);
    const [formMessage, setFormMessage] = useState(null); // Para mensajes dentro del formulario de edición

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

    const handleDataSave = async (updatedData) => {
        setFormMessage({ text: 'Guardando...', type: 'loading' });
        try {
            await apiClient.put(`/users/me/contact`, updatedData);
            
            // Oculta el formulario
            setIsEditingData(false);
            
            // Añade los mensajes de confirmación a la conversación
            const userConfirmationMessage = {
                text: <em style={{color: '#white'}}>Datos guardados...</em>,
                sender: 'user'
            };
            const botResponseMessage = {
                text: "¡Muchas gracias, tus datos han sido actualizados! ¿Tienes alguna otra consulta? (si/no)",
                sender: 'bot'
            };
            
            // Actualiza la conversación del chat
            setMessages(prev => [...prev, userConfirmationMessage, botResponseMessage]);
            
            setConversationState('post_update_query');

        } catch (error) {
            setFormMessage({ text: "Hubo un error al guardar. Inténtalo de nuevo.", type: 'error' });
        }
    };

    const handleQuoteMessage = (userInput) => {
        const userMessage = { text: userInput, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);

        const input = userInput.toLowerCase();

        if (conversationState === 'confirm_data') {
            if (input.includes('si') || input.includes('sí')) {
                setConversationState('final_message');
                setTimeout(() => setMessages(prev => [...prev, { text: "¡Perfecto! Hemos enviado tu solicitud. Un agente te contactará pronto.", sender: 'bot' }]), 500);
            } else {
                setIsEditingData(true);
                // Quitamos el "no" del usuario para que no se vea sobre el formulario
                setMessages(prev => prev.slice(0, -1));
            }
        } else if (conversationState === 'post_update_query') {
             if (input.includes('si') || input.includes('sí')) {
                setTimeout(() => setMessages(prev => [...prev, { text: "Por favor, escribe tu consulta.", sender: 'bot' }]), 500);
                setConversationState('final_query');
             } else {
                setConversationState('final_message');
                setTimeout(() => setMessages(prev => [...prev, { text: "Entendido. Tu cotización ha sido enviada. ¡Gracias!", sender: 'bot' }]), 500);
             }
        } else if (conversationState === 'final_query') {
            setConversationState('final_message');
            setTimeout(() => setMessages(prev => [...prev, { text: "Gracias por tu consulta, la hemos registrado junto a tu cotización.", sender: 'bot' }]), 500);
        }
    };
    
    const formatPrice = (price) => {
        const numericPrice = Number(price);
        if (isNaN(numericPrice)) return '₡0.00';
        return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(numericPrice);
    };

    const total = cartItems.reduce((sum, item) => sum + (Number(item.finalPrice) * Number(item.quantity)), 0);

    return (
        <div className="chat-page-container">
            <h2 className="admin-panel-title">🤖 Multiva Assist - Cotización</h2>
            
            <h3>📝 Pedido Cargado:</h3>
            <div className="table-responsive-wrapper" style={{marginBottom: '2rem'}}>
                <table>
                    <thead>
                        <tr><th>Producto</th><th>Cantidad</th><th>Precio Unit.</th><th>Subtotal</th></tr>
                    </thead>
                    <tbody>
                        {cartItems.map(item => (
                            <tr key={item.id}>
                                <td>{item.nombre}</td>
                                <td>{item.quantity}</td>
                                <td>{formatPrice(item.finalPrice)}</td>
                                <td>{formatPrice(item.finalPrice * item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="3" style={{textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', borderTop: '2px solid #333'}}>
                                Total del Pedido:
                            </td>
                            <td style={{fontWeight: 'bold', fontSize: '1.2rem', borderTop: '2px solid #333'}}>
                                {formatPrice(total)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            {!user ? (
                <AuthWall>
                    <p>Para solicitar una cotización, por favor <Link to="/login">inicia sesión</Link>.</p>
                </AuthWall>
            ) : (
                <>
                    {!isEditingData ? (
                        <ChatInterface
                            messages={messages}
                            onSendMessage={handleQuoteMessage}
                            disabled={conversationState === 'final_message'}
                            placeholder={
                                conversationState === 'confirm_data' ? "Escribe 'si' o 'no'..." :
                                conversationState === 'post_update_query' ? "Escribe 'si' o 'no'..." :
                                conversationState === 'final_message' ? "Conversación finalizada" : "Escribe tu mensaje..."
                            }
                        />
                    ) : (
                        <div className="chat-container">
                            <div className="chat-box">
                                {messages.map((msg, index) => (
                                    <div key={index} className={`chat-message ${msg.sender === 'bot' ? 'bot-message' : 'user-message'}`}>
                                        {msg.text}
                                    </div>
                                ))}
                                <EditableUserDataForm 
                                    initialData={{
                                        email: user.email,
                                        telefono: user.telefono,
                                        direccion: user.direccion,
                                    }}
                                    onSave={handleDataSave}
                                    onCancel={() => setIsEditingData(false)}
                                />
                                {formMessage && (
                                    <div className={`bot-message form-status-message ${formMessage.type}`}>
                                        {formMessage.text}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CotizacionPage;