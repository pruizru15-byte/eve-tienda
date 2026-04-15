import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendContactEmail = async (to: string, senderName: string, senderEmail: string, message: string) => {
  const mailOptions = {
    from: `"NovaTech Contact Form" <${process.env.EMAIL_USER}>`,
    to: to,
    replyTo: senderEmail,
    subject: `Nuevo mensaje de contacto de ${senderName}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #6366f1;">Has recibido un nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${senderName}</p>
        <p><strong>Correo electrónico:</strong> ${senderEmail}</p>
        <p><strong>Mensaje:</strong></p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; border-left: 4px solid #6366f1;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 20px;">
          Este mensaje fue enviado desde el formulario de contacto de NovaTech.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
