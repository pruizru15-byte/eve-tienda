import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const services = await (prisma as any).service.findMany({
      include: { category: true }
    });
    console.log('Services found:', services.length);
    console.log('First service:', services[0]);
  } catch (error) {
    console.error('Error querying services:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
