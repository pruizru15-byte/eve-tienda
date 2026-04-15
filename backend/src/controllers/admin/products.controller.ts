import type { Request, Response } from 'express';
import prisma from '../../lib/prisma.js';

export const getProducts = async (req: Request, res: Response): Promise<any> => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { name: 'asc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<any> => {
  const { 
    name, price, original_price, category_id, image_url, description, 
    featured, is_active, badge, specs,
    stock, purchase_price, wholesale_price, unit_price, min_stock_alert
  } = req.body;
  try {
    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        original_price: original_price ? parseFloat(original_price) : null,
        category_id,
        image_url,
        description,
        featured: !!featured,
        is_active: is_active !== undefined ? !!is_active : true,
        badge,
        specs: typeof specs === 'object' ? JSON.stringify(specs) : specs,
        stock: stock ? parseInt(stock) : 0,
        purchase_price: purchase_price ? parseFloat(purchase_price) : 0,
        wholesale_price: wholesale_price ? parseFloat(wholesale_price) : 0,
        unit_price: unit_price ? parseFloat(unit_price) : 0,
        min_stock_alert: min_stock_alert ? parseInt(min_stock_alert) : 5,
      }
    });
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { 
    name, price, original_price, category_id, image_url, description, 
    featured, is_active, badge, specs,
    stock, purchase_price, wholesale_price, unit_price, min_stock_alert
  } = req.body;
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        price: parseFloat(price),
        original_price: original_price ? parseFloat(original_price) : null,
        category_id,
        image_url,
        description,
        featured: !!featured,
        is_active: is_active !== undefined ? !!is_active : true,
        badge,
        specs: typeof specs === 'object' ? JSON.stringify(specs) : specs,
        stock: stock ? parseInt(stock) : 0,
        purchase_price: purchase_price ? parseFloat(purchase_price) : 0,
        wholesale_price: wholesale_price ? parseFloat(wholesale_price) : 0,
        unit_price: unit_price ? parseFloat(unit_price) : 0,
        min_stock_alert: min_stock_alert ? parseInt(min_stock_alert) : 5,
      }
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  try {
    await prisma.product.update({
      where: { id },
      data: { is_active: false }
    });
    res.json({ message: 'Producto desactivado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al desactivar producto' });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<any> => {
  try {
    const categories = await prisma.productCategory.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};
