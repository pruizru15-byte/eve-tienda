import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Search, Menu, X, User, MapPin, ChevronDown, Package, Bell, Heart, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";


export default function Navbar() {
  const { totalItems, setIsOpen, justAdded } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [locModalOpen, setLocModalOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [locationName, setLocationName] = useState("Buenos Aires");
  const [user, setUser] = useState<any>(null);
  const [previousLocations, setPreviousLocations] = useState<any[]>([]);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const location = useLocation();

  const notifications = [
    { id: 1, type: "promo", title: "¡Oferta Relámpago!", text: "50% OFF en Monitores Pro solo por hoy.", time: "Hace 5 min", unread: true, href: "/#ofertas" },
    { id: 2, type: "new", title: "Nuevo Ingreso: Titan RTX", text: "Llegó la nueva tarjeta gráfica más potente.", time: "Hace 1 hora", unread: true, href: "/productos" },
    { id: 3, type: "alert", title: "Tu pedido está cerca", text: "El mouse que compraste llegará en 2 horas.", time: "Hace 3 horas", unread: false, href: "/perfil" },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const [dbCategories, setDbCategories] = useState<any[]>([]);

  const navLinks = [
    { label: "Producto", href: "/productos" },
    { label: "Ofertas", href: "/#ofertas" },
    ...(user ? [{ label: "Historial", href: "/perfil" }] : []),
    { label: "Servicios", href: "/servicios" },
    { label: "Contacto", href: "/contacto" },
    { label: "Ayuda", href: "/ayuda" },
    { label: "Foro", href: "/foro" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    
    // Check for user in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    (window as any).dispatchNavbarLocationModal = () => setLocModalOpen(true);
    return () => { delete (window as any).dispatchNavbarLocationModal; };
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/categories');
        if (res.ok) {
          const data = await res.json();
          setDbCategories(data);
        }
      } catch (err) {
        console.error("Error fetching categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const userId = storedUser ? JSON.parse(storedUser).id : null;
        const res = await fetch(`http://localhost:3000/api/locations${userId ? `?user_id=${userId}` : ''}`);
        if (!res.ok) return;
        const data = await res.json();
        setPreviousLocations(data);
        if (data.length > 0) {
          setLocationName(data[0].name);
        }
      } catch (err) {
        console.error("Error fetching locations", err);
      }
    };
    fetchLocations();
  }, [user]);

  const handleSaveLocation = async (locData: any) => {
    try {
      const storedUser = localStorage.getItem("user");
      const userId = storedUser ? JSON.parse(storedUser).id : null;
      await fetch('http://localhost:3000/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...locData, user_id: userId })
      });
      // Refresh list
      const res = await fetch(`http://localhost:3000/api/locations${userId ? `?user_id=${userId}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setPreviousLocations(data);
      }
    } catch (err) {
      console.error("Error saving location", err);
    }
  };

  const useCurrentLocation = () => {
    setLoadingLoc(true);
    if (!navigator.geolocation) {
      alert("Geolocalización no soportada");
      setLoadingLoc(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        const address = data.address;
        const province = address.state || address.province || "";
        const region = address.city || address.town || address.village || address.suburb || "";
        const country = address.country || "";
        
        const name = `${province}${region ? `, ${region}` : ''}${country ? `, ${country}` : ''}`;
        
        setLocationName(name);
        await handleSaveLocation({ name, province, region, country });
        setLocModalOpen(false);
      } catch (err) {
        console.error("Error reverse geocoding", err);
      } finally {
        setLoadingLoc(false);
      }
    }, (err) => {
      console.error(err);
      setLoadingLoc(false);
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.reload();
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-border/50 ${
        scrolled ? "bg-background/95 backdrop-blur-md shadow-lg" : "bg-background"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        {/* Top Level: Logo & Search */}
        <div className="h-16 flex items-center gap-8 md:gap-12">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
              N
            </div>
            <span className="hidden lg:block font-display font-bold text-2xl tracking-tight">
              Nova<span className="text-primary">Tech</span>
            </span>
          </Link>

          {/* Large Search Bar */}
          <div className="flex-1 max-w-2xl relative group hidden md:block">
            <input 
              type="text" 
              placeholder="Buscar productos, marcas y más..."
              className="w-full pl-6 pr-14 py-2.5 rounded-lg bg-secondary/50 border border-border focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm placeholder:text-muted-foreground/60"
            />
            <button className="absolute right-0 top-0 bottom-0 px-4 border-l border-border text-muted-foreground hover:text-primary transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Promo/Ad area (Simplified) */}
          <div className="hidden xl:flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-[10px] font-bold uppercase tracking-widest text-primary">
            <Package className="w-4 h-4" />
            <span>Envío Gratis en compras +$99</span>
          </div>

          {/* Theme Toggle & Mobile Menu Btn */}
          <div className="flex items-center gap-2 md:hidden ml-auto">
             <ThemeToggle />
             <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-muted-foreground">
                {mobileOpen ? <X /> : <Menu />}
             </button>
          </div>
        </div>

        {/* Bottom Level: Nav & User Info */}
        <div className="h-12 hidden md:flex items-center justify-between border-t border-border/20 pt-1 pb-2">
          {/* Location Area */}
          <button 
            onClick={() => setLocModalOpen(true)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <MapPin className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            <div className="text-left leading-none">
              <p className="text-[9px] uppercase font-bold tracking-widest opacity-60">Enviar a</p>
              <p className="text-[11px] font-bold">{locationName} <ChevronDown className="inline w-3 h-3" /></p>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6 relative">
            {navLinks.map((link) => (
              <Link 
                key={link.label} 
                to={link.href}
                className="text-[12px] font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
            
            <button 
              onMouseEnter={() => setCatOpen(true)}
              onClick={() => setCatOpen(!catOpen)}
              className="text-[12px] font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap flex items-center gap-1"
            >
              Explorar <ChevronDown className={`w-3 h-3 transition-transform ${catOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Mega Dropdown */}
            <AnimatePresence>
              {catOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onMouseLeave={() => setCatOpen(false)}
                  className="absolute top-full left-0 mt-2 w-[550px] glass border border-border/50 rounded-2xl shadow-2xl p-6 z-[60]"
                >
                  <div className="grid grid-cols-3 gap-6">
                    {dbCategories.map((cat) => (
                      <Link 
                        key={cat.id} 
                        to={`/productos?category=${cat.id}`} 
                        onClick={() => setCatOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all group"
                      >
                         <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors uppercase font-bold text-[10px]">
                            {cat.name.substring(0, 2)}
                         </div>
                         <span className="text-[13px] font-bold text-muted-foreground group-hover:text-foreground transition-all">
                           {cat.name}
                         </span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>

          {/* User Links & Actions */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-4 text-[12px] font-medium text-muted-foreground border-r border-border pr-5">
              {!user ? (
                <>
                  <Link to="/auth" className="hover:text-primary transition-colors">Crea tu cuenta</Link>
                  <Link to="/auth" className="hover:text-primary transition-colors">Ingresa</Link>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to={user.role === "ADMIN" ? "/admin" : "/perfil"} className="flex items-center gap-2 group">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="group-hover:text-primary transition-colors max-w-[80px] truncate">{user.name}</span>
                  </Link>
                  <button onClick={handleLogout} className="text-rose-500 hover:text-rose-600 font-bold text-[10px] uppercase tracking-widest transition-colors">Cerrar Sesión</button>
                </div>
              )}
              <Link to="/perfil" className="hover:text-primary transition-colors">Mis compras</Link>
            </div>

            <div className="flex items-center gap-3 relative">
              <ThemeToggle />
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/5 rounded-xl relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    onMouseLeave={() => setNotifOpen(false)}
                    className="absolute top-full right-0 mt-2 w-[320px] glass border border-border/50 rounded-2xl shadow-2xl p-4 z-[60]"
                  >
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-border/20">
                      <h4 className="text-sm font-bold uppercase tracking-widest">Notificaciones</h4>
                      <span className="text-[10px] text-primary font-bold">{unreadCount} nuevas</span>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {notifications.map((n) => (
                        <Link 
                          key={n.id} 
                          to={n.href} 
                          onClick={() => setNotifOpen(false)}
                          className={`flex gap-3 p-3 rounded-xl border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all text-left relative overflow-hidden ${n.unread ? "bg-primary/5" : ""}`}
                        >
                           {n.unread && <div className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-bl-lg" />}
                           <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${n.type === "promo" ? "bg-amber-500/10 text-amber-500" : n.type === "new" ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"}`}>
                              {n.type === "promo" ? <Zap className="w-4 h-4" /> : n.type === "new" ? <Package className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold leading-tight line-clamp-1">{n.title}</p>
                              <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{n.text}</p>
                              <p className="text-[9px] text-muted-foreground/60 mt-1 uppercase font-bold">{n.time}</p>
                           </div>
                        </Link>
                      ))}
                    </div>
                    <Link to="/perfil" className="block text-center pt-4 text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">
                       Ver todas las notificaciones
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
              <button className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/5 rounded-xl">
                <Heart className="w-5 h-5" />
              </button>
              
              {/* Cart Button */}
              <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all relative"
              >
                <motion.div
                  animate={justAdded ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <ShoppingCart className="w-5 h-5" />
                </motion.div>
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-bold shadow-lg"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl"
          >
            <div className="p-6 space-y-6">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                 <input placeholder="Buscar productos..." className="w-full pl-10 pr-4 py-3 bg-secondary rounded-xl text-sm" />
               </div>
               <nav className="flex flex-col gap-4">
                 {navLinks.map(l => <Link key={l.label} to={l.href} className="text-sm font-bold text-muted-foreground">{l.label}</Link>)}
               </nav>
               <div className="pt-6 border-t border-border flex flex-col gap-4">
                 <Link to="/auth" className="p-3 text-center rounded-xl bg-primary text-primary-foreground font-bold">Ingresa</Link>
                 <Link to="/auth" className="p-3 text-center rounded-xl border border-border font-bold">Crea tu cuenta</Link>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Location Modal */}
      <AnimatePresence>
        {locModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLocModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative w-full max-w-md glass rounded-[32px] border border-primary/20 shadow-2xl p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-display font-bold">Elige dónde recibir tus compras</h3>
                <button onClick={() => setLocModalOpen(false)} className="p-2 rounded-xl hover:bg-secondary transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">Podrás ver costos y tiempos de entrega precisos en todo lo que busques.</p>
                
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Ingresa un código postal o ciudad"
                    className="w-full pl-4 pr-12 py-3 bg-secondary rounded-xl border border-transparent focus:border-primary outline-none transition-all"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setLocationName((e.target as HTMLInputElement).value);
                        setLocModalOpen(false);
                      }
                    }}
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-primary font-bold text-xs uppercase">
                    Usar
                  </button>
                </div>

                <div className="pt-2">
                   <button 
                    onClick={useCurrentLocation}
                    disabled={loadingLoc}
                    className="w-full py-3 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                   >
                     {loadingLoc ? (
                       <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                     ) : (
                       <MapPin className="w-4 h-4" />
                     )}
                     {loadingLoc ? "Obteniendo..." : "Usar mi ubicación actual"}
                   </button>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Tus direcciones guardadas</p>
                  <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {previousLocations.length > 0 ? (
                      previousLocations.map((loc) => (
                        <button 
                          key={loc.id}
                          onClick={() => {
                              setLocationName(loc.name);
                              setLocModalOpen(false);
                          }}
                          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary border border-transparent hover:border-primary/20 transition-all text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground">
                              <MapPin className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate">{loc.name}</p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{loc.province || loc.country}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic text-center py-4">No tienes ubicaciones guardadas</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
