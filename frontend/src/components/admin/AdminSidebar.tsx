import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Grid, 
  Package, 
  Tag, 
  Wrench, 
  Zap, 
  Settings, 
  Users, 
  MessageSquare,
  HelpCircle,
  LogOut,
  Layers,
  Sparkles,
  Award,
  ShoppingCart,
  User
} from "lucide-react";
import { motion } from "framer-motion";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: ShoppingCart, label: "Ventas / Pedidos", href: "/admin/orders" },
  { icon: Grid, label: "Categorías", href: "/admin/categories" },
  { icon: Package, label: "Productos", href: "/admin/products" },
  { icon: Layers, label: "Ecosistemas", href: "/admin/bundles" },
  { icon: Sparkles, label: "Escaparate", href: "/admin/featured-categories" },
  { icon: Award, label: "Vanguardia", href: "/admin/vanguard" },
  { icon: Tag, label: "Promociones", href: "/admin/promotions" },
  { icon: Wrench, label: "Servicios", href: "/admin/services" },
  { icon: Zap, label: "Ofertas", href: "/admin/offers" },
  { icon: Sparkles, label: "Cosas Tentadoras", href: "/admin/tempting-offers" },
  { icon: Settings, label: "Ajustes Empresa", href: "/admin/settings" },
  { icon: LayoutDashboard, label: "Hero Banner", href: "/admin/hero-settings" },
  { icon: MessageSquare, label: "Centro de Contacto", href: "/admin/contact-center" },
  { icon: Users, label: "Usuarios", href: "/admin/users" },
  { icon: HelpCircle, label: "Centro de Ayuda", href: "/admin/help" },
];

export default function AdminSidebar() {
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/auth";
  };

  return (
    <aside className="w-68 h-screen bg-background border-r border-border/50 flex flex-col sticky top-0 overflow-hidden">
      {/* Header - Estático */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            N
          </div>
          <span className="font-display font-bold text-lg">Nova<span className="text-primary">Admin</span></span>
        </div>
      </div>

      {/* Navegación - Scrollable */}
      <nav className="flex-1 overflow-y-auto px-6 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative ${
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer - Estático */}
      <div className="p-6 border-t border-border/50 bg-background/50 backdrop-blur-sm">
        <Link 
          to="/admin/profile"
          className={`flex items-center gap-3 px-4 py-4 rounded-xl mb-2 transition-all group ${
            location.pathname === "/admin/profile" 
              ? "bg-primary/10 text-primary border border-primary/20" 
              : "hover:bg-secondary text-foreground"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {userData.name?.charAt(0) || "A"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold truncate uppercase tracking-tighter">{userData.name || "Administrador"}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-black opacity-50 tracking-widest">Ver Perfil</span>
          </div>
        </Link>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-all uppercase tracking-widest text-[10px]"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
