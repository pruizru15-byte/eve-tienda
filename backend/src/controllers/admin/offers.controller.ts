import type { Request, Response } from 'express';
import prisma from '../../lib/prisma.js';

export const getOffers = async (req: Request, res: Response): Promise<any> => {
  try {
    const offers = await (prisma.offer as any).findMany({
      include: { product: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ofertas' });
  }
};

export const createOffer = async (req: Request, res: Response): Promise<any> => {
  const { product_id, title, description, discount, image_url, end_date } = req.body;
  try {
    const offer = await (prisma.offer as any).create({
      data: {
        product_id: product_id || null,
        title,
        description,
        discount: parseInt(discount),
        image_url,
        end_date: new Date(end_date),
        is_active: true
      }
    });
    res.status(201).json(offer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear oferta' });
  }
};

export const updateOffer = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const data = req.body;
  if (data.discount) data.discount = parseInt(data.discount);
  if (data.end_date) data.end_date = new Date(data.end_date);

  try {
    const offer = await (prisma.offer as any).update({
      where: { id },
      data
    });
    res.json(offer);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar oferta' });
  }
};

export const deleteOffer = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  try {
    await (prisma.offer as any).update({
      where: { id },
      data: { is_active: false }
    });
    res.json({ message: 'Oferta desactivada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al desactivar oferta' });
  }
};
