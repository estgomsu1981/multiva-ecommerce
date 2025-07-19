const nodemailer = require('nodemailer');

// Define los orígenes permitidos. Cambia la URL de Netlify cuando despliegues.
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8888',
  'https://multiva-ecomerce.netlify.app'
];

exports.handler = async function(event, context) {
  // --- Manejo de CORS ---
  const origin = event.headers.origin;
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  if (allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  // Responde a la petición de verificación (preflight) de CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  // Asegura que solo se acepten peticiones POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }
  
  // --- Lógica Principal de Envío de Correo ---
  try {
    const { nombre, correo, telefono, direccion, productos } = JSON.parse(event.body);

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPass) {
        throw new Error('Variables de entorno del servidor de correo no configuradas.');
    }

    // Configura el transporte de correo (ej. Gmail)
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass },
    });

    const formatCurrency = (value) => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(Number(value) || 0);

    // 1. Genera el HTML para cada fila de producto en la tabla
    const productosHtml = productos.map(p => {
        const subtotal = (Number(p.finalPrice) || 0) * (Number(p.quantity) || 0);
        return `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${p.nombre}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${p.quantity}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(p.finalPrice)}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(subtotal)}</td>
          </tr>
        `;
    }).join('');
    
    // 2. Calcula el total del pedido
    const totalPedido = productos.reduce((sum, p) => {
        const subtotal = (Number(p.finalPrice) || 0) * (Number(p.quantity) || 0);
        return sum + subtotal;
    }, 0);

    // 3. Construye el objeto de opciones del correo
    const mailOptions = {
        from: `Multiva Cotizaciones <${emailUser}>`,
        to: `multivagroup@gtmail.com;<${correo}>`, 
        replyTo: correo,
        subject: `Nueva Solicitud de Cotización de: ${nombre}`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2>Nueva Solicitud de Cotización</h2>
                <p>Se ha recibido una nueva solicitud a través del sitio web.</p>
                <hr style="border: 0; border-top: 1px solid #eee;">
                <h3>Datos del Cliente:</h3>
                <ul>
                    <li><strong>Nombre:</strong> ${nombre}</li>
                    <li><strong>Correo Electrónico:</strong> <a href="mailto:${correo}">${correo}</a></li>
                    <li><strong>Teléfono:</strong> ${telefono}</li>
                    <li><strong>Dirección de Envío:</strong> ${direccion}</li>
                </ul>
                <hr style="border: 0; border-top: 1px solid #eee;">
                <h3>Productos Solicitados:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Producto</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Cantidad</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Precio Unit. Final</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productosHtml}
                    </tbody>
                    <tfoot>
                        <tr style="border-top: 2px solid #333;">
                            <td colspan="3" style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold; font-size: 1.1em;">
                                Total del Pedido:
                            </td>
                            <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: bold; font-size: 1.1em;">
                                ${formatCurrency(totalPedido)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `,
    };

    // 4. Envía el correo
    await transporter.sendMail(mailOptions);
    
    // 5. Devuelve una respuesta de éxito
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ mensaje: 'Correo enviado exitosamente' }),
    };

  } catch (error) {
    console.error("Error en la función 'send-email':", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ mensaje: 'Error interno al procesar la solicitud.', detalle: error.message }),
    };
  }
};