import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Edit2, 
  X, 
  Check, 
  Grid,
  Monitor,
  Cpu,
  Mouse,
  Gamepad,
  Headphones,
  Laptop,
  TrendingUp,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { Switch } from "../../components/ui/switch";
import { toast } from "sonner";

const iconOptions = [
  { name: 'monitor', icon: Monitor },
  { name: 'cpu', icon: Cpu },
  { name: 'mouse', icon: Mouse },
  { name: 'gamepad', icon: Gamepad },
  { name: 'headphones', icon: Headphones },
  { name: 'laptop', icon: Laptop },
  { name: 'grid', icon: Grid }
];

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/admin/categories", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        console.error("Data is not an array:", data);
        setCategories([]);
        toast.error("Error: El servidor no envió una lista de categorías");
      }
    } catch (error) {
      toast.error("Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const catData: any = Object.fromEntries(formData.entries());
    catData.is_active = formData.get("is_active") === "on";

    const isEdit = !!editingCategory?.id;
    const method = isEdit ? "PUT" : "POST";
    const url = isEdit 
      ? `http://localhost:3000/api/admin/categories/${editingCategory.id}` 
      : "http://localhost:3000/api/admin/categories";

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(catData)
      });

      if (response.ok) {
        toast.success(isEdit ? "Categoría actualizada" : "Categoría creada");
        handleCloseModal();
        fetchCategories();
      } else {
        toast.error("Error al guardar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/categories/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (response.ok) {
        toast.success(!currentStatus ? "Categoría activada" : "Categoría desactivada");
        fetchCategories();
      } else {
        toast.error("Error al cambiar el estado");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Métricas estratégicas
  const totalCategoriesCount = categories.length;
  const activeCategoriesCount = categories.filter(c => c.is_active).length;
  const emptyCategoriesCount = categories.filter(c => (c._count?.products || 0) === 0).length;
  const topCategoryName = categories.length > 0 
    ? [...categories].sort((a, b) => (b._count?.products || 0) - (a._count?.products || 0))[0]?.name 
    : "Sin Datos";

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-black">Categorías</h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
              <span>Gestión de Taxonomía</span>
            </div>
          </div>
          
          <button 
            onClick={() => { setEditingCategory(null); setModalOpen(true); }}
            className="btn-primary h-12"
          >
            <Plus className="w-5 h-5" /> Nueva Categoría
          </button>
        </header>

        {/* Tarjetas Estratégicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Taxonomías Totales', value: totalCategoriesCount, icon: Grid, color: 'blue' },
            { label: 'Estructuras Activas', value: activeCategoriesCount, icon: ShieldCheck, color: 'emerald' },
            { label: 'Zonas Vacías', value: emptyCategoriesCount, icon: AlertTriangle, color: 'rose', alert: emptyCategoriesCount > 0 },
            { label: 'Dominio Principal', value: topCategoryName, icon: TrendingUp, color: 'amber', small: true },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`card p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 ${stat.alert ? 'border-rose-500/30 bg-rose-500/[0.02]' : ''}`}
            >
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-current to-transparent opacity-[0.03] rounded-bl-full`} />
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl bg-secondary/80 text-foreground group-hover:bg-primary group-hover:text-white transition-all duration-300`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                {stat.alert && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className={`font-display font-black tracking-tighter truncate ${stat.small ? 'text-xl' : 'text-3xl'}`}>{stat.value}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mb-6 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            placeholder="Buscar categorías..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full pl-12 bg-secondary/50 h-14 border-transparent focus:bg-background"
          />
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-secondary/30 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Categoría</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Productos</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estado</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-6 py-8"><div className="h-4 bg-secondary/50 rounded w-full" /></td>
                  </tr>
                ))
              ) : paginatedCategories.map((cat) => {
                const IconComp = iconOptions.find(i => i.name === cat.icon)?.icon || Grid;
                return (
                  <tr key={cat.id} className="hover:bg-secondary/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-none mb-1">{cat.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">ID: {cat.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium">{cat._count?.products || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest ${cat.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                        {cat.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} {cat.is_active ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                     <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <button 
                          onClick={() => { setEditingCategory(cat); setModalOpen(true); }}
                          className="p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-primary transition-all hover:scale-110"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-xl border border-border/50">
                           <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">
                              {cat.is_active ? 'ON' : 'OFF'}
                           </span>
                           <Switch 
                              checked={cat.is_active} 
                              onCheckedChange={() => handleToggleStatus(cat.id, cat.is_active)}
                           />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <AdminPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredCategories.length}
            itemsPerPage={itemsPerPage}
          />
        </div>

        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg card overflow-hidden shadow-2xl">
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-display font-bold">{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</h3>
                    <button onClick={handleCloseModal} className="p-2 hover:bg-secondary rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nombre</label>
                      <input name="name" defaultValue={editingCategory?.name} required className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" />
                    </div>

                    <div className="space-y-2">
                       <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Icono</label>
                       <div className="grid grid-cols-4 gap-2">
                          {iconOptions.map(opt => (
                             <label key={opt.name} className="relative group cursor-pointer">
                                <input type="radio" name="icon" value={opt.name} defaultChecked={editingCategory?.icon === opt.name} className="peer hidden" />
                                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-secondary/30 border border-transparent peer-checked:border-primary peer-checked:bg-primary/10 transition-all hover:bg-secondary/50">
                                   <opt.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                   <span className="text-[8px] uppercase font-bold mt-1 opacity-60">{opt.name}</span>
                                </div>
                             </label>
                          ))}
                       </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input type="checkbox" name="is_active" id="is_active" defaultChecked={editingCategory === null ? true : editingCategory?.is_active} className="w-5 h-5 rounded-lg border-primary accent-primary" />
                      <label htmlFor="is_active" className="text-sm font-bold">Categoría Activa</label>
                    </div>

                    <div className="pt-4 flex gap-4">
                      <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1 h-14">Cancelar</button>
                      <button type="submit" className="btn-primary flex-[2] h-14 border-none text-[10px] font-bold uppercase tracking-widest">Guardar cambios</button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
