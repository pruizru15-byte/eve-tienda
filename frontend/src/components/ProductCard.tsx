import { forwardRef } from "react";
import { Star, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { Product } from "@/domain/types";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product | any;
  index?: number;
}

const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(({ product, index = 0 }, ref) => {
  const { addToCart, justAdded } = useCart();
  const isJustAdded = justAdded === product.id;

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="card p-0 group overflow-hidden transition-shadow hover:shadow-xl hover:shadow-primary/5"
    >
      <Link to={`/producto/${product.id}`} className="block relative overflow-hidden aspect-square bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            {product.badge}
          </span>
        )}
      </Link>

      <div className="p-6">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
          {typeof product.category === "string" ? product.category : product.category?.name || "Uncategorized"}
        </p>
        <Link to={`/producto/${product.id}`}>
          <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1 pb-1">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mt-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < Math.floor(product.rating)
                  ? "fill-primary text-primary"
                  : "fill-border text-border"
              }`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({product.reviews})</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-foreground">${product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-xs font-bold text-muted-foreground line-through opacity-50">
                ${product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className={`btn p-3 shadow-md transition-all duration-300 relative overflow-hidden ${
              isJustAdded
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-primary text-primary-foreground shadow-primary/20 hover:scale-105"
            }`}
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              <ShoppingCart className="w-4 h-4" />
            </motion.div>
          </button>
        </div>
      </div>
    </motion.div>
  );
});

export default ProductCard;
