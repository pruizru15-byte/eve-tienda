import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedProducts() {
  const { data: featuredProducts, isLoading, error } = useFeaturedProducts(4);

  if (error) {
    console.error("Error cargando productos destacados:", error);
    return null;
  }

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Selección Premium</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-black">
              Productos <span className="text-gradient">destacados</span>
            </h2>
          </div>
          <Link
            to="/productos"
            className="btn-secondary px-6 hidden md:inline-flex text-xs uppercase tracking-widest"
          >
            Ver todo el catálogo →
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`skel-${i}`} className="card p-0 overflow-hidden flex flex-col pointer-events-none">
                <Skeleton className="h-[250px] w-full rounded-none" />
                <div className="p-6 flex-1 flex flex-col">
                  <Skeleton className="h-3 w-1/3 mb-2" />
                  <Skeleton className="h-6 w-full mb-4" />
                  <div className="flex items-center gap-1 mb-4">
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="mt-auto flex justify-between items-center">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-10 w-10 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {featuredProducts?.map((product) => (
              <motion.div 
                key={product.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
