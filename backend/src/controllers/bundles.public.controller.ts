import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getActiveBundles = async (req: Request, res: Response) => {
  try {
    const bundles = await prisma.bundle.findMany({
      where: {
        is_active: true
      },
      orderBy: {
        created_at: 'desc'
      },
      include: {
        items: {
          orderBy: {
            order_index: 'asc'
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image_url: true,
              }
            }
          }
        }
      }
    });

    res.status(200).json(bundles);
  } catch (error) {
    console.error('Error al obtener bundles activos:', error);
    res.status(500).json({ error: 'Fallo al obtener los ecosistemas interactivos' });
  }
};
