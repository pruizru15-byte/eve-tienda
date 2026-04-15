import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { sendContactEmail } from '../lib/mailer.js';

const SINGLETON_ID = 'singleton';

export const submitContactForm = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, message, subject } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios, panzón.' });
    }

    // 1. Save to History (DB)
    const newMessage = await prisma.contactMessage.create({
      data: {
        user_id: (req as any).user?.id || null,
        name: name,
        email: email,
        message: message,
        subject: subject || `Mensaje de contacto de ${name}`
      }
    });

    // 2. Fetch target email from CompanySettings
    let settings = await prisma.companySettings.findUnique({
      where: { id: SINGLETON_ID }
    });

    const baseTarget = settings?.target_email || process.env.EMAIL_USER || 'admin@novatech.com';
    const targetEmails = [baseTarget, 'soportepandapo.py@gmail.com'].join(', ');

    // 3. Send Email
    const emailSent = await sendContactEmail(targetEmails, name, email, message);

    if (emailSent) {
      return res.status(200).json({
        message: '¡Gracias! Tu mensaje ha sido enviado correctamente.'
      });
    } else {
      // Still return 200 but maybe log it internally as partial success?
      // Actually, if DB works and email fails, the admin can still see it in the panel
      return res.status(200).json({
        message: 'Tu mensaje ha sido guardado, pero hubo un problema al enviar la notificación por correo.',
        partial_error: true
      });
    }
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return res.status(500).json({ error: 'Hubo un error al procesar tu mensaje. Inténtalo de nuevo más tarde.' });
  }
};

export const getMessagesHistory = async (req: Request, res: Response): Promise<any> => {
  try {
    const history = await prisma.contactMessage.findMany({
      orderBy: { created_at: 'desc' },
      take: 50
    });
    return res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching messages history:', error);
    return res.status(500).json({ error: 'Error al obtener el historial de mensajes' });
  }
};
