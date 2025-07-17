// frontend/src/services/quoteService.js

export const enviarCotizacion = async ({ nombre, correo, telefono, direccion, pedido }) => {
  // Validación de datos
  if (!nombre || !correo || !telefono || !direccion || !pedido || pedido.length === 0) {
    console.error('Faltan datos para enviar la cotización.');
    return { ok: false, mensaje: 'Datos incompletos.' };
  }

  // El pedido ya viene en el formato correcto desde CartContext
  const productos = pedido.map(item => ({
    nombre: item.nombre,
    cantidad: item.quantity,
    precio: item.finalPrice,
    subtotal: item.finalPrice * item.quantity,
  }));

  const netlifyFunctionUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:8888/.netlify/functions/send-email'
    : '/.netlify/functions/send-email';

  try {
    const response = await fetch(netlifyFunctionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, correo, telefono, direccion, productos })
    });

    if (!response.ok) {
        // Captura errores del servidor (ej. 4xx, 5xx)
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error en el servidor de Netlify.');
    }

    const resultado = await response.json();
    console.log('Respuesta de la función de Netlify:', resultado);
    return { ok: true, mensaje: 'Cotización enviada correctamente', resultado };

  } catch (error) {
    console.error('Error al llamar a la función de Netlify:', error);
    return { ok: false, mensaje: error.message || 'No se pudo contactar al servidor.' };
  }
};