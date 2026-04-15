import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.featuredCategory.findMany();
  console.log('Total Featured Categories:', categories.length);
  console.log('Active Featured Categories:', categories.filter(c => c.is_active).length);
  console.log('Categories data:', JSON.stringify(categories, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
