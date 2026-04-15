import { motion } from "framer-motion";
import { ShoppingCart, ExternalLink, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveBundles } from "@/hooks/useActiveBundles";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function BundleSection() {
  const { data: bundles, isLoading, error } = useActiveBundles();
  const { addToCart, setIsOpen } = useCart();

  if (error) return null;

  const handleBuyBundle = (bundle: any) => {
    bundle.items.forEach((item: any) => {
        addToCart(item.product);
    });
    setIsOpen(true);
    toast.success(`¡Todo el ecosistema ${bundle.title} agregado!`, {
        description: `${bundle.items.length} productos listos para dominar tu setup.`,
        action: {
            label: "Ver Carrito",
            onClick: () => setIsOpen(true)
        }
    });
  };

  return (
    <section className="py-24 bg-secondary/10 relative overflow-hidden">
      <div className="container mx-auto px-4 relative">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
            <Package className="w-4 h-4" />
            <span>Kits Especiales</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black">
            Equipa tu <span className="text-gradient">Ecosistema</span>
          </h2>
          <p className="text-sm font-medium text-muted-foreground mt-4 max-w-md">
            Productos complementarios diseñados estratégicamente para trabajar juntos.
          </p>
        </div>

        <div className="relative group">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-6">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <CarouselItem key={i} className="pl-6 md:basis-1/2 lg:basis-1/3">
                    <div className="card p-0 flex flex-col overflow-hidden h-full pointer-events-none">
                      <div className="p-6">
                        <Skeleton className="h-7 w-3/4" />
                      </div>
                      <Skeleton className="w-full aspect-video rounded-none" />
                      <div className="p-6 bg-secondary/30 flex gap-3 justify-between">
                        {Array(4).fill(0).map((_, j) => (
                          <Skeleton key={j} className="w-[22%] aspect-square rounded-xl" />
                        ))}
                      </div>
                      <div className="p-6 mt-auto">
                        <Skeleton className="h-12 w-full rounded-2xl" />
                      </div>
                    </div>
                  </CarouselItem>
                ))
              ) : bundles && bundles.length > 0 ? (
                bundles.map((bundle) => {
                  const mainProductItem = bundle.items[0];
                  const mainProduct = mainProductItem?.product;
                  const complementItems = bundle.items.slice(1);

                  return (
                    <CarouselItem key={bundle.id} className="pl-6 md:basis-1/2 lg:basis-1/3">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="card p-0 flex flex-col overflow-hidden group h-full hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/30 transition-all cursor-pointer"
                      >
                        <div className="p-6">
                          <h3 className="text-xl font-display font-bold text-foreground">{bundle.title}</h3>
                        </div>
                        
                        <div className="relative w-full aspect-video bg-muted overflow-hidden">
                          <img 
                            src={bundle.image_url} 
                            alt={bundle.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="p-6 bg-secondary/30 flex gap-3 justify-between">
                          {/* Main Product Thumbnail with Hover Effect */}
                          {mainProduct && (
                            <Link 
                              to={`/producto/${mainProduct.id}`}
                              className="w-[22%] aspect-square rounded-xl border-2 border-primary/50 bg-card overflow-hidden group/main relative hover:glow-blue transition-all"
                            >
                              <img 
                                src={mainProduct.image_url} 
                                alt={mainProduct.name}
                                className="w-full h-full object-cover transition-transform group-hover/main:scale-110"
                              />
                              <div className="absolute inset-x-0 bottom-0 top-0 bg-black/60 opacity-0 group-hover/main:opacity-100 transition-opacity flex flex-col items-center justify-center p-1">
                                <ExternalLink className="w-4 h-4 text-white mb-1" />
                                <span className="text-[10px] sm:text-xs font-bold text-white leading-tight text-center">Ver Principal</span>
                              </div>
                            </Link>
                          )}

                          {/* Complementary Products */}
                          {complementItems.slice(0, 3).map((item) => (
                            <Link 
                              key={item.id}
                              to={`/producto/${item.product.id}`}
                              className="w-[22%] aspect-square rounded-xl border border-border bg-card overflow-hidden group/item relative transition-all"
                            >
                              <img 
                                src={item.product.image_url} 
                                alt={item.product.name}
                                className="w-full h-full object-cover transition-transform group-hover/item:scale-110"
                              />
                              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-[10px] font-bold text-white uppercase text-center">${item.product.price}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                        
                        <div className="p-6 mt-auto">
                          <button 
                            onClick={() => handleBuyBundle(bundle)}
                            className="btn px-6 py-4 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105"
                          >
                            <ShoppingCart className="w-4 h-4" /> Comprar Bundle Completo
                          </button>
                        </div>
                      </motion.div>
                    </CarouselItem>
                  );
                })
              ) : (
                <div className="w-full py-20 text-center text-muted-foreground italic">
                  No hay ecosistemas activos en este momento.
                </div>
              )}
            </CarouselContent>
            
            <div className="hidden md:block">
              <CarouselPrevious className="-left-6 bg-white dark:bg-card border-border hover:bg-primary hover:text-primary-foreground shadow-lg" />
              <CarouselNext className="-right-6 bg-white dark:bg-card border-border hover:bg-primary hover:text-primary-foreground shadow-lg" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
