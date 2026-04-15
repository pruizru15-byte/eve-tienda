import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando Showcase de Categorías...');

  const categories = await prisma.productCategory.findMany();
  
  const showcased = [
    {
      name: "GAMING XPERIENCE",
      image_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
      product_count: 24,
      category_id: categories.find(c => c.name.toLowerCase().includes("pro"))?.id || null,
      order: 0
    },
    {
      name: "MOBILE LIFESTYLE",
      image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop",
      product_count: 18,
      category_id: categories[0]?.id || null,
      order: 1
    },
    {
      name: "WORKSPACE PRO",
      image_url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=600&auto=format&fit=crop",
      product_count: 12,
      category_id: categories[1]?.id || null,
      order: 2
    },
    {
      name: "AUDIO & VIDEO",
      image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop",
      product_count: 32,
      category_id: null,
      order: 3
    }
  ];

  for (const s of showcased) {
    await (prisma as any).featuredCategory.create({
      data: {
        ...s,
        is_active: true
      }
    });
  }

  console.log('✅ Showcase sembrado con éxito');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
