import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getVanguardPublic = async (req: Request, res: Response) => {
  try {
    const vanguard = await (prisma as any).vanguardSection.findUnique({
      where: { id: 'singleton' },
      include: { features: true }
    });
    res.json(vanguard);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos públicos de vanguardia' });
  }
};
