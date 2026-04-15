import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando Cosas Tentadoras...');

  const products = await prisma.product.findMany();
  
  if (products.length < 2) {
    console.log('❌ Error: Necesitas al menos 2 productos en la DB para sembrar tentaciones.');
    return;
  }

  const temptations = [
    {
      product_id: products[0].id,
      subtitle: "GAMING",
      title: "EQUÍPATE PARA TU PRÓXIMO COMBATE",
      image_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
    },
    {
      product_id: products[1 % products.length].id,
      subtitle: "MOVILIDAD",
      title: "TU PRÓXIMO DESTINO ESTÁ AQUÍ",
      image_url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=2070&auto=format&fit=crop",
    },
    {
      product_id: products[2 % products.length].id,
      subtitle: "TECH PRO",
      title: "ENCUENTRA TU NUEVO SETUP",
      image_url: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=2070&auto=format&fit=crop",
    },
    {
      product_id: products[products.length - 1].id,
      subtitle: "HARDWARE",
      title: "TU ESTACIÓN MEJOR EQUIPADA",
      image_url: "https://images.unsplash.com/photo-1598550874175-4d0fe4a2c90b?q=80&w=2070&auto=format&fit=crop",
    }
  ];

  for (const t of temptations) {
    await (prisma as any).temptingOffer.create({
      data: {
        ...t,
        button_text: "¡LO QUIERO!",
        is_active: true
      }
    });
  }

  console.log('✅ ¡4 Tentaciones sembradas con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
