import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  Edit2, 
  Shield, 
  Mail, 
  User as UserIcon,
  ShoppingBag,
  Eye,
  Activity,
  Circle,
  MoreVertical,
  X,
  CreditCard,
  MessageSquare,
  History,
  TrendingUp,
  Globe,
  Plus,
  Save,
  Loader2,
  Lock,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  ShieldQuestion
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { toast } from "sonner";

type RoleTab = "USER" | "ADMIN";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalUsers: 0, onlineUsers: 0, totalSpent: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<RoleTab>("USER");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER"
  });

  const fetchData = async () => {
    try {
      const [userRes, statsRes] = await Promise.all([
        fetch("http://localhost:3000/api/admin/users", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        }),
        fetch("http://localhost:3000/api/admin/users/stats", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        })
      ]);
      const userData = await userRes.json();
      const statsData = await statsRes.json();
      if (Array.isArray(userData)) setUsers(userData);
      setStats(statsData);
    } catch (error) {
      toast.error("Error al sincronizar datos de población");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s live sync
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/users/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ is_active: isActive })
      });
      if (response.ok) {
        toast.info(isActive ? "Privilegios restaurados, panda" : "Cuenta suspendida");
        fetchData();
        if (selectedUser?.id === id) {
          setSelectedUser({ ...selectedUser, is_active: isActive });
        }
      }
    } catch (error) {
      toast.error("Error en la operación");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetch("http://localhost:3000/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({...formData, role: activeTab})
      });
      if (res.ok) {
        toast.success("Registrado. Correo de confirmación enviado.");
        setCreateModalOpen(false);
        setFormData({ name: "", email: "", password: "", role: activeTab });
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al crear usuario");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetch(`http://localhost:3000/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.role
        })
      });
      if (res.ok) {
        toast.success("Datos actualizados");
        setEditModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al actualizar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setIsProcessing(false);
    }
  };

  const isOnline = (lastActivity: string) => {
    if (!lastActivity) return false;
    const activityDate = new Date(lastActivity);
    const limit = new Date(Date.now() - 3 * 60 * 1000); // 3 min threshold
    return activityDate > limit;
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = u.role === activeTab;
    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const usersCount = users.filter(u => u.role === "USER").length;
  const adminsCount = users.filter(u => u.role === "ADMIN").length;

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-black flex items-center gap-3">
              Gestión de Población
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
              <span>Control Maestro de Ciudadanos</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setFormData({ ...formData, role: activeTab });
                setCreateModalOpen(true);
              }}
              className="btn-primary h-12 gap-2 border-none text-[10px] uppercase font-bold tracking-widest"
            >
              <UserPlus className="w-4 h-4" /> Registrar {activeTab === "ADMIN" ? "Admin" : "Usuario"}
            </button>
          </div>
        </header>

        {/* Tarjetas Estratégicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Población', value: stats.totalUsers, icon: Users, color: 'blue' },
            { 
              label: 'Nodos en Línea', 
              value: stats.onlineUsers, 
              icon: Activity, 
              color: 'emerald',
              isLive: true 
            },
            { label: 'Privilegios / Admins', value: adminsCount, icon: Shield, color: 'amber' },
            { 
              label: 'Transacciones Totales', 
              value: `S/. ${stats.totalSpent?.toLocaleString() || '0'}`, 
              icon: TrendingUp, 
              color: 'iris' 
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`card p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}
            >
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-current to-transparent opacity-[0.03] rounded-bl-full`} />
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl bg-secondary/80 text-foreground group-hover:bg-primary group-hover:text-white transition-all duration-300`}>
                  <stat.icon className={`w-5 h-5 ${stat.isLive ? 'animate-pulse' : ''}`} />
                </div>
                {stat.isLive && (
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-tighter">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                  </span>
                )}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className={`font-display font-black tracking-tighter truncate ${stat.label.includes('Transacciones') ? 'text-2xl' : 'text-3xl'}`}>{stat.value}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs Premium */}
        <div className="flex gap-4 mb-8">
           <button 
             onClick={() => setActiveTab("USER")}
             className={`flex-1 md:flex-none px-10 py-5 rounded-[24px] font-black text-[11px] uppercase tracking-[3px] transition-all border-2 flex items-center justify-center gap-3 ${
               activeTab === "USER" 
               ? "bg-primary text-primary-foreground border-primary shadow-2xl shadow-primary/30 scale-105 z-10" 
               : "bg-secondary/50 text-muted-foreground border-transparent hover:border-border hover:bg-secondary"
             }`}
           >
             <UserIcon className="w-4 h-4" /> Ciudadanos ({usersCount})
           </button>
           <button 
             onClick={() => setActiveTab("ADMIN")}
             className={`flex-1 md:flex-none px-10 py-5 rounded-[24px] font-black text-[11px] uppercase tracking-[3px] transition-all border-2 flex items-center justify-center gap-3 ${
               activeTab === "ADMIN" 
               ? "bg-amber-500 text-white border-amber-500 shadow-2xl shadow-amber-500/30 scale-105 z-10" 
               : "bg-secondary/50 text-muted-foreground border-transparent hover:border-border hover:bg-secondary"
             }`}
           >
             <Shield className="w-4 h-4" /> Administradores ({adminsCount})
           </button>
        </div>

        <div className="card p-0 overflow-hidden shadow-2xl">
           <div className="p-8 border-b border-border bg-secondary/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative group max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  placeholder={`Filtrar ${activeTab === 'ADMIN' ? 'miembros del consejo' : 'ciudadanos'}...`} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input w-full pl-12 bg-secondary/50 h-14 border-transparent focus:bg-background"
                />
              </div>
              <div className="flex gap-2">
                 <button className="btn-secondary h-12 text-[10px] uppercase font-bold tracking-widest">Corte de Caja</button>
              </div>
           </div>

           <div className="overflow-x-auto custom-scrollbar rounded-3xl border border-border/10 shadow-2xl bg-card">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-secondary/40 backdrop-blur-md border-b border-border/10">
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Identidad Digital</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Estatus Operativo</th>
                        {activeTab === "USER" && <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Potencial LTV</th>}
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-right pr-12">Acciones de Mando</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-border/5">
                     <AnimatePresence mode="popLayout">
                     {paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
                        <motion.tr 
                           key={user.id}  
                           layout
                           initial={{ opacity: 0 }} 
                           animate={{ opacity: 1 }}
                           exit={{ opacity: 0, scale: 0.98 }}
                           className={`hover:bg-primary/[0.02] transition-colors group relative ${!user.is_active && 'opacity-40 grayscale italic'}`}
                         >
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="relative shrink-0">
                                    <div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all group-hover:scale-105 duration-500 ${activeTab === 'ADMIN' ? 'border-amber-500/20' : 'border-primary/20'}`}>
                                       {user.avatar_url ? (
                                          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                       ) : (
                                          <div className={`w-full h-full flex items-center justify-center font-black text-xl ${activeTab === 'ADMIN' ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'}`}>
                                             {user.name[0]}
                                          </div>
                                       )}
                                    </div>
                                    {isOnline(user.last_activity) && (
                                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-background rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10">
                                         <div className="w-full h-full bg-emerald-500 rounded-full animate-ping opacity-75" />
                                      </div>
                                    )}
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-sm font-black tracking-tight">{user.name}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground inline-flex items-center gap-1.5 mt-1">
                                      {user.email}
                                      {user.is_verified && <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />}
                                    </p>
                                 </div>
                              </div>
                           </td>
                           
                           <td className="px-8 py-6">
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]'}`} />
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${user.is_active ? 'text-emerald-500' : 'text-rose-500'}`}>
                                     {user.is_active ? 'Activo' : 'Inactivo'}
                                  </span>
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-tighter opacity-60 ml-4`}>
                                   {user.is_verified ? 'Protocolo Verificado' : 'Pendiente de Validar'}
                                </span>
                              </div>
                           </td>

                           {activeTab === "USER" && (
                             <td className="px-8 py-6">
                                <div className="flex flex-col">
                                   <p className="text-sm font-black tracking-tighter text-foreground">S/. {user.total_spent.toLocaleString()}</p>
                                   <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest italic">Lifetime Value</p>
                                </div>
                             </td>
                           )}

                           <td className="px-8 py-6 text-right pr-12">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                 <button 
                                    onClick={() => { setSelectedUser(user); setModalOpen(true); }} 
                                    className="w-10 h-10 rounded-xl bg-secondary/80 text-muted-foreground hover:bg-primary hover:text-white transition-all flex items-center justify-center shadow-lg border border-border/10"
                                 >
                                    <Eye className="w-4 h-4" />
                                 </button>
                                 <button 
                                    onClick={() => { setSelectedUser(user); setEditModalOpen(true); }} 
                                    className="w-10 h-10 rounded-xl bg-secondary/80 text-muted-foreground hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shadow-lg border border-border/10"
                                 >
                                    <Edit2 className="w-4 h-4" />
                                 </button>
                              </div>
                           </td>
                        </motion.tr>
                     )) : (
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <td colSpan={5} className="py-24 text-center">
                           <ShieldQuestion className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
                           <p className="text-muted-foreground font-black uppercase tracking-[4px] text-xs">Sin coincidencias en este sector</p>
                        </td>
                      </motion.tr>
                    )}
                     </AnimatePresence>
                  </tbody>
               </table>
            </div>
            
            <AdminPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
            />
         </div>

        {/* --- MODALS --- */}

        {/* Create User Modal */}
        <AnimatePresence>
          {createModalOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCreateModalOpen(false)} className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg card p-0 shadow-2xl overflow-hidden">
                <div className="p-10">
                   <div className="flex justify-between items-center mb-10">
                      <div className="flex items-center gap-3">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeTab === 'ADMIN' ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'}`}>
                            {activeTab === 'ADMIN' ? <Shield className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                         </div>
                         <h3 className="text-2xl font-display font-bold">Registrar {activeTab === 'ADMIN' ? 'Admin' : 'Ciudadano'}</h3>
                      </div>
                      <button onClick={() => setCreateModalOpen(false)} className="p-2 hover:bg-muted rounded-xl transition-all"><X className="w-6 h-6" /></button>
                   </div>

                   <form onSubmit={handleCreateUser} className="space-y-6">
                      <div className="space-y-2">
                         <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nombre Completo</label>
                         <input 
                            required 
                            placeholder="Ej: Po Ping" 
                            className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Correo Electrónico</label>
                         <input 
                            required 
                            type="email"
                            placeholder="panda@ejemplo.com" 
                            className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Contraseña Temporal</label>
                         <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input 
                               required 
                               type="password"
                               placeholder="••••••••" 
                               className="input w-full pl-12 bg-secondary/50 h-14 border-transparent focus:bg-background"
                               value={formData.password}
                               onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                         </div>
                      </div>

                      <div className="pt-4">
                         <button disabled={isProcessing} type="submit" className={`btn-primary flex w-full h-14 border-none text-[10px] uppercase font-bold tracking-widest shadow-xl justify-center ${activeTab === 'ADMIN' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}>
                            {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : "Crear e Iniciar Protocolo"}
                         </button>
                      </div>
                   </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit User Modal */}
        <AnimatePresence>
          {editModalOpen && selectedUser && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditModalOpen(false)} className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg card p-0 shadow-2xl overflow-hidden">
                <div className="p-10">
                   <div className="flex justify-between items-center mb-10">
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Edit2 className="w-6 h-6" />
                         </div>
                         <h3 className="text-2xl font-display font-bold">Modificar Atributos</h3>
                      </div>
                      <button onClick={() => setEditModalOpen(false)} className="p-2 hover:bg-muted rounded-xl transition-all"><X className="w-6 h-6" /></button>
                   </div>

                   <form onSubmit={handleEditUser} className="space-y-6">
                      <div className="space-y-2">
                         <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nombre</label>
                         <input 
                            value={selectedUser.name} 
                            onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                            className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" 
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</label>
                         <input 
                            type="email"
                            value={selectedUser.email} 
                            onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                            className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" 
                         />
                      </div>
                      <div className="space-y-2">
                        <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Rol</label>
                        <select 
                          className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background appearance-none"
                          value={selectedUser.role}
                          onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                        >
                           <option value="USER">User (Ciudadano)</option>
                           <option value="ADMIN">Admin (Consejo)</option>
                        </select>
                      </div>

                      <div className="pt-4">
                         <button disabled={isProcessing} type="submit" className="btn-primary w-full h-14 border-none text-[10px] uppercase font-bold tracking-widest bg-blue-600 hover:bg-blue-700 text-white flex justify-center">
                            {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirmar Cambios"}
                         </button>
                      </div>
                   </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* User Detail Modal */}
        <AnimatePresence>
          {modalOpen && selectedUser && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-4xl card p-0 shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]">
                <div className="p-10">
                   <div className="flex justify-between items-start mb-10">
                    <div className="flex items-center gap-6">
                       <div className="w-24 h-24 rounded-3xl bg-secondary border-4 border-background shadow-2xl overflow-hidden">
                          {selectedUser.avatar_url ? <img src={selectedUser.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl font-display font-bold text-primary">{selectedUser.name[0]}</div>}
                       </div>
                       <div>
                          <h2 className="text-4xl font-display font-bold tracking-tight">{selectedUser.name}</h2>
                          <div className="flex items-center gap-4 mt-3">
                             <span className="flex items-center gap-2 text-[11px] font-black uppercase text-muted-foreground bg-secondary/50 px-4 py-1.5 rounded-full"><Mail className="w-3.5 h-3.5" /> {selectedUser.email}</span>
                             <span className={`flex items-center gap-2 text-[11px] font-black uppercase px-4 py-1.5 rounded-full border-2 ${selectedUser.role === 'ADMIN' ? 'text-amber-500 bg-amber-500/5 border-amber-500/20' : 'text-primary bg-primary/5 border-primary/20'}`}>
                               <Shield className="w-3.5 h-3.5" /> {selectedUser.role === 'ADMIN' ? 'Consejo' : 'Ciudadano'}
                             </span>
                          </div>
                       </div>
                    </div>
                    <button onClick={() => setModalOpen(false)} className="p-4 bg-secondary/50 hover:bg-muted rounded-2xl transition-all"><X className="w-6 h-6" /></button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                     <div className="lg:col-span-2 space-y-10">
                        {/* Identidad */}
                        <div className="card p-8 bg-secondary/20 flex flex-col md:flex-row items-center justify-between gap-4">
                           <div className="flex items-center gap-5">
                              {selectedUser.is_verified ? <ShieldCheck className="w-10 h-10 text-emerald-500" /> : <ShieldAlert className="w-10 h-10 text-amber-500" />}
                              <div>
                                 <p className="text-[11px] font-black uppercase text-muted-foreground tracking-widest">Protocolo de Identidad</p>
                                 <p className={`text-xl font-bold ${selectedUser.is_verified ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {selectedUser.is_verified ? 'Vínculo Verificado y Seguro' : 'Esperando Sincronización de Datos'}
                                 </p>
                              </div>
                           </div>
                           {!selectedUser.is_verified && (
                              <button onClick={() => toast.info("Reenviando protocolo...")} className="text-[11px] font-black uppercase tracking-widest text-primary hover:underline underline-offset-8 transition-all">Reenviar Link</button>
                           )}
                        </div>

                        {/* Stats Panel */}
                        <div className="grid grid-cols-3 gap-6">
                           <div className="card p-6 bg-secondary/30 group hover:border-primary/50 transition-all text-center md:text-left">
                              <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Transacciones</p>
                              <p className="text-2xl font-display font-bold text-primary">${selectedUser.total_spent.toLocaleString()}</p>
                           </div>
                           <div className="card p-6 bg-secondary/30 group hover:border-primary/50 transition-all text-center md:text-left">
                              <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Inmersiones</p>
                              <p className="text-2xl font-display font-bold">{selectedUser._count?.orders || 0}</p>
                           </div>
                           <div className="card p-6 bg-secondary/30 group hover:border-primary/50 transition-all text-center md:text-left">
                              <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Vínculos</p>
                              <p className="text-2xl font-display font-bold">{selectedUser.visit_count}</p>
                           </div>
                        </div>

                        {/* Global Actions */}
                        <div className="flex gap-6">
                           <button onClick={() => handleUpdateStatus(selectedUser.id, !selectedUser.is_active)} className={`flex-1 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${selectedUser.is_active ? 'bg-rose-500 text-white shadow-2xl shadow-rose-500/30 hover:bg-rose-600 border border-transparent' : 'bg-green-500 text-white shadow-2xl shadow-green-500/30 hover:bg-green-600 border border-transparent'}`}>
                              {selectedUser.is_active ? 'Bloquear de por vida' : 'Restaurar Privilegios'}
                           </button>
                           <button onClick={() => { setModalOpen(false); setEditModalOpen(true); }} className="btn-secondary flex-1 h-14 text-[10px] uppercase font-bold tracking-widest">Alterar Registro</button>
                        </div>
                     </div>

                     <div className="space-y-10">
                        <div className="card p-10 border-border/50 h-full relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-[80px] rounded-full point-events-none" />
                           <h4 className="flex items-center gap-3 text-[12px] font-black uppercase tracking-widest mb-8"><TrendingUp className="w-5 h-5 text-primary" /> Análisis de Lealtad</h4>
                           <div className="space-y-8">
                              <div className="p-6 rounded-2xl bg-secondary/50 border border-border/30">
                                 <p className="text-[10px] font-black uppercase text-muted-foreground mb-3">Grado de Confianza</p>
                                 <div className="flex items-center gap-3">
                                    <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden border border-border/30">
                                       <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (selectedUser.total_spent / 100))}%` }} className="h-full bg-gradient-to-r from-primary to-[#818cf8]" />
                                    </div>
                                    <span className="text-sm font-bold">{Math.min(100, (selectedUser.total_spent / 100)).toFixed(0)}%</span>
                                 </div>
                              </div>
                              <div className="space-y-4">
                                 <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl bg-opacity-5 border ${selectedUser.is_active ? 'bg-green-500 text-green-500 border-green-500/20' : 'bg-rose-500 text-rose-500 border-rose-500/20'}`}>
                                    <UserCheck className="w-5 h-5" />
                                    <span className="text-[11px] font-black uppercase tracking-widest">{selectedUser.is_active ? 'Ciudadano Ejemplar' : 'Aislado del Sistema'}</span>
                                 </div>
                                 <p className="text-[11px] text-muted-foreground italic font-medium leading-relaxed px-2">Su conducta es monitoreada en tiempo real bajo el estricto protocolo NovaShield v4.5.</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
