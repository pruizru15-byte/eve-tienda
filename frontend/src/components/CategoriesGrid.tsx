import { motion } from "framer-motion";
import { LayoutGrid, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useFeaturedCategories } from "../hooks/useFeaturedCategories";
import { Skeleton } from "./ui/skeleton";

export default function CategoriesGrid() {
  const { data: categories, isLoading, error } = useFeaturedCategories();

  if (error) return null;

  return (
    <section className="py-16 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
             <div className="p-3.5 rounded-2xl bg-primary/10 text-primary shadow-inner">
                <LayoutGrid className="w-6 h-6" />
             </div>
             <div>
                <h2 className="text-3xl font-display font-bold tracking-tight">Categorías Destacadas</h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-12 h-1 bg-primary rounded-full" />
                   <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Explora nuestro ecosistema</p>
                </div>
             </div>
          </div>
          <Link 
            to="/productos" 
            className="group flex items-center gap-3 px-8 py-4 bg-secondary/30 hover:bg-primary text-foreground hover:text-primary-foreground rounded-full transition-all duration-500 shadow-xl border border-border/50 hover:border-primary/50"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Mostrar todos</span>
            <div className="w-6 h-6 rounded-full bg-background/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
               <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Categories Carousel */}
        <div className="relative group/carousel">
          <div className="flex gap-5 overflow-x-auto pb-8 pt-2 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-2">
            {isLoading ? (
               Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[260px] h-[90px] rounded-[2rem] bg-slate-900/40 border border-slate-800/50 flex items-center p-4 gap-4 shadow-2xl">
                    <Skeleton className="w-14 h-14 rounded-2xl bg-slate-800/50" />
                    <div className="flex-1 space-y-3">
                        <Skeleton className="h-4 w-3/4 bg-slate-800/50" />
                        <Skeleton className="h-2 w-1/2 bg-slate-800/50 ml-auto" />
                    </div>
                </div>
               ))
            ) : (
              categories?.map((cat, index) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex-shrink-0"
                >
                    <Link
                      to={`/productos?categoria=${cat.id}`}
                      className="flex items-center gap-5 w-[260px] p-4 rounded-[2rem] bg-slate-900 border border-slate-800 hover:border-primary/40 hover:bg-slate-900/60 transition-all duration-500 group shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-primary/10 relative overflow-hidden"
                    >
                      {/* Background Micro-animation */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700" />
                      
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700/50 group-hover:border-primary/40 transition-all duration-500 shrink-0 shadow-lg relative z-10">
                        <img 
                          src={cat.icon || "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=100"} 
                          alt={cat.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                      </div>
                      <div className="flex-1 min-w-0 relative z-10">
                        <p className="font-display font-bold text-base text-white truncate group-hover:text-primary transition-colors leading-tight">
                          {cat.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black italic">
                               {cat._count?.products || 0} Artículos
                            </p>
                        </div>
                      </div>
                    </Link>
                </motion.div>
              ))
            )}
          </div>
          
          {/* Fades for better visual integration on scroll */}
          <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-background via-transparent to-transparent pointer-events-none z-10 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-background via-transparent to-transparent pointer-events-none z-10 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-500" />
        </div>
      </div>
    </section>
  );
}
