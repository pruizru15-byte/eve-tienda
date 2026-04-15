import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getFeaturedCategories = async (req: Request, res: Response) => {
  try {
    const categories = await (prisma as any).productCategory.findMany({
      where: { is_active: true },
      include: {
        _count: {
          select: { products: true }
        }
      },
      take: 10,
      // Order by number of products descending
      orderBy: {
        products: {
          _count: 'desc'
        }
      }
    });

    res.json(categories);
  } catch (error) {
    console.error("Error al obtener categorías destacadas:", error);
    res.status(500).json({ error: 'Error al obtener categorías destacadas' });
  }
};

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await (prisma as any).productCategory.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error("Error al obtener todas las categorías:", error);
    res.status(500).json({ error: 'Error al obtener todas las categorías' });
  }
};

