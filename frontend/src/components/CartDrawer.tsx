import { X, Plus, Minus, Trash2, ShoppingBag, CreditCard, Truck, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { AnimatePresence, motion } from "framer-motion";

interface OrderResponse {
  id: string;
  total: number;
  status: string;
  items: string;
  created_at: string;
}

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { settings } = useSettings();

  const FREE_SHIPPING_THRESHOLD = 500;
  const shippingProgress = Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remainingForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - totalPrice, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-card/95 backdrop-blur-2xl border-l border-border/50 z-[70] flex flex-col shadow-[0_-8px_30px_rgb(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-7 border-b border-border/50 bg-secondary/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl">Tu Carrito</h2>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {totalItems} {totalItems === 1 ? "Artículo" : "Artículos"} Seleccionados
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded-lg hover:bg-destructive/10"
                  >
                    Vaciar
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 rounded-xl hover:bg-secondary transition-all hover:rotate-90 duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-7 py-6 custom-scrollbar">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center relative"
                  >
                    <ShoppingBag className="w-10 h-10 text-muted-foreground/30" />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-primary/5 shadow-2xl"
                    />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-display font-bold mb-2">Tu cesta está vacía</h3>
                    <p className="text-muted-foreground text-sm max-w-[200px] mx-auto leading-relaxed">
                      Explora nuestras colecciones y añade lo mejor de la ingeniería a tu vida.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:glow-blue transition-all"
                  >
                    Ir a la tienda
                  </button>
                </div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.12 }
                    }
                  }}
                  className="space-y-5"
                >
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      variants={{
                        hidden: { opacity: 0, x: 20, y: 10 },
                        visible: { opacity: 1, x: 0, y: 0 }
                      }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      className="group flex gap-5 p-4 rounded-2xl bg-secondary/20 border border-border/30 hover:border-primary/30 hover:bg-secondary/40 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="relative aspect-square w-24 h-24 rounded-xl overflow-hidden bg-card border border-border/50 shrink-0">
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>

                      <div className="flex-1 flex flex-col min-w-0 py-1">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-bold text-foreground leading-tight truncate pr-4 group-hover:text-primary transition-colors">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1.5 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="mt-auto flex items-end justify-between">
                          <div className="space-y-1">
                            <span className="text-lg font-display font-bold text-primary">
                              ${item.product.price.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 bg-background/50 border border-border p-1 rounded-xl glass shadow-sm">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </motion.button>
                            <span className="text-sm font-bold w-7 text-center">{item.quantity}</span>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Footer / Summary */}
            {items.length > 0 && (
              <div className="p-7 space-y-5 bg-secondary/30 border-t border-border/50">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-base border-b border-border/50 pb-3">
                    <span className="font-display font-medium text-lg">Total Compra</span>
                    <div className="text-right">
                      <span className="text-3xl font-display font-bold text-primary block">
                        ${totalPrice.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Coordinar pago por WhatsApp</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      const user = JSON.parse(localStorage.getItem('user') || '{}');
                      const token = localStorage.getItem('token');
                      if (!user.id) {
                        window.location.href = '/auth';
                        return;
                      }

                      try {
                        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/public/orders`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({
                            items: items.map(i => ({
                              id: i.product.id,
                              name: i.product.name,
                              price: i.product.price,
                              quantity: i.quantity
                            })),
                            total: totalPrice
                          })
                        });

                        if (!response.ok) throw new Error('Error al crear pedido');
                        const order: OrderResponse = await response.json();

                        // Format WhatsApp Message
                        const message = encodeURIComponent(
                          `🚀 *NUEVO PEDIDO NOVATECH*\n\n` +
                          `👤 *Cliente:* ${user.name || 'Cliente'}\n` +
                          `📧 *Email:* ${user.email || 'N/A'}\n` +
                          `🆔 *Orden ID:* ${order.id.split('-')[0]}\n\n` +
                          `*DETALLE DEL PEDIDO:*\n` +
                          items.map(i => `- ${i.product.name} (x${i.quantity}) - $${(i.product.price * i.quantity).toLocaleString()}`).join('\n') +
                          `\n\n💰 *TOTAL:* $${totalPrice.toLocaleString()}\n\n` +
                          `Favor de confirmar disponibilidad para proceder con el pago.`
                        );

                        const whatsappNumber = settings?.whatsapp_main_number || "918389768"; // Reemplaza con número real del admin
                        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
                        clearCart();
                        setIsOpen(false);
                      } catch (error) {
                        console.error(error);
                        alert("Error al procesar el pedido. Intente de nuevo.");
                      }
                    }}
                    className="flex-1 py-4 rounded-2xl bg-green-600 text-white font-display font-bold flex items-center justify-center gap-3 group shadow-lg shadow-green-500/20 hover:bg-green-700 transition-all duration-300"
                  >
                    <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>SOLICITAR POR WHATSAPP</span>
                    <ArrowRight className="w-4 h-4 ml-1 translate-x-0 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <p className="text-[10px] text-center text-muted-foreground/60 font-medium">
                  Al hacer clic serás redirigido a WhatsApp para coordinar tu pago.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
