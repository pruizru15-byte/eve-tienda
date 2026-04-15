import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verifyManual() {
  try {
    const email = 'soportepandapo.py@gmail.com';
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { is_verified: true, verification_token: null }
      });
      console.log(`Usuario ${email} verificado manualmente.`);
    } else {
      console.log(`Usuario ${email} no encontrado.`);
    }
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyManual();
