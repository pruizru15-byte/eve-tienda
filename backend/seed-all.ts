import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Restaurando datos...');

  // 1. Admin
  const email = 'soportepandapo.py@gmail.com';
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email },
    update: { is_verified: true, role: 'ADMIN', password_hash: hashedPassword },
    create: { name: 'Po Admin', email, password_hash: hashedPassword, role: 'ADMIN', is_verified: true }
  });

  // 2. Categories
  const categories = [
    { id: 'laptops', name: 'Laptops', icon: 'monitor' },
    { id: 'componentes', name: 'Componentes', icon: 'cpu' },
    { id: 'perifericos', name: 'Periféricos', icon: 'mouse' },
    { id: 'gaming', name: 'Gaming', icon: 'controller' },
    { id: 'audio', name: 'Audio', icon: 'headphones' },
  ];
  for (const cat of categories) {
    await prisma.productCategory.upsert({ where: { id: cat.id }, update: cat, create: cat });
  }

  // 3. Sample Products
  const products = [
    { name: 'NovaPro X1 Hyper Mouse', price: 129.00, description: 'Mouse gaming de alta precisión', category_id: 'perifericos', image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80', stock: 100, purchase_price: 60, wholesale_price: 90, unit_price: 129, min_stock_alert: 10 },
    { name: 'Quantum v2 Mechanical Keyboard', price: 249.99, description: 'Teclado mecánico RGB', category_id: 'perifericos', image_url: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80', stock: 45, purchase_price: 120, wholesale_price: 180, unit_price: 249.99, min_stock_alert: 5 },
    { name: 'Apex Gaming Laptop 17"', price: 1899.00, description: 'Laptop para gaming extremo', category_id: 'laptops', image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80', stock: 12, purchase_price: 1400, wholesale_price: 1650, unit_price: 1899, min_stock_alert: 2 },
  ];
  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  // 4. Sample Topics
  const topic1 = await prisma.forumTopic.create({
    data: {
      title: '¡Bienvenidos al nuevo NovaForo!',
      content: 'Hemos actualizado el foro para permitir hilos de discusión más dinámicos y anuncios oficiales. ¡Panzón, espero tus comentarios!',
      author_id: admin.id,
    }
  });

  await prisma.forumComment.create({
    data: {
      topic_id: topic1.id,
      content: '¡Excelente actualización! Ya puedo responder a los comunicados.',
      author_id: admin.id,
    }
  });

  // 5. Help Sections
  const helpSections = [
    {
      title: "El Acuerdo",
      description: "Reglas básicas de la comunidad NovaTech.",
      content: "Al usar NovaTech, aceptas que somos una comunidad de respeto. No permitimos el uso de nuestra tecnología para fines maliciosos. Todo es 'chevere' mientras sigas las reglas.",
      order_index: 1
    },
    {
      title: "Tu Privacidad",
      description: "Protección feroz de tus datos personales.",
      content: "Tus datos son sagrados. Los protegemos con la misma ferocidad con la que protegemos nuestro código. No los vendemos, no los regalamos, solo los usamos para mejorar tu experiencia.",
      order_index: 2
    },
    {
      title: "Reglas del Juego",
      description: "Términos comerciales y de servicio.",
      content: "Los servicios se entregan según lo acordado. Los pagos son finales una vez aceptado el trabajo. La transparencia es nuestra ley, y la calidad es nuestro compromiso.",
      order_index: 3
    },
    {
      title: "Propiedad Intelectual",
      description: "Derechos sobre el código y la creatividad.",
      content: "El código que escribimos es arte. Al contratar un servicio, obtienes los derechos de uso acordados, pero la genialidad original sigue siendo nuestra (bueno, mía).",
      order_index: 4
    }
  ];
  for (const section of helpSections) {
    await prisma.helpSection.create({ data: section });
  }

  console.log('Datos restaurados con éxito.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
