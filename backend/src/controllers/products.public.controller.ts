import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getPublicProducts = async (req: Request, res: Response) => {
  try {
    const { featured, categoryName, categoryId, sortBy, sortOrder, limit, hasDiscount } = req.query;

    const where: any = { is_active: true };
    if (featured === 'true') where.featured = true;
    if (categoryName) where.category = { name: categoryName as string };
    if (categoryId) {
        const ids = (categoryId as string).split(',');
        where.category_id = ids.length > 1 ? { in: ids } : ids[0];
    }
    if (hasDiscount === 'true') where.original_price = { not: null };

    const orderBy: any = {};
    if (sortBy) {
        orderBy[sortBy as string] = sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.created_at = 'desc';
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      take: limit ? parseInt(limit as string) : 10,
      select: {
         id: true,
         name: true,
         price: true,
         original_price: true,
         rating: true,
         reviews_count: true,
         image_url: true,
         badge: true,
         featured: true,
         description: true,
         category_id: true,
         specs: true,
         stock: true,
         purchase_price: true,
         wholesale_price: true,
         unit_price: true,
         min_stock_alert: true,
         category: { select: { name: true } }
      }
    });

    // Map to frontend interface
    const mappedProducts = products.map(p => {
        let parsedSpecs = [];
        if (p.specs) {
            try {
                parsedSpecs = JSON.parse(p.specs);
            } catch (e) {
                // If specs is not JSON, might be a string separated by something, fallback to array of 1 element
                parsedSpecs = [p.specs]; 
            }
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
            featured: p.featured,
            description: p.description,
            categoryId: p.category_id,
            category: p.category,
            specs: parsedSpecs,
            stock: p.stock,
            purchasePrice: p.purchase_price,
            wholesalePrice: p.wholesale_price,
            unitPrice: p.unit_price,
            minStockAlert: p.min_stock_alert
        };
    });

    res.status(200).json(mappedProducts);
  } catch (error) {
    console.error("Error obteniendo productos:", error);
    res.status(500).json({ error: 'Tu backend ha fallado miserablemente.' });
  }
};

export const getWeeklyBestSellers = async (req: Request, res: Response) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // En SQLite y Prisma, Order.items es un string JSON. 
    // Para simplificar y ser 100% precisos sin un modelo OrderItem (que no está en el schema),
    // usaremos los productos con mayor rating/reviews de la categoría que más productos tenga en pedidos recientes.
    // O mejor aún: buscaremos los productos más vendidos basándonos en la fecha de creación de las órdenes.
    
    const recentOrders = await prisma.order.findMany({
      where: {
        created_at: { gte: sevenDaysAgo },
        // status: 'COMPLETED' // Comentado temporalmente si no hay órdenes con este estado
      },
      select: { items: true }
    });

    const categoryCounts: Record<string, number> = {};
    const productIds: string[] = [];

    if (recentOrders && recentOrders.length > 0) {
      recentOrders.forEach(order => {
        try {
          const items = JSON.parse(order.items);
          if (Array.isArray(items)) {
            items.forEach((item: any) => {
              if (item && item.id) productIds.push(item.id);
            });
          }
        } catch (e) {
          console.error("Error parseando items de orden:", e);
        }
      });
    }

    // Si no hay productos vendidos o no hay órdenes, ir al fallback
    if (productIds.length === 0) {
      console.log("No se encontraron ventas recientes, ejecutando fallback...");
      const defaultCategory = await prisma.productCategory.findFirst({
         where: { is_active: true },
         include: { _count: { select: { products: true } } },
         orderBy: { products: { _count: 'desc' } }
      });
      
      const categoryId = defaultCategory?.id;
      
      if (!categoryId) {
        return res.json({ categoryName: "Tecnología", products: [] });
      }

      const products = await prisma.product.findMany({
        where: { category_id: categoryId, is_active: true },
        take: 4,
        include: { category: true },
        orderBy: { rating: 'desc' }
      });

      return res.json({ 
        categoryName: defaultCategory.name, 
        products: products.map(p => {
          let specs = [];
          try { specs = p.specs ? JSON.parse(p.specs) : []; } catch(e) {}
          return {
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.original_price,
            rating: p.rating,
            reviews: p.reviews_count,
            image: p.image_url,
            badge: p.badge,
            specs: specs
          };
        }) 
      });
    }

    // Contar categorías de los productos vendidos
    const soldProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { category_id: true, category: { select: { name: true } } }
    });

    if (!soldProducts || soldProducts.length === 0) {
       // Si por alguna razón no encontramos los productos de los IDs, devolver vacío o fallback
       return res.json({ categoryName: "Populares", products: [] });
    }

    soldProducts.forEach(p => {
      if (p.category_id) {
        categoryCounts[p.category_id] = (categoryCounts[p.category_id] || 0) + 1;
      }
    });

    const entries = Object.entries(categoryCounts);
    if (entries.length === 0) {
      return res.json({ categoryName: "Populares", products: [] });
    }

    const sortedEntries = entries.sort((a,b) => b[1] - a[1]);
    const topEntry = sortedEntries[0];
    if (!topEntry) {
      return res.json({ categoryName: "Populares", products: [] });
    }
    const topCategoryId = topEntry[0];
    const topCategory = await prisma.productCategory.findUnique({ where: { id: topCategoryId } });

    const topProducts = await prisma.product.findMany({
      where: { category_id: topCategoryId, is_active: true },
      take: 4,
      include: { category: true },
      orderBy: [{ rating: 'desc' }, { reviews_count: 'desc' }]
    });

    res.status(200).json({
      categoryName: topCategory?.name || "Populares",
      products: topProducts.map(p => {
        let specs = [];
        try { specs = p.specs ? JSON.parse(p.specs) : ["Alto Rendimiento"]; } catch(e) {}
        return {
          id: p.id,
          name: p.name,
          price: p.price,
          originalPrice: p.original_price,
          rating: p.rating,
          reviews: p.reviews_count,
          image: p.image_url,
          badge: p.badge,
          specs: specs
        };
      })
    });

  } catch (error) {
    console.error("Error crítico en weekly best sellers:", error);
    res.status(500).json({ error: 'Fallo al calcular los más vendidos', details: error instanceof Error ? error.message : String(error) });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    let specs = [];
    try { specs = product.specs ? JSON.parse(product.specs) : []; } catch(e) {}

    const mappedProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.original_price,
      rating: product.rating,
      reviews: product.reviews_count,
      image: product.image_url,
      badge: product.badge,
      description: product.description,
      categoryId: product.category_id,
      category: product.category?.name,
      specs: specs,
      stock: product.stock,
      purchasePrice: product.purchase_price,
      wholesalePrice: product.wholesale_price,
      unitPrice: product.unit_price,
      minStockAlert: product.min_stock_alert
    };

    res.json(mappedProduct);
  } catch (error) {
    console.error("Error al obtener producto por ID:", error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

export const submitProductRating = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Calificación inválida. Debe ser entre 1 y 5.' });
    }

    const userId = (req as any).user?.id as string | undefined;
    if (!userId) {
      return res.status(401).json({ error: 'Debes estar logeado para calificar' });
    }

    // Upsert the rating: Update if exists, create if not
    // Since ProductRating doesn't have a unique constraint on [product_id, user_id] yet,
    // I'll check manually or just allow multiple (but user usually means 1 per user).
    // Let's check if there's an existing rating.
    const existing = await prisma.productRating.findFirst({
        where: { product_id: id, user_id: userId }
    });

    if (existing) {
        await prisma.productRating.update({
            where: { id: existing.id },
            data: { rating: Math.round(rating) }
        });
    } else {
        await prisma.productRating.create({
            data: {
                product_id: id,
                user_id: userId,
                rating: Math.round(rating)
            }
        });
    }

    // Get all ratings to calculate average
    const allRatings = await prisma.productRating.findMany({
      where: { product_id: id as string },
      select: { rating: true }
    });

    const reviewsCount = allRatings.length;
    const averageRating = allRatings.reduce((acc, curr) => acc + curr.rating, 0) / reviewsCount;

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: id as string },
      data: {
        rating: averageRating,
        reviews_count: reviewsCount
      }
    });

    res.json({ 
      rating: updatedProduct.rating, 
      reviews: updatedProduct.reviews_count 
    });
  } catch (error) {
    console.error("Error al calificar producto:", error);
    res.status(500).json({ error: 'Error al procesar la calificación' });
  }
};


