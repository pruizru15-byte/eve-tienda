
export interface Service {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  price: string;
  category: string;
  features: string[];
  icon: string;
}

export interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  services: Service[];
}

export const servicesData: ServiceCategory[] = [
  {
    id: "web-dev",
    title: "Desarrollo Web",
    description: "Soluciones digitales a medida para potenciar tu presencia online.",
    services: [
      {
        id: "landing-page",
        title: "Landing Page Premium",
        description: "Página de aterrizaje optimizada para conversiones con diseño moderno.",
        longDescription: "Creamos una experiencia única para tus usuarios. Una landing page que no solo se ve increíble, sino que está diseñada para convertir visitantes en clientes. Incluye animaciones personalizadas, diseño responsive y SEO básico.",
        price: "Desde $200",
        category: "Desarrollo Web",
        features: ["Diseño Responsive", "Animaciones Framer Motion", "Formulario de Contacto", "Optimización de Velocidad"],
        icon: "Globe"
      },
      {
        id: "e-commerce",
        title: "Tienda Online (E-commerce)",
        description: "Tu negocio abierto las 24 horas con pasarela de pagos integrada.",
        longDescription: "Desarrollamos tu plataforma de ventas completa. Gestión de inventario, carrito de compras, perfiles de usuario y pagos seguros. Todo lo que necesitas para escalar tu negocio al mundo digital.",
        price: "Desde $600",
        category: "Desarrollo Web",
        features: ["Gestión de Productos", "Pasarela de Pagos", "Panel de Administración", "Soporte Técnico"],
        icon: "ShoppingCart"
      }
    ]
  },
  {
    id: "academic",
    title: "Actividades Académicas",
    description: "Apoyo educativo especializado para alcanzar la excelencia académica.",
    services: [
      {
        id: "asesoria-tesis",
        title: "Asesoría de Tesis",
        description: "Acompañamiento integral en tu proceso de investigación de grado.",
        longDescription: "Te ayudamos a estructurar tu investigación, definir la metodología y redactar tus hallazgos. No hacemos el trabajo por ti, te guiamos para que seas un profesional excepcional.",
        price: "Desde $150/mes",
        category: "Actividades Académicas",
        features: ["Metodología de Investigación", "Corrección de Estilo", "Normas APA/Vancouver", "Simulacro de Defensa"],
        icon: "GraduationCap"
      },
      {
        id: "clases-particulares",
        title: "Clases Personalizadas",
        description: "Refuerzo en áreas de programación, matemáticas y ciencias.",
        longDescription: "Sesiones uno a uno enfocadas en resolver tus dudas específicas. Aprendizaje a tu ritmo con ejercicios prácticos y material de apoyo exclusivo.",
        price: "$20 / hora",
        category: "Actividades Académicas",
        features: ["Material de Estudio", "Ejercicios Prácticos", "Horarios Flexibles", "Grabación de Sesiones"],
        icon: "BookOpen"
      }
    ]
  },
  {
    id: "reports",
    title: "Informes y Análisis",
    description: "Transformamos datos en decisiones estratégicas inteligentes.",
    services: [
      {
        id: "data-analysis",
        title: "Creación de Informes",
        description: "Reportes detallados y visualizaciones de datos profesionales.",
        longDescription: "Analizamos tus métricas y creamos informes visuales impactantes que facilitan la toma de decisiones. Especializados en informes técnicos, financieros y de marketing.",
        price: "Desde $100",
        category: "Informes y Análisis",
        features: ["Dashboards Interactivos", "Análisis de Tendencias", "Exportación PDF/Excel", "Presentación de Resultados"],
        icon: "BarChart3"
      }
    ]
  }
];
