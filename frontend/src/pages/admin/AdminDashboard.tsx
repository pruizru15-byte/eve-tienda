import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Package, MessageSquare, TrendingUp, Bell, Search, Settings, ArrowRight, UserPlus, Mail, X, Clock } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bellOpen, setBellOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/admin/stats", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
        const data = await response.json();
        setStats(data.stats);
        setActivities(data.activities || []);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header Dashboard */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-black">Resumen General</h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
              <span>Panel de Control</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group hidden md:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                placeholder="Buscar en el panel..." 
                className="input w-full pl-10 bg-secondary/50 h-10 border-transparent focus:bg-background"
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setBellOpen(!bellOpen)}
                className={`p-3 rounded-xl transition-all relative ${bellOpen ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'bg-secondary/50 hover:bg-secondary text-muted-foreground'}`}
              >
                 <Bell className="w-5 h-5" />
                 {activities.length > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 border-2 border-background rounded-full animate-pulse" />}
              </button>

              <AnimatePresence>
                {bellOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setBellOpen(false)}
                      className="fixed inset-0 z-40"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-80 z-50 card p-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
                    >
                      <div className="p-4 border-b border-border/20 bg-secondary/30 flex justify-between items-center">
                        <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Notificaciones</h4>
                        <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{activities.length} Nuevas</span>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {activities.length > 0 ? (
                          activities.map((activity) => (
                            <div key={activity.id} className="p-4 border-b border-border/10 hover:bg-secondary/40 transition-colors last:border-0 group cursor-pointer">
                              <div className="flex gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activity.type === 'user' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                  {activity.type === 'user' ? <UserPlus className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold leading-tight group-hover:text-primary transition-colors">{activity.title}</p>
                                  <p className="text-[10px] text-muted-foreground truncate italic mt-0.5">{activity.detail}</p>
                                  <p className="text-[9px] text-muted-foreground/50 mt-1">
                                    {formatDistanceToNow(new Date(activity.time), { addSuffix: true, locale: es })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-muted-foreground text-xs italic">
                            No hay notificaciones pendientes.
                          </div>
                        )}
                      </div>
                      <Link 
                        to="/admin/contact-center" 
                        onClick={() => setBellOpen(false)}
                        className="p-3 text-center block text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:bg-primary hover:text-white transition-all bg-secondary/20"
                      >
                        Ver todas las novedades
                      </Link>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-32 rounded-[24px] bg-secondary/30 animate-pulse" />
            ))
          ) : Array.isArray(stats) ? (
            stats.map((stat, i) => (
              <motion.div
                key={stat.label || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card p-6 relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">{stat.label}</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-display font-bold tracking-tight">{stat.value}</h3>
                  <div className={`p-2 rounded-lg bg-secondary text-primary`}>
                     <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-4 p-8 rounded-3xl bg-destructive/10 border border-destructive/20 text-destructive text-center">
              No se pudieron cargar las estadísticas. Verifica tus permisos como administrador.
            </div>
          )}
        </div>

        {/* Placeholder Areas for future modules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card p-8 h-[450px] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-display font-black">Actividad Reciente</h4>
                <Link to="/admin/users" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
                  Ver registros <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              
               <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                      Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-20 rounded-2xl bg-secondary/20 animate-pulse border border-border/10" />
                      ))
                    ) : activities.length > 0 ? (
                      activities.map((activity, idx) => (
                        <motion.div 
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center gap-4 p-5 rounded-2xl bg-secondary/40 border border-transparent hover:border-primary/20 hover:bg-secondary/60 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform ${
                            activity.type === 'user' ? 'bg-blue-500/10 text-blue-500' : 'bg-primary/10 text-primary'
                          }`}>
                             {activity.type === 'user' ? <UserPlus className="w-6 h-6" /> : <Mail className="w-6 h-6" />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between gap-2 mb-1">
                               <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{activity.title}</p>
                               <span className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-tighter bg-background/50 px-2 py-0.5 rounded-full border border-border/10">
                                 {formatDistanceToNow(new Date(activity.time), { addSuffix: true, locale: es })}
                               </span>
                             </div>
                             <p className="text-[11px] text-muted-foreground truncate leading-relaxed">
                               {activity.detail}
                             </p>
                          </div>
                          
                          <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-4 h-4 text-primary" />
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                          <Clock className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="italic text-xs font-medium uppercase tracking-widest opacity-50">Silencio total en el imperio</p>
                      </div>
                    )}
                  </AnimatePresence>
               </div>
            </div> 
            
            <div className="card p-8 h-[400px] flex flex-col">
               <h4 className="text-xl font-display font-black mb-6">Accesos Rápidos</h4>
               <div className="grid grid-cols-2 gap-4 flex-1">
                  {[
                    { icon: Package, label: 'Prod.', color: 'emerald', href: '/admin/products' },
                    { icon: MessageSquare, label: 'Msj.', color: 'amber', href: '/admin/contact-center' },
                    { icon: Settings, label: 'Conf.', color: 'blue', href: '/admin/settings' },
                    { icon: Users, label: 'User', color: 'rose', href: '/admin/users' }
                  ].map(item => (
                     <Link 
                       key={item.label} 
                       to={item.href}
                       className="card flex flex-col items-center justify-center gap-2 bg-secondary/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20 transition-all group p-4"
                     >
                        <item.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground">{item.label}</span>
                     </Link>
                  ))}
               </div>
            </div>
        </div>
      </main>
    </div>
  );
}
