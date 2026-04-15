import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getActiveFeaturedCategories = async (req: Request, res: Response) => {
  try {
    const categories = await (prisma as any).featuredCategory.findMany({
      where: { is_active: true },
      include: { 
        category: {
          include: {
            _count: { select: { products: true } }
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    const result = categories.map((f: any) => ({
      id: f.id,
      name: f.name,
      image_url: f.image_url,
      product_count: f.category?._count?.products ?? f.product_count,
      is_active: f.is_active,
      order: f.order,
      category_id: f.category_id
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías destacadas' });
  }
};
