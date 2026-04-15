import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const q = 'web';
    const category = 'web-dev';
    const maxPriceValue = 1000;

    const where: any = { is_active: true };
    if (q) {
      where.OR = [
        { title: { contains: String(q) } },
        { description: { contains: String(q) } }
      ];
    }
    if (category) {
      where.category_id = String(category);
    }
    if (maxPriceValue) {
      where.price = { lte: parseFloat(String(maxPriceValue)) };
    }

    console.log('Query where clause:', JSON.stringify(where, null, 2));

    const services = await (prisma as any).service.findMany({
      where,
      include: { category: true },
      orderBy: { title: 'asc' }
    });

    console.log('Services found with filters:', services.length);
  } catch (error) {
    console.error('Error querying services with filters:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
