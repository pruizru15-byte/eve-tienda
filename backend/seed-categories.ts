import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
  const categories = [
    { id: 'laptops', name: 'Laptops', icon: 'monitor' },
    { id: 'componentes', name: 'Componentes', icon: 'cpu' },
    { id: 'perifericos', name: 'Periféricos', icon: 'mouse' },
    { id: 'gaming', name: 'Gaming', icon: 'controller' },
    { id: 'audio', name: 'Audio', icon: 'headphones' },
  ];

  for (const cat of categories) {
    await prisma.productCategory.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat,
    });
  }
  console.log('Categorías sembradas con éxito.');
}

seed().finally(() => prisma.$disconnect());
