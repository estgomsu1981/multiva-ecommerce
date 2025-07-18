// frontend/src/services/quoteService.js

// frontend/src/services/quoteService.js

export const enviarCotizacion = async ({ nombre, correo, telefono, direccion, pedido }) => {
  // Validación de datos
  if (!nombre || !correo || !pedido || pedido.length === 0) {
    console.error('Faltan datos para enviar la cotización.');
    return { ok: false, mensaje: 'Datos incompletos.' };
  }

  // --- LÓGICA CORREGIDA ---
  // El 'pedido' ya es el array de cartItems, no necesitamos procesarlo.
  // Simplemente lo renombramos a 'productos' para que coincida con lo que espera la función serverless.
  const productos = pedido;
  // -------------------------

  const netlifyFunctionUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:8888/.netlify/functions/send-email'
    : '/.netlify/functions/send-email';

  try {
    const response = await fetch(netlifyFunctionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Enviamos el objeto completo a la función serverless
      body: JSON.stringify({ nombre, correo, telefono, direccion, productos })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error en el servidor de Netlify.');
    }

    const resultado = await response.json();
    return { ok: true, mensaje: 'Cotización enviada correctamente', resultado };

  } catch (error) {
    console.error('Error al llamar a la función de Netlify:', error);
    return { ok: false, mensaje: error.message || 'No se pudo contactar al servidor.' };
  }
};