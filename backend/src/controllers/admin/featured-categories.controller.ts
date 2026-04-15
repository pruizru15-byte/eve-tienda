import type { Request, Response } from 'express';
import prisma from '../../lib/prisma.js';

export const getFeaturedCategories = async (req: Request, res: Response) => {
  try {
    const categories = await (prisma as any).featuredCategory.findMany({
      include: { category: true },
      orderBy: { order: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías destacadas' });
  }
};

export const createFeaturedCategory = async (req: Request, res: Response) => {
  try {
    const { name, image_url, category_id, product_count, is_active } = req.body;
    
    const last = await (prisma as any).featuredCategory.findFirst({
      orderBy: { order: 'desc' }
    });
    const order = last ? last.order + 1 : 0;

    const featured = await (prisma as any).featuredCategory.create({
      data: {
        name,
        image_url,
        category_id: category_id || null,
        product_count: parseInt(product_count) || 0,
        is_active: is_active ?? true,
        order
      }
    });
    res.status(201).json(featured);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear categoría destacada' });
  }
};

export const updateFeaturedCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, image_url, category_id, product_count, is_active } = req.body;
    
    const featured = await (prisma as any).featuredCategory.update({
      where: { id },
      data: {
        name,
        image_url,
        category_id: category_id || null,
        product_count: parseInt(product_count) || 0,
        is_active
      }
    });
    res.json(featured);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar categoría destacada' });
  }
};

export const deleteFeaturedCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await (prisma as any).featuredCategory.delete({ where: { id } });
    res.json({ message: 'Eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar categoría destacada' });
  }
};

export const reorderFeaturedCategories = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    
    await Promise.all(
      items.map((item: any) => 
        (prisma as any).featuredCategory.update({
          where: { id: item.id },
          data: { order: item.order }
        })
      )
    );
    
    res.json({ message: 'Reordenado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al reordenar categorías' });
  }
};
