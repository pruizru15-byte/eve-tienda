import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando Módulo Vanguardia...');

  const vanguard = await (prisma as any).vanguardSection.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      badge_top: "EXPERIENCIA DE ÉLITE",
      title: "Liderado por Ingeniería de Vanguardia",
      quote_text: "En NovaTech no solo movemos hardware; seleccionamos piezas maestras. Mi misión como ingeniera es garantizar que cada producto sea una inversión en rendimiento extremo. Cada equipo que sale de nuestro almacén ha sido verificado bajo los estándares más técnicos de la industria.",
      author_name: "Ing. Nova S.",
      author_role: "Founder & Lead Tech Architect",
      main_image_url: "https://images.unsplash.com/photo-1573164773501-2e6ec65fc186?q=80&w=800&auto=format&fit=crop",
      image_badge_text: "100% FIABILIDAD"
    }
  });

  const features = [
    { icon_name: "CheckCircle2", title: "Calidad al 100%", description: "Filtramos cada componente. Si no es lo mejor, no lo vendemos." },
    { icon_name: "Truck", title: "Envío Ultra-Seguro", description: "Logística premium para asegurar que tu tecnología llegue intacta." },
    { icon_name: "Shield", title: "Soporte de Ingeniería", description: "Asistencia técnica brindada directamente por expertos en sistemas." },
    { icon_name: "Zap", title: "Innovación Real", description: "Acceso prioritario a los últimos lanzamientos tecnológicos globales." }
  ];

  await (prisma as any).vanguardFeature.deleteMany({ where: { vanguard_id: 'singleton' } });
  
  for (const f of features) {
    await (prisma as any).vanguardFeature.create({
      data: {
        ...f,
        vanguard_id: 'singleton'
      }
    });
  }

  console.log('✅ Vanguardia sembrada con éxito');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
