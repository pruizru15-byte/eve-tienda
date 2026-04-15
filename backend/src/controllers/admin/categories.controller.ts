import type { Request, Response } from 'express';
import prisma from '../../lib/prisma.js';

export const getCategories = async (req: Request, res: Response): Promise<any> => {
  try {
    const categories = await prisma.productCategory.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Error al obtener categorías', details: error });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<any> => {
  const { name, icon, is_active } = req.body;
  // Generate ID from name if not provided (slug style)
  const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  
  try {
    const category = await prisma.productCategory.create({
      data: {
        id,
        name,
        icon,
        is_active: is_active !== undefined ? !!is_active : true
      } as any
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear categoría' });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { name, icon, is_active } = req.body;
  try {
    const category = await prisma.productCategory.update({
      where: { id },
      data: {
        name,
        icon,
        is_active: is_active !== undefined ? !!is_active : true
      } as any
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
};

export const deactivateCategory = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  try {
    await prisma.productCategory.update({
      where: { id },
      data: { is_active: false } as any
    });
    res.json({ message: 'Categoría desactivada con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al desactivar categoría' });
  }
};

export const toggleCategoryStatus = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { is_active } = req.body;
  try {
    const category = await prisma.productCategory.update({
      where: { id },
      data: { is_active: !!is_active } as any
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar estado de la categoría' });
  }
};
