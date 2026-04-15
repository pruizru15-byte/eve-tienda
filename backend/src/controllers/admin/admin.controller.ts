import type { Request, Response } from 'express';
import prisma from '../../lib/prisma.js';

export const getDashboardStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const [usersCount, productsCount, messagesCount, latestUsers, latestMessages] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.contactMessage.count({ where: { status: 'UNREAD' } }),
      prisma.user.findMany({ 
        take: 3, 
        orderBy: { created_at: 'desc' },
        select: { id: true, name: true, created_at: true }
      }),
      prisma.contactMessage.findMany({
        take: 2,
        orderBy: { created_at: 'desc' },
        select: { id: true, name: true, created_at: true, subject: true }
      })
    ]);

    const activities = [
      ...latestUsers.map(u => ({
        id: `user-${u.id}`,
        type: 'user',
        title: 'Nuevo usuario registrado',
        detail: u.name,
        time: u.created_at
      })),
      ...latestMessages.map(m => ({
        id: `msg-${m.id}`,
        type: 'message',
        title: 'Nueva consulta recibida',
        detail: `${m.name}: ${m.subject}`,
        time: m.created_at
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    res.json({
      stats: [
        { label: 'Usuarios', value: usersCount, color: 'blue' },
        { label: 'Productos', value: productsCount, color: 'emerald' },
        { label: 'Mensajes Pendientes', value: messagesCount, color: 'amber' },
        { label: 'Ventas (Demo)', value: 'S/. 12,450', color: 'rose' },
      ],
      activities
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas del dashboard' });
  }
};
