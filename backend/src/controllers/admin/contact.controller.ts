import type { Request, Response } from 'express';
import prisma from '../../lib/prisma.js';
import { sendContactReplyEmail } from '../../lib/email.js';

export const getContactSettings = async (req: Request, res: Response) => {
  try {
    const settings = await (prisma as any).contactSettings.findUnique({
      where: { id: 'singleton' }
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ajustes de contacto' });
  }
};

export const updateContactSettings = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const settings = await (prisma as any).contactSettings.upsert({
      where: { id: 'singleton' },
      update: data,
      create: { id: 'singleton', ...data }
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar ajustes de contacto' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await (prisma as any).contactMessage.findMany({
      orderBy: { created_at: 'desc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const message = await (prisma as any).contactMessage.update({
      where: { id },
      data: { status: 'READ' }
    });
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Error al marcar mensaje como leído' });
  }
};
 
export const replyToMessage = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { reply } = req.body;

  if (!reply) return res.status(400).json({ error: 'La respuesta no puede estar vacía' });

  try {
    const existingMessage = await (prisma as any).contactMessage.findUnique({
      where: { id }
    });

    if (!existingMessage) return res.status(404).json({ error: 'Mensaje no encontrado' });

    const message = await (prisma as any).contactMessage.update({
      where: { id },
      data: { 
        reply,
        status: 'REPLIED',
        replied_at: new Date()
      }
    });

    // Send Email
    await sendContactReplyEmail(
      existingMessage.email,
      existingMessage.name,
      existingMessage.message,
      reply
    );

    // If user is linked, send a notification
    if (existingMessage.user_id) {
       await (prisma as any).notification.create({
          data: {
             user_id: existingMessage.user_id,
             title: 'Nueva respuesta de soporte',
             message: `Has recibido una respuesta a tu consulta: "${existingMessage.subject || 'Sin asunto'}"`,
             type: 'info'
          }
       });
    }

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar la respuesta' });
  }
};
