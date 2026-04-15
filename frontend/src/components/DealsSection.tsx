import { motion } from "framer-motion";
import { Percent } from "lucide-react";
import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveOffers } from "@/hooks/useActiveOffers";

export default function DealsSection() {
  const { data: offers, isLoading, error } = useActiveOffers();

  if (error) return null;

  return (
    <section id="ofertas" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase font-bold tracking-widest mb-4">
            <Percent className="w-4 h-4" />
            <span>Ofertas limitadas</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black">
            Las mejores <span className="text-gradient">ofertas</span>
          </h2>
          <p className="text-sm font-medium text-muted-foreground mt-4 max-w-md mx-auto">
            Aprovecha descuentos exclusivos en productos seleccionados. ¡Stock limitado!
          </p>
        </motion.div>

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
          {isLoading ? (
            // Skeletons con el mismo aspecto que las tarjetas reales
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="card p-0 overflow-hidden flex flex-col pointer-events-none">
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
            ))
          ) : (
            offers?.map((offer) => {
              // Mapeo de Offer a la interfaz que espera ProductCard
              const productData = offer.product;
              if (!productData) return null;

              const discountPrice = productData.price;
              // Si la oferta tiene descuento, calculamos el precio original
              // basándonos en el porcentaje o lo tomamos del producto
              const originalPrice = productData.original_price || (discountPrice / (1 - (offer.discount / 100)));
              
              const mappedProduct = {
                id: productData.id,
                name: offer.title || productData.name,
                category: productData.category.name,
                image: offer.image_url || productData.image_url,
                price: discountPrice,
                originalPrice: originalPrice,
                rating: productData.rating,
                reviews: productData.reviews_count,
                badge: `-${offer.discount}%`
              };

              return <ProductCard key={offer.id} product={mappedProduct} />;
            })
          )}
        </motion.div>

        {!isLoading && (!offers || offers.length === 0) && (
          <div className="card text-center py-20 border-dashed border-border flex flex-col items-center gap-4">
            <Percent className="w-12 h-12 text-muted-foreground opacity-20" />
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No hay ofertas activas en este momento</p>
          </div>
        )}
      </div>
    </section>
  );
}
