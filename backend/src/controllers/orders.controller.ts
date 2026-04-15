import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getMyOrders = async (req: any, res: Response) => {
  const userId = req.user?.id;
  try {
    const orders = await prisma.order.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener compras' });
  }
};

export const createOrder = async (req: any, res: Response) => {
  const userId = req.user?.id;
  const { items, total } = req.body;

  try {
    const order = await prisma.order.create({
      data: {
        user_id: userId,
        total: parseFloat(total),
        items: JSON.stringify(items),
        status: 'PENDING'
      }
    });
    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear la orden' });
  }
};
