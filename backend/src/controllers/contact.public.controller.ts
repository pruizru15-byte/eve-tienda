import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getContactSettingsPublic = async (req: Request, res: Response) => {
  try {
    const settings = await (prisma as any).contactSettings.findUnique({
      where: { id: 'singleton' }
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ajustes de contacto' });
  }
};

export const createMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;
    const newMessage = await (prisma as any).contactMessage.create({
      data: { name, email, subject, message }
    });
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
};
