import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Sembrando datos de servicios...');

  // 1. Categorías
  const devWeb = await (prisma as any).serviceCategory.upsert({
    where: { id: 'web-dev' },
    update: {},
    create: {
      id: 'web-dev',
      title: 'Desarrollo Web',
      description: 'Soluciones digitales a medida para potenciar tu presencia online.',
      is_active: true
    }
  });

  const academic = await (prisma as any).serviceCategory.upsert({
    where: { id: 'academic' },
    update: {},
    create: {
      id: 'academic',
      title: 'Actividades Académicas',
      description: 'Apoyo educativo especializado para alcanzar la excelencia académica.',
      is_active: true
    }
  });

  const reports = await (prisma as any).serviceCategory.upsert({
    where: { id: 'reports' },
    update: {},
    create: {
      id: 'reports',
      title: 'Informes y Análisis',
      description: 'Transformamos datos en decisiones estratégicas inteligentes.',
      is_active: true
    }
  });

  // 2. Servicios
  const services = [
    {
      id: 'landing-page',
      category_id: 'web-dev',
      title: 'Landing Page Premium',
      description: 'Página de aterrizaje optimizada para conversiones con diseño moderno.',
      long_description: 'Creamos una experiencia única para tus usuarios. Una landing page que no solo se ve increíble, sino que está diseñada para convertir visitantes en clientes. Incluye animaciones personalizadas, diseño responsive y SEO básico.',
      price_model: 'Un pago',
      price: 200,
      features: JSON.stringify(["Diseño Responsive", "Animaciones Framer Motion", "Formulario de Contacto", "Optimización de Velocidad"]),
      icon: 'globe'
    },
    {
      id: 'e-commerce',
      category_id: 'web-dev',
      title: 'Tienda Online Premium',
      description: 'Tu negocio abierto las 24 horas con pasarela de pagos integrada.',
      long_description: 'Desarrollamos tu plataforma de ventas completa. Gestión de productos, carrito de compras, perfiles de usuario y pagos seguros. Todo lo que necesitas para escalar tu negocio al mundo digital.',
      price_model: 'Un pago',
      price: 600,
      features: JSON.stringify(["Gestión de Productos", "Pasarela de Pagos", "Panel de Administración", "Soporte Técnico"]),
      icon: 'shopping-cart'
    },
    {
      id: 'asesoria-tesis',
      category_id: 'academic',
      title: 'Asesoría de Tesis',
      description: 'Acompañamiento integral en tu proceso de investigación de grado.',
      long_description: 'Te ayudamos a estructurar tu investigación, definir la metodología y redactar tus hallazgos. No hacemos el trabajo por ti, te guiamos para que seas un profesional excepcional.',
      price_model: 'Mensual',
      price: 150,
      features: JSON.stringify(["Metodología de Investigación", "Corrección de Estilo", "Normas APA/Vancouver", "Simulacro de Defensa"]),
      icon: 'graduation-cap'
    },
    {
      id: 'clases-particulares',
      category_id: 'academic',
      title: 'Clases Personalizadas',
      description: 'Refuerzo en áreas de programación, matemáticas y ciencias.',
      long_description: 'Sesiones uno a uno enfocadas en resolver tus dudas específicas. Aprendizaje a tu ritmo con ejercicios prácticos y material de apoyo exclusivo.',
      price_model: 'Por hora',
      price: 20,
      features: JSON.stringify(["Material de Estudio", "Ejercicios Prácticos", "Horarios Flexibles", "Grabación de Sesiones"]),
      icon: 'book-open'
    },
    {
      id: 'data-analysis',
      category_id: 'reports',
      title: 'Arquitectura de Datos',
      description: 'Reportes detallados y visualizaciones de datos profesionales.',
      long_description: 'Analizamos tus métricas y creamos informes visuales impactantes que facilitan la toma de decisiones. Especializados en informes técnicos, financieros y de marketing.',
      price_model: 'Por proyecto',
      price: 100,
      features: JSON.stringify(["Dashboards Interactivos", "Análisis de Tendencias", "Exportación PDF/Excel", "Presentación de Resultados"]),
      icon: 'database'
    }
  ];

  for (const s of services) {
    await (prisma as any).service.upsert({
      where: { id: s.id },
      update: s,
      create: s
    });
  }

  console.log('✅ Servicios sembrados con éxito.');
}

seed()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
