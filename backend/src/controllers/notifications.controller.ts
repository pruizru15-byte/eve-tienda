import type { Response } from 'express';
import prisma from '../lib/prisma.js';

export const getMyNotifications = async (req: any, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: 'desc' }
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};

export const markAsRead = async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.notification.updateMany({
      where: { id, user_id: req.user.id },
      data: { is_read: true }
    });
    res.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    res.status(500).json({ error: 'Error al marcar como leída' });
  }
};
