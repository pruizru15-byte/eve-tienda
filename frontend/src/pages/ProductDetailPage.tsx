import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Star, ShoppingCart, ArrowLeft, Check, Truck, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<any[]>([]);
  const { addToCart, justAdded } = useCart();
  const [qty, setQty] = useState(1);
  const [hoverRating, setHoverRating] = useState(0);

  const handleRate = async (val: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Debes iniciar sesión para calificar este producto");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/public/products/${product.id}/rate`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ rating: val })
      });
      if (response.ok) {
        const data = await response.json();
        setProduct((prev: any) => ({ ...prev, rating: data.rating, reviews: data.reviews }));
        toast.success("¡Gracias por calificar!");
      } else if (response.status === 401) {
        toast.error("Tu sesión ha expirado, por favor vuelve a logearte");
      }
    } catch (error) {
      toast.error("No se pudo guardar tu calificación");
    }
  };

  useEffect(() => {
    setLoading(true);
    // Fetch product detail
    fetch(`http://localhost:3000/api/public/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
        // Fetch related products (simple implementation)
        fetch(`http://localhost:3000/api/public/products?categoryId=${data.categoryId}&limit=5`)
          .then(res => res.json())
          .then(dataList => setRelated(dataList.filter((p: any) => p.id !== id).slice(0, 4)));
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!product && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
          <p className="text-2xl font-display font-bold text-muted-foreground">Producto no encontrado</p>
          <Link to="/productos" className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold">
            Volver al catálogo
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isAdded = justAdded === product?.id;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Link to="/productos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Volver al catálogo
          </Link>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2, delayChildren: 0.1 }
              }
            }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, x: -30, scale: 0.95 },
                visible: {
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
                }
              }}
              whileHover={{ y: -10 }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-card border border-border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10"
            >
              <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
              {product.badge && (
                <span className="absolute top-4 left-4 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-lg">
                  {product.badge}
                </span>
              )}
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, x: 30 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
              }}
            >
              <p className="text-sm text-primary uppercase tracking-wider mb-2">{product.category}</p>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">{product.name}</h1>

              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1 group/stars">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      onClick={() => handleRate(i)}
                      onMouseEnter={() => setHoverRating(i)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-125"
                    >
                      <Star 
                        className={`w-6 h-6 transition-colors ${
                          i <= (hoverRating || Math.floor(product.rating)) 
                            ? "fill-primary text-primary" 
                            : "fill-muted text-muted"
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <span className="text-sm font-bold text-foreground ml-2">
                  {product.rating.toFixed(1)}
                  <span className="text-muted-foreground font-normal ml-1">({product.reviews} reseñas)</span>
                </span>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-display font-bold text-foreground">${product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">${product.originalPrice.toLocaleString()}</span>
                )}
                {product.originalPrice && (
                  <span className="px-2 py-0.5 rounded-md bg-destructive/10 text-destructive text-sm font-semibold">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </span>
                )}
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${product.stock > product.minStockAlert ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : product.stock > 0 ? "bg-amber-500 animate-pulse" : "bg-rose-500"}`} />
                  <span className="text-sm font-bold uppercase tracking-wider">
                    {product.stock > 0 ? `Stock disponible: ${product.stock} unidades` : "Agotado Temporalmente"}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] uppercase font-bold text-primary mb-1">Precio Unitario</p>
                    <p className="text-xl font-bold">${(product.unitPrice || product.price).toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary border border-border">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Precio por Mayor</p>
                    <p className="text-xl font-bold">${(product.wholesalePrice || product.price * 0.9).toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground mt-1">* A partir de 10 unidades</p>
                  </div>
                </div>
              </div>

              {product.specs && (
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {product.specs.map((spec) => (
                    <div key={spec} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-foreground">{spec}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center bg-card border border-border rounded-lg">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 text-muted-foreground hover:text-foreground transition-colors">-</button>
                  <span className="px-4 py-3 font-semibold min-w-[3rem] text-center">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="px-4 py-3 text-muted-foreground hover:text-foreground transition-colors">+</button>
                </div>
                <button
                  onClick={() => {
                    for (let i = 0; i < qty; i++) addToCart(product);
                  }}
                  className={`flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-lg font-semibold transition-all duration-300 ${
                    isAdded
                      ? "bg-green-500/20 text-green-400"
                      : "bg-primary text-primary-foreground hover:opacity-90"
                  }`}
                >
                  <ShoppingCart className={`w-5 h-5 ${isAdded ? "animate-cart-bounce" : ""}`} />
                  {isAdded ? "¡Agregado!" : "Agregar al carrito"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                  <Truck className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Envío gratis</p>
                    <p className="text-xs text-muted-foreground">2-3 días hábiles</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Garantía</p>
                    <p className="text-xs text-muted-foreground">3 años incluida</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {related.length > 0 && (
            <div className="mt-24">
              <h2 className="text-2xl font-display font-bold mb-8">Productos <span className="text-gradient">relacionados</span></h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
