import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  MessageSquare, 
  Bell, 
  Settings, 
  LogOut, 
  Star, 
  Clock, 
  Package, 
  CreditCard,
  Target,
  ShieldCheck,
  Zap,
  Lock,
  Mail,
  ArrowRight,
  ExternalLink,
  Plus,
  Calendar,
  ChevronDown
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileCalendar from "@/components/ProfileCalendar";
import OrderReceipt from "@/components/OrderReceipt";

type Tab = "overview" | "orders" | "profile" | "forum" | "notifications" | "support";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [comments, setComments] = useState<any>({ topics: [], comments: [] });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [locModalOpen, setLocModalOpen] = useState(false);
  const [locationName, setLocationName] = useState("No establecida");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      fetchData(token);
    } else {
      navigate("/auth");
    }
  }, []);

  const fetchData = async (token: string) => {
    try {
      setLoading(true);
      // Fetch orders
      const ordersRes = await fetch("http://localhost:3000/api/public/orders/my-orders", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (ordersRes.ok) setOrders(await ordersRes.json());

      // Fetch activity
      const forumRes = await fetch("http://localhost:3000/api/forum/my-activity", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (forumRes.ok) setComments(await forumRes.json());
      
      // Fetch notifications
      const notifRes = await fetch("http://localhost:3000/api/notifications/my-notifications", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (notifRes.ok) setNotifications(await notifRes.json());
 
      // Fetch support messages
      const msgRes = await fetch("http://localhost:3000/api/auth/messages", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (msgRes.ok) setSupportMessages(await msgRes.json());

      // Fetch location
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const locRes = await fetch(`http://localhost:3000/api/locations?user_id=${storedUser.id}`);
      if (locRes.ok) {
        const locs = await locRes.json();
        if (locs.length > 0) setLocationName(locs[0].name);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    try {
      const res = await fetch("http://localhost:3000/api/auth/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const result = await res.json();
        localStorage.setItem("user", JSON.stringify(result.user));
        setUser(result.user);
        setIsEditing(false);
        toast.success("Perfil actualizado");
      }
    } catch (error) {
      toast.error("Error al actualizar");
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/change-password", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ 
          currentPassword: data.currentPassword,
          newPassword: data.newPassword 
        })
      });
      if (res.ok) {
        setIsChangingPass(false);
        toast.success("Contraseña actualizada");
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al cambiar contraseña");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("http://localhost:3000/api/auth/avatar", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });
      if (res.ok) {
        const result = await res.json();
        localStorage.setItem("user", JSON.stringify(result.user));
        setUser(result.user);
        toast.success("¡Foto actualizada, panzón!");
      }
    } catch (error) {
      toast.error("Error al subir imagen");
    }
  };

  const userData = {
    name: user?.name || "Cargando...",
    username: user?.email ? `@${user.email.split('@')[0]}` : "@usuario",
    role: user?.role === "ADMIN" ? "Administrador Nova" : "Cliente Nova",
    location: locationName,
    joinDate: "Usuario Activo",
    stats: [
      { label: "Compras", value: (orders?.length || 0).toString(), icon: ShoppingBag, color: "text-blue-400" },
      { 
        label: "Aportes", 
        value: ((comments?.topics?.length || 0) + (comments?.comments?.length || 0)).toString(), 
        icon: MessageSquare, 
        color: "text-purple-400" 
      },
      { label: "Nivel", value: "92", icon: Target, color: "text-rose-400" },
    ]
  };

  const sidebarLinks: { id: string, label: string, icon: any, href?: string }[] = [
    { id: "overview", label: "Dashboard", icon: Zap },
    ...(user?.role === "ADMIN" ? [{ id: "admin", label: "Panel Admin", icon: ShieldCheck, href: "/admin" }] : []),
    { id: "orders", label: "Mis Compras", icon: ShoppingBag },
    { id: "profile", label: "Mi Información", icon: User },
    { id: "notifications", label: "Notificaciones", icon: Bell },
    { id: "support", label: "Mis Consultas", icon: Mail },
    { id: "forum", label: "Mis Comentarios", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <motion.aside 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-80 space-y-6"
          >
            <div className="card bg-primary/5 text-center relative overflow-hidden group p-8">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-3xl rounded-full" />
              
              <div className="relative z-10">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent p-[2px] mx-auto mb-6 group-hover:scale-105 transition-transform relative">
                  <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center text-3xl font-bold overflow-hidden">
                    {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        userData.name.split(" ").map(n => n[0]).join("")
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-xl cursor-pointer hover:scale-110 transition-all shadow-lg">
                      <Zap className="w-3 h-3" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                  </label>
                </div>
                <h2 className="text-xl font-display font-bold mb-1">{userData.name}</h2>
                <p className="text-primary text-[10px] font-bold uppercase tracking-[3px] mb-4">{userData.role}</p>
                
                <div className="flex justify-center gap-3">
                  <button 
                    onClick={() => setActiveTab("notifications")}
                    className={`p-2 rounded-xl transition-all ${activeTab === "notifications" ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/20"}`}
                  >
                    <Bell className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setActiveTab("profile")}
                    className={`p-2 rounded-xl transition-all ${activeTab === "profile" ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/20"}`}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button onClick={() => { localStorage.clear(); navigate("/auth"); }} className="p-2 rounded-xl bg-secondary hover:bg-rose-500/20 transition-all text-muted-foreground hover:text-rose-500">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <nav className="card p-4 space-y-2">
              {sidebarLinks.map((link) => {
                const isTab = !link.href;
                const active = isTab ? activeTab === link.id : false;
                const CommonContent = (
                  <>
                    <link.icon className={`w-5 h-5 ${active ? "" : "group-hover:text-primary transition-colors"}`} />
                    <span className="text-sm uppercase tracking-widest">{link.label}</span>
                  </>
                );
                const className = `w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${
                  active 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-bold" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent hover:border-primary/10"
                }`;

                if (link.href) {
                  return (
                    <Link key={link.id} to={link.href} className={className}>
                      {CommonContent}
                    </Link>
                  );
                }

                return (
                  <button
                    key={link.id}
                    onClick={() => {
                        if (link.id === "logout") {
                          localStorage.clear();
                          navigate("/auth");
                          return;
                        }
                        setActiveTab(link.id as Tab);
                    }}
                    className={className}
                  >
                    {CommonContent}
                  </button>
                );
              })}
            </nav>
          </motion.aside>

          {/* Main Content Area */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 space-y-8"
          >
            <AnimatePresence mode="wait">
              {/* Dashboard Overview */}
              {activeTab === "overview" && (
                <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {userData.stats.map((stat) => (
                      <div key={stat.label} className="card hover:border-primary/30 group p-6">
                        <stat.icon className={`w-6 h-6 mb-4 ${stat.color} group-hover:scale-110 transition-transform`} />
                        <p className="text-2xl font-display font-bold">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Logistical Calendar */}
                      <div className="xl:col-span-2 card p-8 space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                              <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                               <h3 className="font-display font-bold text-lg">Logística y Entregas</h3>
                               <p className="text-xs text-muted-foreground">Revisa las fechas clave de tus proyectos</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowCalendar(!showCalendar)}
                            className="btn-secondary px-6 uppercase tracking-widest text-[10px] font-bold flex items-center gap-2"
                          >
                            {showCalendar ? "Ocultar" : "Desplegar Calendario"}
                            <ChevronDown className={`w-4 h-4 transition-transform ${showCalendar ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                        <AnimatePresence>
                          {showCalendar && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-6 border-t border-border/50">
                                <ProfileCalendar />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Recent Order Preview */}
                      {orders.length > 0 && (
                        <div className="card p-8">
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="font-display font-bold text-lg">Última Compra</h3>
                            <CreditCard className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-border">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                              <Package className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-bold text-sm">Pedido #{orders[0].id.split('-')[0]}</p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">${orders[0].total}</p>
                            </div>
                            <div className="ml-auto text-right">
                              <p className="font-bold text-sm text-green-400">{orders[0].status}</p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                  {new Date(orders[0].created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Forum Shortcut */}
                      <div className="card flex flex-col justify-center items-center text-center gap-4 p-8">
                          <MessageSquare className="w-10 h-10 text-primary" />
                          <div>
                              <h3 className="font-display font-bold text-lg">Comunidad Nova</h3>
                              <p className="text-xs text-muted-foreground">Únete a la conversación en el foro general</p>
                          </div>
                          <Link to="/foro" className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-widest">
                              Ir al Foro General
                          </Link>
                      </div>
                    </div>
                  </motion.div>
                )}

              {/* Order History */}
              {activeTab === "orders" && (
                <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <h3 className="text-2xl font-display font-bold mb-6">Historial de Compras</h3>
                  <div className="space-y-4">
                    {orders.length > 0 ? orders.map((order, i) => (
                      <motion.div 
                        key={order.id} 
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                        className="card flex flex-col md:flex-row items-center gap-6 hover:border-primary/30 hover:-translate-y-1 transition-all p-6"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                          <Package className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                              ID: #{order.id.split('-')[0]} • {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          <h4 className="font-display font-bold text-lg">Pedido de Tecnología</h4>
                          <span className={`inline-block px-3 py-1 mt-2 text-[10px] font-bold uppercase rounded-md ${
                              order.status === "DELIVERED" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-center md:text-right">
                          <p className="text-2xl font-display font-bold mb-1">${order.total}</p>
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="text-xs text-primary font-bold uppercase hover:underline"
                          >
                            Ver Recibo
                          </button>
                        </div>
                      </motion.div>
                    )) : (
                        <div className="card text-center py-20 border-dashed border-border">
                            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <p className="text-muted-foreground font-bold uppercase tracking-widest">Aún no has realizado compras</p>
                        </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Profile Information */}
              {activeTab === "profile" && (
                <motion.div key="profile" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="card p-10">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-display font-bold">Información Personal</h3>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsChangingPass(!isChangingPass)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isChangingPass ? "bg-rose-500 text-white" : "bg-secondary hover:bg-primary hover:text-white"}`}
                        >
                            <Lock className="w-3 h-3 inline mr-2" /> {isChangingPass ? "Cancelar" : "Cambiar Contraseña"}
                        </button>
                        <button 
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isEditing ? "bg-amber-500 text-white" : "bg-secondary hover:bg-primary hover:text-white"}`}
                        >
                            {isEditing ? "Cancelar" : "Editar Datos"}
                        </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-8">
                      {isEditing ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Nombre Completo</label>
                                <input name="name" defaultValue={user?.name} className="w-full px-6 py-4 rounded-2xl bg-secondary/30 border border-border focus:border-primary outline-none transition-all font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email</label>
                                <input name="email" defaultValue={user?.email} className="w-full px-6 py-4 rounded-2xl bg-secondary/30 border border-border focus:border-primary outline-none transition-all font-bold" />
                            </div>
                            <button type="submit" className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20">
                                Guardar Perfil
                            </button>
                        </form>
                      ) : (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Nombre Completo</label>
                                <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-secondary/30 border border-border">
                                    <User className="w-4 h-4 text-primary" />
                                    <span className="font-bold">{user?.name}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Corporativo</label>
                                <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-secondary/30 border border-border">
                                    <Mail className="w-4 h-4 text-primary" />
                                    <span className="font-bold">{user?.email}</span>
                                </div>
                            </div>
                        </div>
                      )}

                      {isChangingPass && (
                        <form onSubmit={handleChangePassword} className="space-y-6 pt-6 border-t border-border/50">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-primary">Seguridad de la Cuenta</h4>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Contraseña Actual</label>
                                <input type="password" name="currentPassword" required className="w-full px-6 py-4 rounded-2xl bg-secondary/30 border border-border focus:border-primary outline-none transition-all font-bold" />
                            </div>
                            <div className="space-y-2 border-l-2 border-primary/20 pl-4">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Nueva Contraseña</label>
                                <input type="password" name="newPassword" required className="w-full px-6 py-4 rounded-2xl bg-secondary/30 border border-border focus:border-primary outline-none transition-all font-bold" />
                            </div>
                            <div className="space-y-2 border-l-2 border-primary/20 pl-4">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Confirmar Nueva</label>
                                <input type="password" name="confirmPassword" required className="w-full px-6 py-4 rounded-2xl bg-secondary/30 border border-border focus:border-primary outline-none transition-all font-bold" />
                            </div>
                            <button type="submit" className="w-full py-4 rounded-2xl bg-accent text-white font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-accent/20">
                                Actualizar Contraseña
                            </button>
                        </form>
                      )}
                    </div>

                    <div className="space-y-8">
                       <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Ubicación de Registro</label>
                        <div className="flex flex-col gap-4 p-6 rounded-3xl bg-secondary/30 border border-border">
                          <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-accent" />
                            <span className="font-bold text-lg">{locationName}</span>
                          </div>
                          <button 
                            onClick={() => (window as any).dispatchNavbarLocationModal?.()} 
                            className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline text-left inline-flex items-center gap-2"
                          >
                             Cambiar Ubicación <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Estado de la Cuenta</label>
                        <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-green-500/5 border border-green-500/20">
                          <ShieldCheck className="w-5 h-5 text-green-400" />
                          <div>
                            <p className="font-bold text-green-400">Verificado y Activo</p>
                            <p className="text-[9px] text-muted-foreground uppercase">Protección NovaShield Nivel 4</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-8 rounded-3xl bg-primary/5 border border-primary/20 relative overflow-hidden">
                        <Zap className="absolute -right-4 -bottom-4 w-24 h-24 text-primary/5 -rotate-12" />
                        <h4 className="font-bold mb-2">Soporte Prioritario</h4>
                        <p className="text-xs text-muted-foreground mb-4">Como usuario NovaTech, tienes acceso directo a nuestros ingenieros.</p>
                        <Link to="/contacto" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Contactar ahora</Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}


              {/* Forum Activity */}
              {activeTab === "forum" && (
                <motion.div key="forum" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-display font-bold">Mis Aportes en el Foro</h3>
                    <Link to="/foro" className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-secondary hover:bg-primary hover:text-white transition-all text-xs font-bold uppercase tracking-widest">
                        Ir al Foro General <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {(() => {
                      const allActivity = [
                        ...(comments.topics || []).map((t: any) => ({ ...t, type: 'TOPIC' })),
                        ...(comments.comments || []).map((c: any) => ({ ...c, type: 'COMMENT' }))
                      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                      return allActivity.length > 0 ? allActivity.map((activity: any, idx: number) => (
                        <div key={idx} className="card hover:border-primary/30 border-l-4 border-l-primary relative group p-8">
                          <Link to={`/foro?topic=${activity.type === 'TOPIC' ? activity.id : activity.topic_id}`} className="absolute top-8 right-8 p-2 rounded-xl bg-secondary group-hover:bg-primary group-hover:text-white transition-all">
                              <ExternalLink className="w-4 h-4" />
                          </Link>
                          
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${
                              activity.type === 'TOPIC' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            }`}>
                              {activity.type === 'TOPIC' ? 'Tema Iniciado' : 'Comentario'}
                            </span>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              {activity.type === 'TOPIC' ? activity.title : activity.topic?.title}
                            </p>
                          </div>

                          <p className="text-foreground/80 mb-6 italic leading-relaxed">
                            "{activity.type === 'TOPIC' ? (activity.content.length > 100 ? activity.content.substring(0, 100) + '...' : activity.content) : activity.content}"
                          </p>

                          <div className="flex items-center justify-between pt-4 border-t border-border/30 text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                             <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 fill-primary text-primary" /> {activity.reactions?.length || 0}</span>
                              {activity.type === 'TOPIC' && (
                                <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> {activity._count?.comments || 0}</span>
                              )}
                              <span>{new Date(activity.created_at).toLocaleDateString()}</span>
                             </div>
                             <Link to={`/foro?topic=${activity.type === 'TOPIC' ? activity.id : activity.topic_id}`} className="hover:text-primary transition-colors">Ver en el Foro</Link>
                          </div>
                        </div>
                      )) : (
                        <div className="card text-center py-20 border-dashed border-border">
                            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <p className="text-muted-foreground font-bold uppercase tracking-widest">No has realizado aportes aún</p>
                        </div>
                      );
                    })()}
                  </div>
                </motion.div>
              )}

              {/* Notifications Activity */}
              {activeTab === "notifications" && (
                <motion.div key="notifications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <h3 className="text-2xl font-display font-bold mb-6">Alertas del Sistema</h3>
                  <div className="space-y-4">
                    {notifications.length > 0 ? notifications.map((n, i) => (
                      <div 
                        key={n.id} 
                        onClick={async () => {
                            if (!n.is_read) {
                                await fetch(`http://localhost:3000/api/notifications/${n.id}/read`, {
                                    method: 'PATCH',
                                    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                                });
                                // Local update
                                setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, is_read: true } : notif));
                            }
                        }}
                        className={`card p-6 flex gap-4 items-center relative group cursor-pointer ${n.is_read ? 'border-border/50 opacity-80' : 'border-primary shadow-lg shadow-primary/10'}`}
                      >
                        {!n.is_read && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary animate-pulse" />}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            n.type === "success" ? "bg-green-500/10 text-green-500" : 
                            n.type === "alert" ? "bg-rose-500/10 text-rose-500" : 
                            "bg-blue-500/10 text-blue-500"
                        }`}>
                            {n.type === "success" ? <ShieldCheck className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                        </div>
                        <div>
                            <p className="font-bold">{n.title}</p>
                            <p className="text-xs text-muted-foreground">{n.message}</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest mt-1 opacity-60">
                                {new Date(n.created_at).toLocaleDateString()} • {new Date(n.created_at).toLocaleTimeString()}
                            </p>
                        </div>
                      </div>
                    )) : (
                        <div className="card text-center py-20 border-dashed border-border">
                            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <p className="text-muted-foreground font-bold uppercase tracking-widest">No tienes notificaciones nuevas</p>
                        </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Support Messages Activity */}
              {activeTab === "support" && (
                <motion.div key="support" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-display font-bold">Mis Consultas de Soporte</h3>
                    <Link to="/contacto" className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
                        Nueva Consulta <Plus className="w-4 h-4" />
                    </Link>
                  </div>
                  
                  <div className="space-y-4">
                    {supportMessages.length > 0 ? supportMessages.map((msg) => (
                      <div key={msg.id} className="card hover:border-primary/20 p-8">
                        <div className="flex justify-between items-start mb-6">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                 <Mail className="w-5 h-5" />
                              </div>
                              <div>
                                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Asunto</p>
                                 <h4 className="font-bold text-lg">{msg.subject || "Consulta de Soporte"}</h4>
                              </div>
                           </div>
                           <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter border ${
                              msg.status === 'REPLIED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                           }`}>
                              {msg.status === 'REPLIED' ? 'RESPONDIDO' : 'EN ESPERA'}
                           </span>
                        </div>

                        <div className="p-6 bg-secondary/20 rounded-3xl border border-border/30 mb-6 font-medium italic text-foreground/70">
                           "{msg.message}"
                        </div>

                        {msg.reply ? (
                           <div className="relative pt-6">
                              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                              <div className="p-6 md:p-8 rounded-[32px] bg-primary/5 border border-primary/20 relative group">
                                 <ShieldCheck className="absolute top-6 right-6 w-8 h-8 text-primary/10" />
                                 <p className="text-[10px] font-black uppercase text-primary mb-3 flex items-center gap-2">
                                    <Target className="w-3 h-3" /> Respuesta de Ingeniería NovaTech
                                 </p>
                                 <p className="text-sm leading-relaxed font-bold">
                                    {msg.reply}
                                 </p>
                                 {msg.replied_at && (
                                    <p className="text-[9px] font-bold text-muted-foreground mt-4 font-mono opacity-50">
                                       Recibido el {new Date(msg.replied_at).toLocaleString()}
                                    </p>
                                 )}
                              </div>
                           </div>
                        ) : (
                           <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-secondary/10 border border-border/50">
                              <Clock className="w-4 h-4 text-amber-500" />
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">Nuestros ingenieros revisarán tu consulta pronto.</p>
                           </div>
                        )}
                      </div>
                    )) : (
                        <div className="card text-center py-20 border-dashed border-border flex flex-col items-center gap-4">
                            <Mail className="w-16 h-16 text-muted-foreground opacity-10" />
                            <div className="space-y-1">
                               <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No hay consultas activas</p>
                               <p className="text-[10px] text-muted-foreground/60 italic">Tus mensajes al equipo de soporte aparecerán aquí.</p>
                            </div>
                            <Link to="/contacto" className="mt-4 px-8 py-3 rounded-2xl bg-secondary hover:bg-primary hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest border border-border">
                               Contactar Ingeniería
                            </Link>
                        </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.section>

        </div>
      </main>

      <Footer />

      <AnimatePresence>
        {selectedOrder && (
          <OrderReceipt 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}


