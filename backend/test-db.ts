import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Probando creación de usuario...');
    const user = await prisma.user.create({
      data: {
        name: 'Test Panda',
        email: `test-${Date.now()}@example.com`,
        password_hash: 'hash',
        role: 'USER',
        verification_token: 'token',
      },
    });
    console.log('Usuario creado con éxito:', user.id);
  } catch (error) {
    console.error('ERROR EN PRISMA:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
