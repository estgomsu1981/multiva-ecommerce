// frontend/src/pages/CotizacionPage.jsx
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
    
    const [conversationState, setConversationState] = useState('confirm_data');
    const [isEditingData, setIsEditingData] = useState(false);
    // --- NUEVO ESTADO PARA MENSAJES DE FORMULARIO ---
    const [formMessage, setFormMessage] = useState(null);

    const handleDataSave = async (updatedData) => {
        setFormMessage({ text: 'Guardando...', type: 'loading' });
        try {
            await apiClient.put(`/users/me/contact`, updatedData);
            
            // --- LÓGICA DE CONFIRMACIÓN EN EL CHAT ---
            const successMessage = (
                <>
                    <p style={{color: 'green', fontWeight: 'bold'}}>✔ ¡Datos actualizados con éxito!</p>
                    <p>Tu solicitud de cotización ha sido enviada con la siguiente información:</p>
                    <p><strong>Correo:</strong> {updatedData.email}</p>
                    <p><strong>Teléfono:</strong> {updatedData.telefono}</p>
                    <p><strong>Dirección:</strong> {updatedData.direccion}</p>
                </>
            );
            setFormMessage({ text: successMessage, type: 'success' });
            setIsEditingData(false); // Opcional: Ocultar el formulario después de guardar
            
            // TODO: En un futuro, deberías actualizar el AuthContext con los nuevos datos.

        } catch (error) {
            console.error("Error al actualizar los datos del usuario:", error);
            const errorMessage = "Hubo un error al guardar tus datos. Por favor, inténtalo de nuevo.";
            setFormMessage({ text: errorMessage, type: 'error' });
        }
    };

    const handleQuoteMessage = (inputValue, setMessages) => {
        const input = inputValue.toLowerCase();
        if (input.includes('si') || input.includes('sí')) {
            setMessages(prev => [...prev, { text: "¡Perfecto! Hemos enviado tu solicitud de cotización. Un agente te contactará pronto.", sender: 'bot' }]);
            setConversationState('final_message');
        } else {
            setIsEditingData(true);
        }
    };
    const getInitialMessage = () => {
        if (!user) {
            // En lugar de devolver un objeto vacío, no devolvemos nada.
            // El ChatInterface se encargará de esto.
            return null; 
        }
        return {
            text: (
                <>
                    <p>Hola, {user.nombre}. ...</p>
                    {/* ... */}
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
                {/* (Asegúrate de tener aquí el código de la tabla del carrito) */}
            </div>
            
            <div style={{marginTop: '2rem'}}>
                {!user ? (
                    <AuthWall />
                ) : (
                    <>
                        {/* El chat inicial solo se muestra si NO estamos en modo de edición */}
                        {!isEditingData && conversationState !== 'final_message' && (
                            <ChatInterface
                                initialMessage={getInitialMessage()}
                                onSendMessage={handleQuoteMessage}
                                disabled={!user || conversationState === 'final_message'}
                            />
                        )}
                        
                        {/* El formulario solo se muestra si SÍ estamos en modo de edición */}
                        {isEditingData && (
                            <div className="chat-container">
                                <div className="chat-box">
                                    <EditableUserDataForm 
                                        initialData={{
                                            email: user.email,
                                            telefono: user.telefono,
                                            direccion: user.direccion,
                                        }}
                                        onSave={handleDataSave}
                                        onCancel={() => setIsEditingData(false)}
                                    />
                                    {/* --- MOSTRAR MENSAJE DE ESTADO DEL FORMULARIO --- */}
                                    {formMessage && (
                                        <div className={`bot-message form-status-message ${formMessage.type}`}>
                                            {formMessage.text}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Muestra el mensaje final después de la conversación o actualización */}
                        {conversationState === 'final_message' && (
                             <div className="chat-container">
                                <div className="chat-box">
                                    {/* ... mensajes anteriores ... */}
                                    <div className="bot-message">
                                        ¡Perfecto! Hemos enviado tu solicitud de cotización. Un agente te contactará pronto.
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CotizacionPage;