import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ChatInterface, { AuthWall } from '../components/ChatInterface';
import SmartChat from '../components/SmartChat';
import EditableUserDataForm from '../components/EditableUserDataForm';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import apiClient from '../api/axios';
import { enviarCotizacion } from '../services/quoteService';

const CotizacionPage = () => {
    const { user } = useContext(AuthContext);
    const { cartItems, clearCart } = useContext(CartContext);
    const navigate = useNavigate();
    
    const [messages, setMessages] = useState([]);
    const [conversationState, setConversationState] = useState('initial');
    const [isEditingData, setIsEditingData] = useState(false);
    const [formMessage, setFormMessage] = useState(null);

    const chatBoxRef = useRef(null);


    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(Number(price) || 0);
    };

    useEffect(() => {
        if (user && cartItems.length === 0 && conversationState === 'initial') {
            alert("Tu carrito está vacío. Añade productos para poder cotizar.");
            navigate('/');
            return;
        }
        if (user && user.email && conversationState === 'initial') {
            const initialBotMessage = {
                text: (
                    <>
                        <p>Hola, {user.nombre}. Para continuar, por favor confirma tus datos de contacto:</p>
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
    }, [user, cartItems, conversationState, navigate]);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

    const handleDataSave = async (updatedData) => {
        setFormMessage({ text: 'Guardando...', type: 'loading' });
        try {
            await apiClient.put(`/users/me/contact`, updatedData);
            const resultado = await enviarCotizacion({ nombre: user.nombre, ...updatedData, pedido: cartItems });
            if (resultado.ok) {
                const successMessage = { text: <><strong>✔ ¡Datos actualizados y cotización enviada!</strong><p>¿Necesitas ayuda con algo más? (si/no)</p></>, sender: 'bot' };
                setMessages(prev => [...messages.slice(0, 1), successMessage]);
                setConversationState('post_update_query');
                setIsEditingData(false);
                clearCart();
            } else {
                 throw new Error(resultado.mensaje);
            }
        } catch (error) {
            setFormMessage({ text: `Hubo un error al guardar: ${error.message}`, type: 'error' });
        }
    };

    const handleInitialChat = async (userInput) => {
        const userMessage = { text: userInput, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        const input = userInput.toLowerCase();

        if (conversationState === 'confirm_data') {
            if (input.includes('si')) {
                // Preparamos los datos explícitamente para asegurar que no falte nada
                const contactData = {
                    nombre: user.nombre,
                    correo: user.email,
                    telefono: user.telefono,
                    direccion: user.direccion,
                    pedido: cartItems
                };

                const resultado = await enviarCotizacion(contactData);
                
                if (resultado.ok) {
                    setMessages(prev => [...prev, { text: "¡Perfecto! Tu cotización ha sido enviada. ¿Necesitas ayuda con algo más? (si/no)", sender: 'bot' }]);
                    setConversationState('post_confirm_query');
                    clearCart();
                } else {
                    setMessages(prev => [...prev, { text: `Lo siento, hubo un problema: ${resultado.mensaje}`, sender: 'bot' }]);
                }
            } else {
                setIsEditingData(true);
            }
        } else if (conversationState === 'post_confirm_query' || conversationState === 'post_update_query') {
            if (input.includes('si')) {
                setConversationState('general_help'); // Cambia a modo de ayuda general
                const botNextMessage = { text: "De acuerdo. Por favor, escribe tu consulta.", sender: 'bot' };
                setMessages(prev => [...prev, botNextMessage]);
            } else {
                setConversationState('final_message');
                setTimeout(() => setMessages(prev => [...prev, { text: "Entendido. ¡Gracias por tu tiempo!", sender: 'bot' }]), 500);
            }
        }
    };

    const onCancelEdit = () => {
        setIsEditingData(false);
        setMessages(messages.slice(0, 1)); // Vuelve al mensaje inicial
    };

    const total = cartItems.reduce((sum, item) => sum + (Number(item.finalPrice) * Number(item.quantity)), 0);

    return (
        <div className="chat-page-container">
            <h2 className="admin-panel-title">🤖 Multiva Assist - Cotización</h2>
            
            <h3>📝 Pedido Cargado:</h3>
            <div className="table-responsive-wrapper" style={{marginBottom: '2rem'}}>
                <table>
                    <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio Unit.</th><th>Subtotal</th></tr></thead>
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
                            <td colSpan="3" style={{textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', borderTop: '2px solid #333'}}>Total del Pedido:</td>
                            <td style={{fontWeight: 'bold', fontSize: '1.2rem', borderTop: '2px solid #333'}}>{formatPrice(total)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div style={{marginTop: '2rem'}}>
                {!user ? (
                    <AuthWall><p>Para solicitar una cotización, por favor <Link to="/login">inicia sesión</Link>.</p></AuthWall>
                ) : isEditingData ? (
                    <div className="chat-container">
                        <div className="chat-box">
                            {messages.map((msg, index) => <div key={index} className={`chat-message ${msg.sender === 'bot' ? 'bot-message' : 'user-message'}`}>{msg.text}</div>)}
                            <EditableUserDataForm 
                                initialData={{ email: user.email, telefono: user.telefono, direccion: user.direccion }}
                                onSave={handleDataSave}
                                onCancel={onCancelEdit}
                            />
                            {formMessage && <div className={`bot-message form-status-message ${formMessage.type}`}>{formMessage.text}</div>}
                        </div>
                    </div>
                ) : conversationState === 'general_help' ? (
                    <SmartChat initialMessages={messages} />
                ) : (
                    <ChatInterface
                        messages={messages}
                        onSendMessage={handleInitialChat}
                        disabled={conversationState === 'final_message'}
                        placeholder={conversationState === 'final_message' ? 'Conversación finalizada' : 'Escribe "si" o "no"...'}
                    />
                )}
            </div>
        </div>
    );
};

export default CotizacionPage;