import { motion } from "framer-motion";
import { ChevronRight, LayoutGrid, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function CategoryShowcase() {
   const { data: categories, isLoading, error } = useQuery<any[]>({
      queryKey: ['featured-categories-showcase'],
      queryFn: async () => {
         const res = await fetch(`${API_URL}/featured-categories`);
         if (!res.ok) throw new Error("Error fetching featured categories");
         return res.json();
      },
      staleTime: 1000 * 60 * 10
   });

   if (error) return null;

   return (
      <section className="py-24 bg-background overflow-hidden relative" id="categories">
         {/* Ambient accent lights */}
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[180px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

         <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
               <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                     <LayoutGrid className="w-4 h-4" />
                     <span>Explora el Catálogo</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-black">
                     Mejores <span className="text-gradient">Categorías</span>
                  </h2>
                  <p className="text-sm font-medium text-muted-foreground mt-4 max-w-md">
                     Explora ecosistemas tecnológicos curados minuciosamente para tu estilo de vida digital.
                  </p>
               </div>

               <Link
                  to="/productos"
                  className="btn-secondary px-8 flex items-center gap-3 text-[10px] uppercase font-bold tracking-widest group border border-border"
               >
                  <span>Mostrar todos</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>

            <div className="relative group/carousel">
               <Carousel
                 opts={{
                   align: "start",
                   loop: true,
                 }}
                 className="w-full"
               >
                  <CarouselContent className="py-4 -ml-6">
                   {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                         <CarouselItem key={`skel-${i}`} className="pl-6 basis-auto">
                            <div className="card p-4 flex-shrink-0 w-[320px] h-[130px] flex items-center gap-6 animate-pulse">
                           <div className="w-24 h-20 rounded-2xl bg-secondary/50 relative overflow-visible">
                              <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-secondary/80 shadow-xl" />
                           </div>
                           <div className="flex-1 space-y-4">
                              <Skeleton className="h-6 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                           </div>
                         </CarouselItem>
                      ))
                   ) : (
                      categories?.map((cat, index) => (
                         <CarouselItem key={cat.id} className="pl-6 basis-auto">
                            <motion.div
                           initial={{ opacity: 0, scale: 0.9, y: 40 }}
                           whileInView={{ opacity: 1, scale: 1, y: 0 }}
                           viewport={{ once: true }}
                               transition={{ duration: 0.7, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
                               className="py-2"
                            >
                           <Link
                              to={cat.category_id ? `/productos?categories=${cat.category_id}` : "/productos"}
                              className="card p-4 flex items-center gap-6 w-[340px] hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group relative overflow-hidden h-[140px]"
                           >
                              {/* Thumbnail Section */}
                              <div className="relative w-28 h-24 rounded-2xl bg-secondary/50 overflow-visible shrink-0">
                                 <img src={cat.image_url} alt="" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 rounded-2xl" />
                                 {/* Badge */}
                                 <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-primary border-[4px] border-background flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-all duration-500 z-10">
                                    <span className="text-[11px] font-black text-primary-foreground leading-none">{cat.product_count}</span>
                                 </div>
                              </div>
                              
                              <div className="flex-1 min-w-0 relative z-10">
                                 <h4 className="text-xl font-display font-black text-foreground uppercase tracking-tighter leading-[1.05] group-hover:text-primary transition-colors mb-2">
                                    {cat.name}
                                 </h4>
                                 <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-all duration-300">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-primary">Discover more</span>
                                    <motion.div
                                       className="h-[2px] bg-primary rounded-full origin-left"
                                       initial={{ width: "10px" }}
                                       whileHover={{ width: "30px" }}
                                    />
                                 </div>
                              </div>
                               </Link>
                            </motion.div>
                         </CarouselItem>
                      ))
                   )}
                  </CarouselContent>

                  <div className="hidden md:block">
                     <CarouselPrevious className="-left-6 bg-background/50 backdrop-blur-md border border-border hover:bg-primary hover:text-primary-foreground shadow-lg" />
                     <CarouselNext className="-right-6 bg-background/50 backdrop-blur-md border border-border hover:bg-primary hover:text-primary-foreground shadow-lg" />
                  </div>
               </Carousel>
            </div>
         </div>
      </section>
   );
}
