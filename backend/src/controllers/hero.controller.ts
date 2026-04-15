import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Public: GET /api/public/hero-products
export const getHeroProducts = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: "singleton" }
    });
    
    const mode = settings?.hero_mode || "AUTO";

    let products = [];
    
    if (mode === "MANUAL") {
      products = await prisma.product.findMany({
        where: { is_active: true, is_hero_carousel: true },
        include: { category: { select: { name: true } } },
        take: 5
      });
    } else {
      // AUTO mode
      products = await prisma.product.findMany({
        where: { is_active: true },
        orderBy: [{ rating: 'desc' }, { reviews_count: 'desc' }],
        include: { category: { select: { name: true } } },
        take: 5
      });
    }

    const mappedProducts = products.map((p: any) => {
      let features = [];
      try {
        features = p.specs ? JSON.parse(p.specs) : ["Alto Rendimiento", "Calidad Garantizada", "Envío Seguro"];
      } catch(e) {
        features = ["Alto Rendimiento"];
      }
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        originalPrice: p.original_price,
        rating: p.rating,
        reviews: p.reviews_count,
        image: p.image_url,
        badge: p.badge,
        description: p.description,
        categoryId: p.category_id,
        category: p.category,
        isHeroCarousel: p.is_hero_carousel,
        features
      };
    });

    res.status(200).json({ mode, products: mappedProducts });
  } catch (error) {
    console.error("Error obteniendo hero products:", error);
    res.status(500).json({ error: 'Fallo al obtener hero products' });
  }
};

// Admin: GET /api/admin/hero/settings
export const getHeroSettings = async (req: Request, res: Response) => {
  try {
    let settings = await prisma.storeSettings.findUnique({
      where: { id: "singleton" }
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: { id: "singleton", hero_mode: "AUTO" }
      });
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo hero settings' });
  }
};

// Admin: PATCH /api/admin/hero/mode
export const updateHeroMode = async (req: Request, res: Response) => {
  try {
    const { hero_mode } = req.body;
    if (hero_mode !== "AUTO" && hero_mode !== "MANUAL") {
      return res.status(400).json({ error: 'Modo inválido' });
    }

    const updated = await prisma.storeSettings.upsert({
      where: { id: "singleton" },
      update: { hero_mode },
      create: { id: "singleton", hero_mode }
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando hero mode' });
  }
};

// Admin: PATCH /api/admin/products/:id/hero-carousel
export const toggleProductHeroCarousel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_hero_carousel } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: { is_hero_carousel }
    });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando el estado de carrusel del producto' });
  }
};
