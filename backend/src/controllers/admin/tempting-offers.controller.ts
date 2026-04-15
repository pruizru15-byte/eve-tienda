import type { Request, Response } from 'express';
import prisma from '../../lib/prisma.js';

export const getTemptingOffers = async (req: Request, res: Response) => {
  try {
    const offers = await (prisma as any).temptingOffer.findMany({
      include: { product: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ofertas tentadoras' });
  }
};

export const createTemptingOffer = async (req: Request, res: Response): Promise<any> => {
  const { product_id, subtitle, title, button_text, image_url } = req.body;
  try {
    const offer = await (prisma as any).temptingOffer.create({
      data: {
        product_id,
        subtitle,
        title,
        button_text: button_text || '¡LO QUIERO!',
        image_url,
        is_active: true
      }
    });
    res.status(201).json(offer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear oferta tentadora' });
  }
};

export const updateTemptingOffer = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const data = req.body;
  try {
    const offer = await (prisma as any).temptingOffer.update({
      where: { id },
      data
    });
    res.json(offer);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar oferta tentadora' });
  }
};

export const deleteTemptingOffer = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  try {
    await (prisma as any).temptingOffer.delete({
      where: { id }
    });
    res.json({ message: 'Oferta tentadora eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar oferta tentadora' });
  }
};
