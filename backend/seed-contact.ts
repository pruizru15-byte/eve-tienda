import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando Centro de Contacto...');

  await (prisma as any).contactSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      support_email: "soporte@novatech-store.com",
      email_subtext: "Respuesta en menos de 2h",
      phone: "+54 9 11 1234 5678",
      phone_subtext: "Lunes a Viernes 9:00 - 18:00",
      address_line1: "Torre Titanium, Piso 42, Hub Tecnológico",
      address_line2: "Buenos Aires, Argentina",
      linkedin_url: "https://linkedin.com/company/novatech",
      twitter_url: "https://twitter.com/novatech",
      github_url: "https://github.com/novatech"
    }
  });

  console.log('✅ Contacto sembrado con éxito');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
