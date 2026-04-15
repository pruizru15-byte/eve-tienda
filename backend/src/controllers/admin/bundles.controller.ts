import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllBundles = async (req: Request, res: Response) => {
  try {
    const bundles = await prisma.bundle.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        items: {
          orderBy: { order_index: 'asc' },
          include: {
            product: {
              select: { id: true, name: true, price: true, image_url: true }
            }
          }
        }
      }
    });
    res.status(200).json(bundles);
  } catch (error) {
    console.error('Error al obtener todos los bundles:', error);
    res.status(500).json({ error: 'Fallo al obtener los paquetes (bundles)' });
  }
};

export const createBundle = async (req: Request, res: Response) => {
  try {
    const { title, image_url, items } = req.body;

    if (!title || !image_url || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Faltan datos obligatorios para crear el bundle' });
    }

    const newBundle = await prisma.bundle.create({
      data: {
        title,
        image_url,
        is_active: true,
        items: {
          create: items.map((productId: string, index: number) => ({
            product_id: productId,
            order_index: index,
          }))
        }
      },
      include: {
        items: true
      }
    });

    res.status(201).json(newBundle);
  } catch (error) {
    console.error('Error al crear bundle:', error);
    res.status(500).json({ error: 'Fallo al crear el bundle' });
  }
};

export const updateBundle = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { title, image_url, items, is_active } = req.body;

    // First update scalar fields
    const updatedBundle = await prisma.bundle.update({
      where: { id },
      data: {
        title,
        image_url,
        is_active,
      }
    });

    // If items are provided, delete old ones and recreate
    if (Array.isArray(items)) {
      await prisma.bundleItem.deleteMany({
        where: { bundle_id: id }
      });

      await prisma.bundleItem.createMany({
        data: items.map((productId: string, index: number) => ({
          bundle_id: id,
          product_id: productId,
          order_index: index,
        }))
      });
    }

    res.status(200).json(updatedBundle);
  } catch (error) {
    console.error('Error al actualizar bundle:', error);
    res.status(500).json({ error: 'Fallo al actualizar el bundle' });
  }
};

export const deleteBundle = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    // items will be deleted by Cascade
    await prisma.bundle.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar bundle:', error);
    res.status(500).json({ error: 'Fallo al eliminar el bundle' });
  }
};
