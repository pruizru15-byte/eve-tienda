import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Fase de siembra de NovaTech Iniciada...');

  // 1. Limpieza rápida (opcional, pero para asegurar estado)
  await (prisma as any).featuredCategory.deleteMany({});

  // 2. Usuario Administrador (Vital para que el panzón pueda entrar)
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@novatech.com' },
    update: {},
    create: {
      name: 'Lord Shen',
      email: 'admin@novatech.com',
      password_hash: adminPassword,
      role: 'ADMIN',
      is_verified: true,
      terms_accepted: true,
    },
  });
  console.log('✅ Usuario Administrador Creado: admin@novatech.com / admin123');

  // 3. Ajustes de la Empresa (Singleton)
  await prisma.companySettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      about_innovation: 'Innovación con Propósito',
      about_innovation_text: 'En NovaTech, no solo vendemos tecnología, construimos el futuro de tu negocio con pasión y excelencia técnica.',
      about_team: 'Nuestro Equipo',
      about_team_text: 'Expertos multidisciplinarios en desarrollo, diseño y análisis de datos enfocados en tu éxito.',
      about_mission: 'Misión',
      about_mission_text: 'Empoderar a empresas y estudiantes mediante soluciones digitales de vanguardia y asesoría académica de alto nivel.',
      about_values: 'Valores',
      about_values_text: 'Transparencia, innovación constante y compromiso inquebrantable con la calidad en cada entrega.',
      contact_email: 'soporte@novatech.com',
      contact_phone: '+1 234 567 890',
      contact_location: 'Distrito Tecnológico, Silicon Valley',
      social_facebook: 'https://fb.com/novatech',
      social_instagram: 'https://instagr.am/novatech',
      social_twitter: 'https://twitter.com/novatech',
      social_linkedin: 'https://linkedin.com/company/novatech',
      social_github: 'https://github.com/novatech',
      target_email: 'admin@novatech.com'
    },
  });
  console.log('✅ Ajustes de Empresa Inicializados');

  // 4. Categorías de Productos
  const techCat = await prisma.productCategory.create({
    data: {
      name: 'Equipamiento Pro',
      icon: 'Monitor',
    }
  });

  const toolCat = await prisma.productCategory.create({
    data: {
      name: 'Herramientas de Desarrollo',
      icon: 'Cpu',
    }
  });

  console.log('✅ Categorías de Productos Creadas');

  // 5. Productos
  await prisma.product.createMany({
    data: [
      {
        category_id: techCat.id,
        name: 'Workstation Extreme X1',
        price: 2499.99,
        original_price: 2999.00,
        description: 'Potencia bruta para desarrollo de IA y renderizado 3D.',
        image_url: 'https://images.unsplash.com/photo-1593640408182-31c70c8228f5',
        badge: 'Top Ventas',
        featured: true,
        stock: 15,
        purchase_price: 1800.00,
        wholesale_price: 2200.00,
        unit_price: 2499.99,
        min_stock_alert: 3
      },
      {
        category_id: techCat.id,
        name: 'Monitor Curvo 49" OLED',
        price: 1299.50,
        description: 'La máxima inmersión para multitarea productiva.',
        image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf',
        featured: false,
        stock: 25,
        purchase_price: 850.00,
        wholesale_price: 1100.00,
        unit_price: 1299.50,
        min_stock_alert: 5
      },
      {
        category_id: toolCat.id,
        name: 'NV-Core Processor G2',
        price: 450.00,
        description: 'Procesador de última generación con núcleos de aprendizaje profundo.',
        image_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea',
        badge: 'Nuevo',
        featured: true,
        stock: 50,
        purchase_price: 300.00,
        wholesale_price: 380.00,
        unit_price: 450.00,
        min_stock_alert: 10
      }
    ]
  });
  console.log('✅ Productos Añadidos');

  // 6. Servicios
  const cloudCat = await prisma.serviceCategory.create({
    data: {
      title: 'Infraestructura Cloud',
      description: 'Escalamiento masivo para tus aplicaciones.',
    }
  });

  await prisma.service.create({
    data: {
      category_id: cloudCat.id,
      title: 'Despliegue AWS/Azure',
      description: 'Configuración experta de nubes públicas.',
      long_description: 'Auditamos y configuramos tu nube para máximo ahorro y seguridad.',
      price_model: 'Desde $500/mes',
      icon: 'Cloud',
      features: JSON.stringify(['24/7 Monitoreo', 'Auto-escalado', 'Copias de Seguridad']),
    }
  });
  console.log('✅ Servicios de ejemplo creados');

  // 7. Centro de Ayuda
  await prisma.helpSection.createMany({
    data: [
      {
        title: 'Términos de Compra',
        description: 'Reglas del juego para transacciones.',
        content: 'Esta es la información detallada de los términos de compra de NovaTech...',
        order_index: 1,
      },
      {
        title: 'Política de Devoluciones',
        description: 'Cómo reembolsar si no te gusta tu arma de fideos.',
        content: 'Tienes 30 días para devolver productos intactos en su empaque original...',
        order_index: 2,
      }
    ]
  });
  console.log('✅ Centro de Ayuda Inicializado');

  // 8. Featured Categories (Showcase)
  await prisma.featuredCategory.createMany({
    data: [
      {
        name: 'Monitores Pro',
        image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf',
        is_active: true,
        order: 1,
        category_id: techCat.id,
        product_count: 12
      },
      {
        name: 'Componentes',
        image_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea',
        is_active: true,
        order: 2,
        category_id: toolCat.id,
        product_count: 24
      },
      {
        name: 'Workstations',
        image_url: 'https://images.unsplash.com/photo-1593640408182-31c70c8228f5',
        is_active: true,
        order: 3,
        category_id: techCat.id,
        product_count: 8
      },
      {
        name: 'Laptops Gamer',
        image_url: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6',
        is_active: true,
        order: 4,
        category_id: techCat.id,
        product_count: 15
      }
    ]
  });
  console.log('✅ Categorías Destacadas Añadidas');

  console.log('🚀 ¡Siembra Completa! El imperio ha vuelto a la vida.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
