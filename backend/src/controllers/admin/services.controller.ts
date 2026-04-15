import type { Request, Response } from 'express';
import prisma from '../../lib/prisma.js';

// CATEGORIES
export const getServiceCategories = async (req: Request, res: Response): Promise<any> => {
  try {
    const categories = await (prisma.serviceCategory as any).findMany({
      include: { _count: { select: { services: true } } },
      orderBy: { title: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías de servicios' });
  }
};

export const toggleServiceCategoryStatus = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { is_active } = req.body;
  try {
    const category = await (prisma.serviceCategory as any).update({
      where: { id },
      data: { is_active: !!is_active }
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar estado de la categoría de servicio' });
  }
};

export const createServiceCategory = async (req: Request, res: Response): Promise<any> => {
  const { title, description } = req.body;
  try {
    const category = await (prisma.serviceCategory as any).create({
      data: { title, description }
    });
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
};

// SERVICES
export const getServices = async (req: Request, res: Response): Promise<any> => {
  try {
    const services = await (prisma.service as any).findMany({
      include: { category: true },
      orderBy: { title: 'asc' }
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener servicios' });
  }
};

export const createService = async (req: Request, res: Response): Promise<any> => {
  const { 
    category_id, title, description, long_description, price_model, price, features, icon,
    whatsapp_number, trust_text, contact_options 
  } = req.body;
  try {
    const service = await (prisma.service as any).create({
      data: {
        category_id,
        title,
        description,
        long_description,
        price_model,
        price: parseFloat(price) || 0,
        features: JSON.stringify(features),
        icon,
        whatsapp_number,
        trust_text,
        contact_options: contact_options ? JSON.stringify(contact_options) : null,
        is_active: true
      }
    });
    res.status(201).json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear servicio' });
  }
};

export const updateService = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const data = { ...req.body };
  if (data.features) data.features = JSON.stringify(data.features);
  if (data.contact_options) data.contact_options = JSON.stringify(data.contact_options);
  if (data.price !== undefined) data.price = parseFloat(data.price) || 0;

  try {
    const service = await (prisma.service as any).update({
      where: { id },
      data
    });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar servicio' });
  }
};

export const deactivateService = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  try {
    await (prisma.service as any).update({
      where: { id },
      data: { is_active: false }
    });
    res.json({ message: 'Servicio desactivado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al desactivar servicio' });
  }
};

export const toggleServiceStatus = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { is_active } = req.body;
  try {
    const service = await (prisma.service as any).update({
      where: { id },
      data: { is_active: !!is_active }
    });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar estado del servicio' });
  }
};
