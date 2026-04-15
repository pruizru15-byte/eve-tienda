import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/public/offers/active
 * Retorna las ofertas activas que no han expirado, incluyendo producto y categoría.
 */
export const getActiveOffers = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    
    const offers = await prisma.offer.findMany({
      where: {
        is_active: true,
        end_date: {
          gt: now
        }
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 8 // Limitando a 8 como se solicitó (para grid de 4 u 8)
    });

    res.status(200).json(offers);
  } catch (error) {
    console.error('Error al obtener ofertas activas:', error);
    res.status(500).json({ error: 'Fallo al obtener las ofertas' });
  }
};
