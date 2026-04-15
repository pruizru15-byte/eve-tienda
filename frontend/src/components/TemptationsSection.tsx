import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTemptingOffers, trackTemptingOfferClick } from "../hooks/useTemptingOffers";
import { Skeleton } from "./ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function TemptationsSection() {
  const { data: offers, isLoading } = useTemptingOffers();
  const navigate = useNavigate();

  const handleAction = async (offerId: string, productId: string) => {
    // Registro de click asíncrono
    try {
        await trackTemptingOfferClick(offerId);
    } catch (error) {
        console.error("Error al registrar click");
    }
    // Redirección al producto
    navigate(`/producto/${productId}`);
  };

  if (isLoading) {
    return (
      <section className="py-24 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
           <div className="mb-12">
             <Skeleton className="h-10 w-64 bg-secondary/50 rounded-full mb-2" />
             <Skeleton className="h-1.5 w-20 bg-primary/30 rounded-full" />
           </div>
           <div className="flex gap-6 overflow-hidden mt-8">
              <Skeleton className="w-[80vw] md:w-[60vw] h-[450px] card p-0 bg-secondary/20 flex-shrink-0" />
              <Skeleton className="w-[80vw] md:w-[60vw] h-[450px] card p-0 bg-secondary/20 flex-shrink-0" />
           </div>
        </div>
      </section>
    );
  }

  if (!offers || offers.length === 0) return null;

  return (
    <section className="py-24 bg-background overflow-hidden relative">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
              <span>Sólo Antojos</span>
            </div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-display font-black"
            >
              Cosas <span className="text-gradient">Tentadoras</span>
            </motion.h2>
        </div>

        <div className="mt-8 relative group/carousel">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-6">
              {offers.map((item, index) => {
                return (
                  <CarouselItem key={item.id} className="pl-6 md:basis-[80%] lg:basis-[70%]">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card p-0 group overflow-hidden flex items-center shadow-2xl hover:-translate-y-2 hover:z-10 hover:shadow-primary/10 transition-all duration-500 cursor-pointer w-full h-[350px] md:h-[450px]"
              >
                {/* Content Overlay */}
                <div className="w-full lg:w-3/5 p-8 md:p-16 space-y-4 md:space-y-8 relative z-20 h-full flex flex-col justify-center">
                  <div className="space-y-4">
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="inline-block text-[10px] md:text-xs font-black text-primary-foreground uppercase tracking-[0.3em] px-4 py-1.5 bg-primary rounded-full shadow-lg shadow-primary/20"
                    >
                      {item.subtitle}
                    </motion.span>
                    <h3 className="text-3xl md:text-5xl font-display font-black leading-[1.05] uppercase tracking-tighter text-foreground text-balance">
                      {item.title}
                    </h3>
                  </div>

                  <button 
                    onClick={() => handleAction(item.id, item.product_id)}
                    className="btn px-8 md:px-12 py-4 bg-foreground text-background font-bold text-[10px] uppercase tracking-widest hover:bg-primary hover:text-primary-foreground shadow-xl hover:scale-105 transition-all w-fit group/btn mt-4 overflow-hidden relative"
                  >
                    <span className="relative z-10">{item.button_text}</span>
                    <div className="absolute inset-0 bg-primary translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                  </button>
                </div>

                {/* Background Image / Product Representation */}
                <div className="absolute inset-0 z-10">
                  <div className="relative w-full h-full">
                      <img 
                      src={item.image_url} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                     />
                     {/* Dynamic Gradient Overlay based on Theme */}
                     <div className="absolute inset-0 bg-gradient-to-r from-card/95 via-card/70 to-card/10 lg:to-transparent" />
                     <div className="absolute inset-0 bg-gradient-to-t from-card/40 to-transparent" />
                  </div>
                </div>

                {/* Interactive Glassmorphism Particles */}
                <div className="absolute top-10 right-10 w-24 h-24 bg-primary/20 blur-[60px] rounded-full group-hover:bg-primary/40 transition-all duration-700 opacity-50" />
                <div className="absolute bottom-20 right-40 w-16 h-16 bg-blue-500/10 blur-[40px] rounded-full group-hover:bg-blue-500/30 transition-all duration-700 delay-100 opacity-40" />
              </motion.div>
            </CarouselItem>
            );
          })}
            </CarouselContent>
            
            <div className="hidden md:block">
              <CarouselPrevious className="-left-6 bg-background/50 backdrop-blur-md border border-border hover:bg-primary hover:text-white" />
              <CarouselNext className="-right-6 bg-background/50 backdrop-blur-md border border-border hover:bg-primary hover:text-white" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
