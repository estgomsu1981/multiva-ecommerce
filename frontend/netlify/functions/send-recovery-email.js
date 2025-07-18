// netlify/functions/send-recovery-email.js
const nodemailer = require('nodemailer');

// Orígenes permitidos (definidos una sola vez, fuera del handler)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8888',
  'https://multiva-ecommerce.netlify.app' 
];

// El handler se define una sola vez
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

  // Respuesta para la petición de verificación (preflight) de CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Asegurarse de que solo se acepten peticiones POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  // --- Lógica Principal ---
  try {
    const { email, reset_url } = JSON.parse(event.body);
    console.log(`Iniciando envío de correo de recuperación para: ${email}`);

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `Soporte Multiva <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Restablecimiento de Contraseña - Multiva',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Restablecimiento de Contraseña</h2>
          <p>Has solicitado restablecer tu contraseña. Por favor, haz clic en el siguiente enlace para continuar:</p>
          <p><a href="${reset_url}" style="padding: 10px 15px; background-color: #0d6efd; color: white; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a></p>
          <p>Si no solicitaste esto, puedes ignorar este correo.</p>
          <p>Este enlace expirará en 15 minutos.</p>
        </div>
      `
    };
  
    await transporter.sendMail(mailOptions);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ mensaje: 'Correo de recuperación enviado.' }),
    };

  } catch (error) {
    console.error("Error en 'send-recovery-email':", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ mensaje: 'Error al enviar el correo de recuperación.' }),
    };
  }
};