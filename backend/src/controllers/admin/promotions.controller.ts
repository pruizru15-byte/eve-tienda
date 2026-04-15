import type { Request, Response } from 'express';
import prisma from '../../lib/prisma.js';

export const getPromotions = async (req: Request, res: Response): Promise<any> => {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { created_at: 'desc' }
    });
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener promociones' });
  }
};

export const getPromotionStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const totalProducts = await prisma.product.count({ where: { is_active: true } });
    
    // Stagnant products: More than 30 days in warehouse
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const stagnantProducts = await prisma.product.count({
      where: {
        is_active: true,
        created_at: { lt: thirtyDaysAgo }
      }
    });

    const activePromotions = await prisma.promotion.count({
      where: { is_active: true }
    });

    res.json({
      totalProducts,
      stagnantProducts,
      activePromotions
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

export const createPromotion = async (req: Request, res: Response): Promise<any> => {
  const { title, description, discount, image_url, expires_at, is_active } = req.body;
  try {
    const promotion = await prisma.promotion.create({
      data: {
        title,
        description,
        discount: parseInt(discount) || 0,
        image_url,
        expires_at: expires_at ? new Date(expires_at) : null,
        is_active: is_active !== undefined ? !!is_active : true
      }
    });
    res.status(201).json(promotion);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear promoción' });
  }
};

export const updatePromotion = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const data = req.body;
  
  if (data.discount) data.discount = parseInt(data.discount);
  if (data.expires_at) data.expires_at = new Date(data.expires_at);

  try {
    const promotion = await prisma.promotion.update({
      where: { id },
      data: {
        ...data,
        is_active: data.is_active !== undefined ? !!data.is_active : true
      }
    });
    res.json(promotion);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
};

export const deletePromotion = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  try {
    await prisma.promotion.update({
      where: { id },
      data: { is_active: false }
    });
    res.json({ message: 'Promoción desactivada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al desactivar' });
  }
};
