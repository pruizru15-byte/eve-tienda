import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'soportepandapo.py@gmail.com';
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        is_verified: true,
        role: 'ADMIN',
        password_hash: hashedPassword
      },
      create: {
        name: 'Po Admin',
        email,
        password_hash: hashedPassword,
        role: 'ADMIN',
        is_verified: true
      }
    });
    
    console.log(`Usuario ADMIN creado/actualizado: ${email}`);
    console.log(`Contraseña temporal: Admin123!`);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
