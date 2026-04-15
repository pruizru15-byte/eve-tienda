import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Zap, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useHeroBanner } from "@/hooks/useHeroBanner";
import { Skeleton } from "@/components/ui/skeleton";

export default function HeroBanner() {
  const { data, isLoading, error } = useHeroBanner();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const BANNER_PRODUCTS = data?.products || [];

  useEffect(() => {
    if (BANNER_PRODUCTS.length <= 1) return;
    const timer = setInterval(() => {
      paginate(1);
    }, 5000); 
    return () => clearInterval(timer);
  }, [index, BANNER_PRODUCTS.length]);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setIndex((prevIndex) => (prevIndex + newDirection + BANNER_PRODUCTS.length) % BANNER_PRODUCTS.length);
  };

  const variants = {
    enter: (direction: number) => ({
      opacity: 0,
      scale: 1.1,
      filter: "blur(10px)"
    }),
    center: {
      zIndex: 1,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)"
    },
    exit: (direction: number) => ({
      zIndex: 0,
      opacity: 0,
      scale: 0.9,
      filter: "blur(10px)"
    })
  };

  if (isLoading) {
    return (
      <section className="relative w-full h-[600px] md:h-[750px] overflow-hidden bg-background">
        <Skeleton className="w-full h-full" />
      </section>
    );
  }

  if (error || BANNER_PRODUCTS.length === 0) {
    return null; // O un banner de fallback
  }

  const currentProduct = BANNER_PRODUCTS[index];

  return (
    <section className="relative w-full h-[600px] md:h-[750px] overflow-hidden bg-background">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentProduct.id}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            opacity: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
            scale: { duration: 1.2, ease: [0.4, 0, 0.2, 1] },
            filter: { duration: 0.8 }
          }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <img 
              src={currentProduct.image} 
              alt={currentProduct.name}
              className="w-full h-full object-cover scale-110 blur-[2px] opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          </div>

          {/* Content Container */}
          <div className="container mx-auto px-4 h-full relative z-10 flex flex-col justify-center">
            <div className="max-w-2xl space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest"
              >
                <Zap className="w-3 h-3" />
                <span>Novedad Exclusiva</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-7xl font-display font-bold leading-tight"
              >
                {currentProduct.name}
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-muted-foreground leading-relaxed max-w-lg"
              >
                {currentProduct.description}
              </motion.p>

              {/* Specs Badges */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                {currentProduct.features?.map((feature: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/70">
                    <Target className="w-4 h-4 text-primary" />
                    {feature}
                  </div>
                ))}
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-6 pt-6"
              >
                <Link 
                  to={`/producto/${currentProduct.id}`}
                  className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-display font-bold text-lg hover:glow-blue transition-all flex items-center gap-3 active:scale-[0.98]"
                >
                  Ver Propiedades <ArrowRight className="w-5 h-5" />
                </Link>
                <div className="text-3xl font-display font-bold text-primary">
                  ${currentProduct.price.toLocaleString()}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Visual Floating Element */}
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="hidden lg:block absolute right-[10%] top-1/2 -translate-y-1/2 w-[500px] h-[500px]"
          >
            <img 
              src={currentProduct.image} 
              alt={currentProduct.name}
              className="w-full h-full object-cover rounded-[3rem] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-1000 border-8 border-background/50 backdrop-blur-md"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {BANNER_PRODUCTS.length > 1 && (
        <div className="absolute inset-0 container mx-auto px-4 flex items-center justify-between pointer-events-none z-20">
          <button
            onClick={() => paginate(-1)}
            className="p-4 rounded-2xl glass hover:bg-primary hover:text-primary-foreground transition-all active:scale-[0.9] pointer-events-auto"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={() => paginate(1)}
            className="p-4 rounded-2xl glass hover:bg-primary hover:text-primary-foreground transition-all active:scale-[0.9] pointer-events-auto"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}

      {/* Slide Indicators */}
      {BANNER_PRODUCTS.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {BANNER_PRODUCTS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-500 ${index === i ? "w-12 bg-primary" : "w-4 bg-muted-foreground/30 hover:bg-muted-foreground/60"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
