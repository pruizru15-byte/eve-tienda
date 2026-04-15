import { motion } from "framer-motion";
import { Star, TrendingUp, ArrowRight, Zap, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useWeeklyBestSellers } from "@/hooks/useWeeklyBestSellers";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function BestSellersLaptops() {
  const { data, isLoading, error } = useWeeklyBestSellers();

  if (error) return null;

  const categoryName = data?.categoryName || "Tecnología";
  const products = data?.products || [];

  return (
    <section className="py-24 relative overflow-hidden bg-background">
      {/* Background design elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 blur-[120px] rounded-full" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Tendencia Semanal</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-display font-black"
            >
              {isLoading ? (
                <Skeleton className="h-12 w-64 md:w-96" />
              ) : (
                <>
                  Más vendidos de <span className="text-primary italic">{categoryName}</span>
                </>
              )}
            </motion.h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              Selección inteligente basada en las preferencias de nuestra comunidad durante los últimos 7 días.
            </p>
          </div>
          
          {!isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
            >
              <Link 
                to={`/productos?category=${categoryName.toLowerCase()}`}
                className="btn-secondary px-8 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest group"
              >
                Explorar Categoría <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          )}
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <CarouselItem key={i} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="card p-2 flex flex-col space-y-4 pointer-events-none">
                    <Skeleton className="aspect-[16/10] w-full rounded-[20px]" />
                    <div className="p-6 space-y-4 flex-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-12 w-full rounded-2xl" />
                      <div className="flex justify-between items-center pt-4">
                        <Skeleton className="h-7 w-1/3" />
                        <Skeleton className="h-10 w-10 rounded-xl" />
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))
            ) : products.length > 0 ? (
              products.map((product, index) => (
                <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="card p-2 group h-full hover:shadow-2xl hover:shadow-primary/5 flex flex-col cursor-pointer"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[20px]">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                        <span className="text-primary-foreground text-[10px] font-bold uppercase tracking-widest bg-primary px-4 py-2 rounded-xl shadow-lg">
                          Tendencia 7D
                        </span>
                      </div>
                      <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-background border border-border flex items-center gap-1.5 text-xs font-bold text-accent shadow-lg shadow-black/20">
                        <Star className="w-3.5 h-3.5 fill-accent" />
                        {product.rating.toFixed(1)}
                      </div>
                    </div>

                    <div className="p-6 space-y-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[2px] mb-1">{categoryName}</p>
                          <h3 className="text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border/50 mt-auto">
                         <Target className="w-4 h-4 text-primary shrink-0" />
                         <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest line-clamp-1">
                            {Array.isArray(product.specs) ? product.specs.join(" | ") : "Alto Rendimiento"}
                         </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <p className="text-2xl font-display font-black text-foreground">${product.price.toLocaleString()}</p>
                        <Link 
                          to={`/producto/${product.id}`}
                          className="btn p-3 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-110"
                        >
                          <Zap className="w-4 h-4 fill-current" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-muted-foreground italic">
                Aún no tenemos tendencias hoy. ¡Sé el primero en comprar!
              </div>
            )}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="-left-6 bg-background/50 backdrop-blur-md border-primary/20 hover:bg-primary hover:text-white" />
            <CarouselNext className="-right-6 bg-background/50 backdrop-blur-md border-primary/20 hover:bg-primary hover:text-white" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
