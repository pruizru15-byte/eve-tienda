import { PrismaClient } from '@prisma/client';
import type { ProductCategory, Product, FeaturedCategory } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Base uploads directory (relative to backend folder)
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Correct uploads directory (relative to backend/src or backend root)
// Since we are running with tsx from backend folder, __dirname is where the file is.
const UPLOADS_ROOT = path.resolve(__dirname, 'public', 'uploads');
// Subfolders that contain images
const IMAGE_SUBFOLDERS = ['imagenes', 'imagenesPhone', 'imageneslaptops', 'prueba'];

/**
 * Returns an array of random image public paths (e.g. "/uploads/imagenes/file.jpg").
 * Limits to `count` items, no duplicates.
 */
function getRandomImages(count: number): string[] {
  const allImages: string[] = [];
  for (const folder of IMAGE_SUBFOLDERS) {
    const folderPath = path.join(UPLOADS_ROOT, folder);
    if (!fs.existsSync(folderPath)) continue;
    const files = fs.readdirSync(folderPath).filter(f => /\.(jpe?g|png|gif)$/i.test(f));
    for (const file of files) {
      const publicPath = `/uploads/${folder}/${file}`;
      allImages.push(publicPath);
    }
  }
  if (allImages.length <= count) return allImages;
  const selected: string[] = [];
  while (selected.length < count) {
    const idx = Math.floor(Math.random() * allImages.length);
    const img = allImages[idx];
    if (!selected.includes(img)) selected.push(img);
  }
  return selected;
}

async function seedCategories(): Promise<ProductCategory[]> {
  console.log('🌱 Seeding 10 categories (ecosystems)...');
  const categories = Array.from({ length: 10 }, (_, i) => ({
    name: `Ecosistema ${i + 1}`,
    icon: null,
    is_active: true,
  }));
  const created = await Promise.all(
    categories.map(c => prisma.productCategory.create({ data: c }))
  );
  console.log(`✅ Created ${created.length} categories`);
  return created as ProductCategory[];
}

async function seedProducts(categories: ProductCategory[], images: string[]): Promise<void> {
  console.log('🌱 Seeding 10 products linked to categories...');
  const products = categories.map((cat, i) => ({
    category_id: cat.id,
    name: `Producto ${i + 1}`,
    price: parseFloat((Math.random() * 200 + 20).toFixed(2)),
    original_price: null,
    rating: parseFloat((Math.random() * 5).toFixed(1)),
    reviews_count: Math.floor(Math.random() * 100),
    image_url: images[i % images.length] as string,
    badge: i % 3 === 0 ? 'Nuevo' : null,
    description: `Descripción del producto ${i + 1}.`,
    featured: i % 2 === 0,
    is_hero_carousel: i < 3,
    specs: null,
    is_active: true,
  } as Product));
  await Promise.all(products.map(p => prisma.product.create({ data: p })));
  console.log('✅ Products seeded');
}

async function seedFeaturedCategories(categories: ProductCategory[], images: string[]): Promise<void> {
  console.log('🌱 Seeding 10 featured categories (showcase)...');
  const featured = categories.map((cat, i) => ({
    category_id: cat.id,
    name: cat.name,
    image_url: images[i % images.length] as string,
    product_count: Math.floor(Math.random() * 30) + 5,
    order: i,
    is_active: true,
  } as FeaturedCategory));
  await Promise.all(featured.map(f => prisma.featuredCategory.create({ data: f })));
  console.log('✅ Featured categories seeded');
}

async function main() {
  const images = getRandomImages(10);
  if (images.length === 0) {
    console.error('❌ No images found in upload subfolders');
    process.exit(1);
  }
  const categories = await seedCategories();
  await seedProducts(categories, images);
  await seedFeaturedCategories(categories, images);
}

main()
  .catch(e => {
    console.error('🚨 Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
