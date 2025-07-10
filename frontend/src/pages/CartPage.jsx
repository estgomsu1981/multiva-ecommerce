import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext'; 

const CartPage = () => {
    const { cartItems, removeItemFromCart, updateItemQuantity } = useContext(CartContext);
    const { user } = useContext(AuthContext); 

    // Función de formato robusta
    const formatPrice = (price) => {
        const numericPrice = Number(price);
        if (isNaN(numericPrice)) {
            return '₡0.00'; // Devuelve un formato válido si el número es inválido
        }
        return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(numericPrice);
    };

    // Cálculo del total
    const total = cartItems.reduce((sum, item) => {
        // Aseguramos que la operación se hace con números
        return sum + (Number(item.finalPrice) * Number(item.quantity));
    }, 0);

    return (
        <div className="admin-page-container">
            <h2 className="admin-panel-title">Carrito de Compras</h2>
            
            {cartItems.length === 0 ? (
                <p style={{textAlign: 'center'}}>Tu carrito está vacío.</p>
            ) : (
                <>
                    <div className="table-responsive-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Precio Original</th>
                                    <th>Descuento</th>
                                    <th>Precio Unit. Final</th>
                                    <th>Cantidad</th>
                                    <th>Subtotal</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map(item => {
                                    // Hacemos los cálculos aquí para asegurar que son numéricos
                                    const subtotal = (Number(item.finalPrice) || 0) * (Number(item.quantity) || 0);
                                    
                                    return (
                                        <tr key={item.id}>
                                            <td>{item.nombre}</td>
                                            <td>{formatPrice(item.precio)}</td>
                                            <td>{`${item.descuento || 0}%`}</td>
                                            <td>{formatPrice(item.finalPrice)}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        const newQuantity = parseInt(e.target.value, 10);
                                                        // Validamos que sea un número y mayor o igual al mínimo de compra
                                                        // Nota: Necesitamos que el 'minimo_compra' esté en el objeto 'item' del carrito
                                                        if (!isNaN(newQuantity) && newQuantity >= item.minimo_compra) {
                                                            updateItemQuantity(item.id, newQuantity);
                                                        }
                                                    }}
                                                    // El 'min' del input HTML también debe ser el mínimo de compra del producto
                                                    min={item.minimo_compra}
                                                    style={{width: '70px', textAlign: 'center'}}
                                                />
                                            </td>
                                            <td>{formatPrice(subtotal)}</td>
                                            <td>
                                                <button onClick={() => removeItemFromCart(item.id)} className="btn btn-danger btn-sm">Eliminar</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ textAlign: 'right', marginTop: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        Total: {formatPrice(total)}
                    </div>

                    <div className="cart-actions-container">
                        <Link to="/" className="btn btn-secondary">Seguir Comprando</Link>
                        
                        <div className="quote-action-group">
                            <Link 
                                to="/solicitar-cotizacion" 
                                className={`btn btn-warning ${!user ? 'disabled' : ''}`}
                                onClick={(e) => !user && e.preventDefault()}
                                title={!user ? "Debes iniciar sesión para cotizar" : "Solicitar Cotización"}
                            >
                                Solicitar Cotización
                            </Link>
                            {!user && (
                                <p className="auth-prompt">
                                    Para solicitar cotización, debes <Link to="/login">iniciar sesión</Link>.
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;