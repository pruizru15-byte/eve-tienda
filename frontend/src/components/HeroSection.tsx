import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-tech.jpg";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Tecnología premium" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.15,
              delayChildren: 0.2
            }
          }
        }}
        className="container mx-auto px-4 relative z-10 pt-20"
      >
        <div className="max-w-2xl">
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6"
          >
            <Zap className="w-4 h-4" />
            <span>Nuevos lanzamientos disponibles</span>
          </motion.div>
 
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
            }}
            className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6"
          >
            Tecnología que
            <br />
            <span className="text-gradient">transforma</span>
            <br />
            tu mundo
          </motion.h1>
 
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            className="text-lg text-muted-foreground mb-8 max-w-lg"
          >
            Descubre los productos tecnológicos más innovadores. Rendimiento excepcional, diseño premium y los mejores precios del mercado.
          </motion.p>
 
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            className="flex flex-wrap gap-4"
          >
            <Link
              to="/productos"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all duration-300 animate-pulse-glow"
            >
              Explorar productos
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#ofertas"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border border-border text-foreground font-semibold hover:bg-secondary transition-all duration-300"
            >
              Ver ofertas
            </a>
          </motion.div>
 
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { delay: 0.5 } }
            }}
            className="flex items-center gap-8 mt-12 text-sm text-muted-foreground"
          >
            <div className="flex flex-col">
              <span className="text-2xl font-display font-bold text-foreground">10K+</span>
              <span>Clientes felices</span>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex flex-col">
              <span className="text-2xl font-display font-bold text-foreground">500+</span>
              <span>Productos</span>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex flex-col">
              <span className="text-2xl font-display font-bold text-foreground">24/7</span>
              <span>Soporte</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
