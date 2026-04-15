import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getActiveTemptingOffers = async (req: Request, res: Response) => {
  try {
    const offers = await (prisma as any).temptingOffer.findMany({
      where: { is_active: true },
      include: { product: true },
      take: 4,
      orderBy: { created_at: 'desc' }
    });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ofertas tentadoras' });
  }
};

export const trackClick = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await (prisma as any).temptingOffer.update({
      where: { id },
      data: { clicks: { increment: 1 } }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar click' });
  }
};

export const trackConversion = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await (prisma as any).temptingOffer.update({
      where: { id },
      data: { conversions: { increment: 1 } }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar conversión' });
  }
};
