// frontend/src/pages/CotizacionPage.jsx
import React, { useContext } from 'react';
import ChatInterface, { AuthWall } from '../components/ChatInterface';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';

const CotizacionPage = () => {
    const { user } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);

    const handleQuoteMessage = (inputValue, setMessages) => {
        setTimeout(() => {
            const botResponse = "Gracias por tu información. Un agente te contactará pronto para confirmar los detalles de tu cotización.";
            setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
        }, 1000);
    };

    const initialBotMessage = {
        text: (
            <>
                Hola 👋, soy <strong>Multiva Assist</strong>. He cargado tu pedido para cotizar. Para continuar, por favor indícame tu nombre completo, correo y teléfono 📞.
            </>
        ),
        sender: 'bot'
    };

    return (
        <div className="chat-page-container">
            <h2 className="admin-panel-title">🤖 Multiva Assist - Cotización</h2>
            
            <h3>📝 Pedido cargado:</h3>
            <div className="table-responsive-wrapper">
                {/* (Pega aquí el código de la tabla de tu CartPage.jsx) */}
            </div>
            
            <div style={{marginTop: '2rem'}}>
                {!user && <AuthWall />}
                <ChatInterface
                    initialMessage={initialBotMessage}
                    onSendMessage={handleQuoteMessage}
                    disabled={!user}
                />
            </div>
        </div>
    );
};

export default CotizacionPage;