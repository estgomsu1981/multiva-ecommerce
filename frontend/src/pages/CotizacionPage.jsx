// frontend/src/pages/CotizacionPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import ChatInterface, { AuthWall } from '../components/ChatInterface';
import EditableUserDataForm from '../components/EditableUserDataForm'; // <-- IMPORTA EL NUEVO FORMULARIO
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import apiClient from '../api/axios';

const CotizacionPage = () => {
    const { user, login } = useContext(AuthContext); // Necesitamos 'login' para actualizar el token/contexto
    const { cartItems } = useContext(CartContext);
    
    const [isEditingData, setIsEditingData] = useState(false);
    
    // Función que se llama cuando se guarda el formulario de edición
    const handleDataSave = async (updatedData) => {
        console.log("Datos a actualizar:", updatedData);
        try {
            // Llama a la API para actualizar al usuario
            const response = await apiClient.put(`/users/${user.id}`, updatedData);
            
            // Si la actualización es exitosa, podemos hacer dos cosas:
            // 1. Refrescar los datos del usuario pidiendo un nuevo token (más complejo)
            // 2. O simplemente continuar el flujo. Por ahora, hacemos lo segundo.
            alert("¡Datos actualizados! Hemos enviado tu solicitud de cotización.");
            setIsEditingData(false); // Oculta el formulario de edición
            
            // Idealmente aquí se debería actualizar el AuthContext con los nuevos datos
        } catch (error) {
            console.error("Error al actualizar los datos del usuario:", error);
            alert("Hubo un error al guardar tus datos. Por favor, inténtalo de nuevo.");
        }
    };

    // Lógica del "chatbot"
    const handleQuoteMessage = (inputValue, setMessages) => {
        const input = inputValue.toLowerCase();
        if (input.includes('si') || input.includes('sí')) {
            setMessages(prev => [...prev, { text: "¡Perfecto! Hemos enviado tu solicitud de cotización. Un agente te contactará pronto.", sender: 'bot' }]);
        } else {
            // En lugar de hacer más preguntas, activamos el modo de edición
            setIsEditingData(true);
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
                    <>
                        {/* El chat solo se muestra si NO estamos en modo de edición */}
                        {!isEditingData && (
                            <ChatInterface
                                initialMessage={getInitialMessage()}
                                onSendMessage={handleQuoteMessage}
                                disabled={!user}
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