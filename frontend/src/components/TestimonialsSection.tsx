import { testimonials } from "@/data/products";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

export default function TestimonialsSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
            <Quote className="w-4 h-4" />
            <span>Testimonios Válidados</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black">
            Lo que dicen nuestros <span className="text-gradient">clientes</span>
          </h2>
          <p className="text-sm font-medium text-muted-foreground mt-4 max-w-md mx-auto">
            Miles de clientes satisfechos respaldan la calidad y rendimiento de nuestros equipos.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-8 flex flex-col h-full group hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/30 transition-all justify-between"
            >
              <div>
                <Quote className="w-10 h-10 text-primary/20 mb-6 group-hover:text-primary/40 transition-colors" />
                <p className="text-sm text-foreground/80 mb-6 leading-relaxed italic line-clamp-4">"{t.text}"</p>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 shadow-inner">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-black text-foreground uppercase tracking-widest">{t.name}</p>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
