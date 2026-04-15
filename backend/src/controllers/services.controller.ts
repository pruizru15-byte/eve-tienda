import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

/**
 * Public Services Controller
 * For public search and fetching
 */

export const getPublicCategories = async (req: Request, res: Response): Promise<any> => {
  try {
    const categories = await (prisma.serviceCategory as any).findMany({
      where: { is_active: true },
      orderBy: { title: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error('CATEGORIES_FETCH_ERROR:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

export const getPublicServices = async (req: Request, res: Response): Promise<any> => {
  const { q, category, maxPrice } = req.query;

  try {
    const where: any = { is_active: true };
    const and: any[] = [];

    // Texto de búsqueda
    if (q) {
      and.push({
        OR: [
          { title: { contains: String(q) } },
          { description: { contains: String(q) } }
        ]
      });
    }

    // Filtrar por categoría (evitar 'all' si viene del front)
    if (category && category !== 'all') {
      and.push({ category_id: String(category) });
    }

    // Filtrar por presupuesto máximo (validar que sea número)
    if (maxPrice && !isNaN(Number(maxPrice))) {
      const priceNum = parseFloat(String(maxPrice));
      if (priceNum > 0) {
        where.price = { lte: priceNum };
      }
    }

    if (and.length > 0) {
      where.AND = and;
    }

    // Usar include para traer la categoría relacionada
    const services = await (prisma as any).service.findMany({
      where,
      include: { category: true },
      orderBy: { title: 'asc' }
    });

    res.json(services || []);
  } catch (error: any) {
    console.error('SEARCH_SERVICES_ERROR:', error);
    
    // Si el error es por el campo 'price' inexistente, devolver lista vacía o error amigable
    if (error?.message?.includes('Unknown column') || error?.message?.includes('Invalid value')) {
      return res.status(200).json([]);
    }

    res.status(500).json({ error: 'Error al buscar servicios' });
  }
};
