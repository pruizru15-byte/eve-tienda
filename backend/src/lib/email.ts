import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;
  
  await transporter.sendMail({
    from: `"NovaTech Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Confirma tu cuenta en NovaTech',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #6366f1;">¡Bienvenido a NovaTech!</h2>
        <p>Estás a un paso de unirte a la élite tecnológica. Por favor, confirma tu cuenta haciendo clic en el botón de abajo:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Confirmar Cuenta</a>
        <p style="font-size: 0.8em; color: #666;">Si no creaste esta cuenta, puedes ignorar este correo.</p>
      </div>
    `,
  });
}

export async function sendResetPasswordEmail(email: string, token: string) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  await transporter.sendMail({
    from: `"NovaTech Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Recuperación de contraseña - NovaTech',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #6366f1;">Recuperar Contraseña</h2>
        <p>Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el siguiente botón:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #f43f5e; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Restablecer Contraseña</a>
        <p style="font-size: 0.8em; color: #666;">Este enlace expirará en 1 hora. Si no solicitaste esto, ignora este mensaje.</p>
      </div>
    `,
  });
}

export async function sendOrderConfirmationEmail(email: string, orderData: any) {
  const items = JSON.parse(orderData.items);
  const itemsHtml = items.map((item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee; color: #334155;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; color: #334155;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; color: #334155;">$${item.price.toLocaleString()}</td>
    </tr>
  `).join('');

  await transporter.sendMail({
    from: `"NovaTech Sales" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `¡Tu compra ha sido confirmada! - Orden #${orderData.id.split('-')[0].toUpperCase()}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #6366f1; margin: 0; font-size: 28px; letter-spacing: -0.025em;">¡Venta Confirmada!</h1>
          <p style="color: #64748b; font-size: 16px; margin-top: 8px;">Tu ingeniería ha sido procesada con éxito.</p>
        </div>

        <div style="background-color: #f8fafc; padding: 24px; border-radius: 16px; margin-bottom: 40px; border: 1px solid #f1f5f9;">
          <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 14px; text-transform: uppercase; tracking: 0.05em;">Resumen de la Orden</h3>
          <p style="margin: 0; font-size: 14px; color: #64748b;">ID de Orden: <strong style="color: #6366f1;">#${orderData.id.split('-')[0].toUpperCase()}</strong></p>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">Fecha: ${new Date(orderData.created_at).toLocaleDateString()}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 14px;">
          <thead>
            <tr style="border-bottom: 2px solid #f1f5f9;">
              <th style="padding: 12px 10px; text-align: left; color: #94a3b8; font-weight: 600; text-transform: uppercase; font-size: 11px;">Producto</th>
              <th style="padding: 12px 10px; text-align: center; color: #94a3b8; font-weight: 600; text-transform: uppercase; font-size: 11px;">Cant.</th>
              <th style="padding: 12px 10px; text-align: right; color: #94a3b8; font-weight: 600; text-transform: uppercase; font-size: 11px;">Monto</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 30px 10px 10px; text-align: right; color: #64748b; font-weight: 500;">TOTAL PAGADO:</td>
              <td style="padding: 30px 10px 10px; text-align: right; font-weight: 800; color: #6366f1; font-size: 24px;">$${orderData.total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <div style="text-align: center; padding-top: 40px; border-top: 1px solid #f1f5f9;">
          <p style="font-size: 15px; font-weight: 500;">Gracias por elegir la excelencia tecnológica.</p>
          <div style="margin-top: 32px; font-size: 11px; color: #94a3b8;">
            <p style="margin: 0; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em;">NovaTech • Engineering Hub</p>
            <p style="margin: 8px 0;">Este es un mensaje del sistema. Por favor no responder a este correo.</p>
          </div>
        </div>
      </div>
    `,
  });
}
 
export async function sendContactReplyEmail(email: string, name: string, originalMessage: string, replyContent: string) {
  await transporter.sendMail({
    from: `"NovaTech Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Respuesta a tu consulta - NovaTech',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #6366f1; margin: 0; font-size: 28px; letter-spacing: -0.025em;">Respuesta de Soporte</h1>
          <p style="color: #64748b; font-size: 16px; margin-top: 8px;">Hola ${name}, hemos revisado tu mensaje.</p>
        </div>

        <div style="background-color: #f8fafc; padding: 24px; border-radius: 16px; margin-bottom: 30px; border: 1px solid #f1f5f9;">
          <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 14px; text-transform: uppercase;">Nuestra Respuesta:</h3>
          <p style="margin: 0; font-size: 16px; color: #1e293b; line-height: 1.6;">${replyContent}</p>
        </div>

        <div style="padding: 24px; border-left: 4px solid #e2e8f0; margin-bottom: 40px;">
          <h4 style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase;">Tu mensaje original:</h4>
          <p style="margin: 0; font-size: 14px; color: #64748b; font-style: italic;">"${originalMessage}"</p>
        </div>

        <div style="text-align: center; padding-top: 40px; border-top: 1px solid #f1f5f9;">
          <p style="font-size: 15px; font-weight: 500;">Estamos aquí para ayudarte en lo que necesites.</p>
          <div style="margin-top: 32px; font-size: 11px; color: #94a3b8;">
            <p style="margin: 0; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em;">NovaTech • Support Team</p>
          </div>
        </div>
      </div>
    `,
  });
}
