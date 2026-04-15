import { motion } from "framer-motion";
import { Shield, Truck, Zap, CheckCircle2, Award, Star } from "lucide-react";
import { useVanguardData } from "../hooks/useVanguardData";
import { Skeleton } from "./ui/skeleton";

const ICON_MAP: Record<string, any> = {
  CheckCircle2,
  Truck,
  Shield,
  Zap,
  Award,
  Star
};

export default function AboutSection() {
  const { data: vanguard, isLoading, error } = useVanguardData();

  if (error) return null;

  return (
    <section id="nosotros" className="py-24 relative overflow-hidden bg-background">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Left Side: Image / Graphics */}
          <div className="flex-1 w-full max-w-2xl">
            {isLoading ? (
               <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-secondary animate-pulse p-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent shadow-inner" />
                  <div className="absolute bottom-10 right-10 w-32 h-40 bg-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3">
                     <Skeleton className="w-10 h-10 rounded-full bg-slate-700" />
                     <Skeleton className="w-16 h-4 bg-slate-700" />
                     <Skeleton className="w-12 h-2 bg-slate-700" />
                  </div>
               </div>
            ) : (
               <motion.div 
                 initial={{ opacity: 0, x: -50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8 }}
                 className="relative group"
               >
                 <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-1000" />
                 
                 <div className="relative aspect-square md:aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-border/50 bg-secondary/30 shadow-2xl">
                   <img 
                     src={vanguard?.main_image_url || "https://images.unsplash.com/photo-1573164773501-2e6ec65fc186?w=600"} 
                     alt={vanguard?.author_name} 
                     className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                   />
                 </div>

                 {/* Floating Image Badge */}
                 <motion.div 
                   animate={{ y: [0, -12, 0] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute -bottom-8 -right-8 glass p-8 rounded-[2rem] shadow-2xl border border-primary/20 flex flex-col items-center min-w-[140px]"
                 >
                   <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-2 shadow-inner">
                     <Star className="w-7 h-7 text-primary fill-primary" />
                   </div>
                   <span className="text-2xl font-display font-black tracking-tight">{vanguard?.image_badge_text?.split(' ')[0]}</span>
                   <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground font-black italic">
                      {vanguard?.image_badge_text?.split(' ').slice(1).join(' ') || "Fidabilidad"}
                   </span>
                 </motion.div>
               </motion.div>
            )}
          </div>

          {/* Right Side: Content */}
          <div className="flex-1 space-y-10">
            <div className="space-y-6">
              {isLoading ? (
                 <div className="space-y-4">
                    <Skeleton className="h-6 w-40 rounded-full" />
                    <Skeleton className="h-16 w-full rounded-2xl" />
                    <Skeleton className="h-4 w-full rounded-full" />
                    <Skeleton className="h-4 w-3/4 rounded-full" />
                 </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black tracking-widest mb-8">
                    <Award className="w-3.5 h-3.5" />
                    <span className="uppercase">{vanguard?.badge_top}</span>
                  </div>
                  
                  <h2 className="text-5xl md:text-6xl font-display font-black mb-8 leading-[0.9] tracking-tighter">
                    {vanguard?.title?.split(' ').map((word, i) => (
                       <span key={i} className={word.toLowerCase() === "ingeniería" ? "text-gradient block md:inline" : ""}>
                          {word}{' '}
                       </span>
                    ))}
                  </h2>
                  
                  <p className="text-xl text-muted-foreground/80 leading-relaxed italic font-medium border-l-4 border-primary/30 pl-6 py-2">
                    "{vanguard?.quote_text}"
                  </p>
                  
                  <div className="mt-10 flex items-center gap-5">
                    <div className="w-14 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                    <div>
                      <h4 className="font-display font-black text-xl tracking-tight uppercase">{vanguard?.author_name}</h4>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{vanguard?.author_role}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Features 2x2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-10 border-t border-border/30">
               {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                     <div key={i} className="space-y-3">
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                     </div>
                  ))
               ) : (
                  vanguard?.features?.map((f, i) => {
                     const Icon = ICON_MAP[f.icon_name] || CheckCircle2;
                     return (
                        <motion.div 
                          key={f.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className="space-y-4 group"
                        >
                           <div className="flex items-center gap-4 text-foreground">
                              <div className="w-10 h-10 rounded-xl bg-secondary border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-xl group-hover:shadow-primary/20">
                                 <Icon className="w-5 h-5" />
                              </div>
                              <span className="font-display font-black text-xs uppercase tracking-widest">{f.title}</span>
                           </div>
                           <p className="text-sm text-muted-foreground leading-relaxed pl-1 shadow-sm italic">
                             {f.description}
                           </p>
                        </motion.div>
                     );
                  })
               )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
