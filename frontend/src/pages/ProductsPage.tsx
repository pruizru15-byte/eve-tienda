import { useState, useMemo, useEffect, useRef } from "react";

import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Laptop, Smartphone, Headphones, Cpu, Grid3X3, PackageX, ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const iconMap: Record<string, React.ElementType> = {
  Grid3X3, Laptop, Smartphone, Headphones, Cpu,
};

type SortOption = "popular" | "price-asc" | "price-desc" | "rating";

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("categories") ? searchParams.get("categories")!.split(",") : []
  );
  const [sort, setSort] = useState<SortOption>("popular");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Fetch categories
    fetch('http://localhost:3000/api/categories')
      .then(res => res.json())
      .then(data => setDbCategories([{ id: "all", name: "Todos", icon: "Grid3X3" }, ...data]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const catParam = selectedCategories.length > 0 ? `&categoryId=${selectedCategories.join(",")}` : "";
    fetch(`http://localhost:3000/api/public/products?limit=100${catParam}`)
      .then(res => res.json())
      .then(data => {
        setDbProducts(data);
        setLoading(false);
      });
    
    // Update URL without reloading
    if (selectedCategories.length > 0) {
      setSearchParams({ categories: selectedCategories.join(",") });
    } else {
      setSearchParams({});
    }
  }, [selectedCategories]);

  const toggleCategory = (id: string) => {
    if (id === "all") {
        setSelectedCategories([]);
        return;
    }
    setSelectedCategories(prev => 
        prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const filtered = useMemo(() => {
    let list = dbProducts;
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    
    switch (sort) {
      case "price-asc": return [...list].sort((a, b) => a.price - b.price);
      case "price-desc": return [...list].sort((a, b) => b.price - a.price);
      case "rating": return [...list].sort((a, b) => b.rating - a.rating);
      default: return [...list].sort((a, b) => b.reviews - a.reviews);
    }
  }, [dbProducts, sort, search]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-40 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            className="mb-10"
          >
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
              }}
              className="text-4xl md:text-5xl font-display font-bold mb-2"
            >
              Nuestro <span className="text-gradient">catálogo</span>
            </motion.h1>
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
              }}
              className="text-muted-foreground"
            >
              Encuentra la tecnología perfecta para ti
            </motion.p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6 mb-12"
          >
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="¿Qué estás buscando hoy?"
                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-secondary/30 border border-transparent focus:bg-card focus:border-primary/50 focus:shadow-xl focus:shadow-primary/10 outline-none transition-all font-medium text-foreground placeholder:text-muted-foreground/60"
                />
              </div>

              <div className="relative min-w-[240px]">
                <SlidersHorizontal className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="w-full pl-14 pr-10 py-4 rounded-2xl bg-secondary/30 border border-transparent focus:bg-card focus:border-primary/50 outline-none transition-all text-sm font-bold appearance-none cursor-pointer uppercase tracking-widest text-muted-foreground hover:text-foreground"
                >
                  <option value="popular">Más Populares</option>
                  <option value="price-asc">Menor Precio</option>
                  <option value="price-desc">Mayor Precio</option>
                  <option value="rating">Mejor Valorados</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/50">
                   &#9662; 
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="relative group/scroll">
              <div 
                className="absolute left-0 top-0 bottom-4 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none opacity-0 group-hover/scroll:opacity-100 transition-opacity flex items-center justify-start"
              >
                <button 
                  onClick={() => scrollCategories('left')}
                  className="w-8 h-8 rounded-full bg-card shadow-lg border border-border flex items-center justify-center text-primary hover:scale-110 transition-transform pointer-events-auto ml-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              <div 
                ref={scrollRef}
                className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth relative"
              >
                <button
                  onClick={() => toggleCategory("all")}
                  className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                    selectedCategories.length === 0
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                      : "bg-transparent border-border/50 text-muted-foreground hover:border-primary/50 hover:bg-secondary/50"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                  Todos los Equipos
                </button>
                {dbCategories.filter(c => c.id !== "all").map((cat) => {
                  const Icon = iconMap[cat.icon] || Cpu;
                  const isActive = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                          : "bg-transparent border-border/50 text-muted-foreground hover:border-primary/50 hover:bg-secondary/50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              <div 
                className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none opacity-0 group-hover/scroll:opacity-100 transition-opacity flex items-center justify-end"
              >
                <button 
                  onClick={() => scrollCategories('right')}
                  className="w-8 h-8 rounded-full bg-card shadow-lg border border-border flex items-center justify-center text-primary hover:scale-110 transition-transform pointer-events-auto mr-2"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
               <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card text-center py-20 px-6 max-w-md mx-auto border-dashed border-border flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-background rounded-2xl shadow-inner flex items-center justify-center mx-auto mb-6 text-muted-foreground/30 ring-1 ring-border">
                 <PackageX className="w-10 h-10" />
              </div>
              <p className="text-2xl font-display font-bold text-foreground mb-2">¡PRODUCTO AGOTADO!</p>
              <p className="text-sm text-muted-foreground">Lo sentimos, actualmente no contamos con stock por esta zona/categoría. Vuelve pronto para ver novedades.</p>
              <button 
                onClick={() => toggleCategory("all")}
                className="btn-primary mt-8 px-8 text-xs uppercase tracking-widest"
              >
                Ver otros productos
              </button>
            </motion.div>
          ) : (
            <motion.div
              layout
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 }
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
}
