import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Tag,
  Clock,
  TrendingDown,
  Package,
  Calendar,
  Image as ImageIcon,
  Flame,
  ArrowRight,
  Percent
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { toast } from "sonner";

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalProducts: 0, stagnantProducts: 0, activePromotions: 0 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [minDiscount, setMinDiscount] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchData = async () => {
    try {
      const [promosRes, statsRes] = await Promise.all([
        fetch("http://localhost:3000/api/admin/promotions", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        }),
        fetch("http://localhost:3000/api/admin/promotions/stats", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        })
      ]);
      
      const promosData = await promosRes.json();
      const statsData = await statsRes.json();
      
      if (Array.isArray(promosData)) setPromotions(promosData);
      setStats(statsData);
    } catch (error) {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingPromotion(null);
    setImagePreview(null);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://localhost:3000/api/admin/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
        body: formData
      });
      const data = await response.json();
      if (data.url) {
        toast.success("Imagen subida");
        setEditingPromotion((prev: any) => ({ ...prev, image_url: data.url }));
      }
    } catch (error) {
      toast.error("Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const promoData: any = Object.fromEntries(formData.entries());
    promoData.is_active = formData.get("is_active") === "on";

    const isEdit = !!editingPromotion?.id;
    const method = isEdit ? "PUT" : "POST";
    const url = isEdit 
      ? `http://localhost:3000/api/admin/promotions/${editingPromotion.id}` 
      : "http://localhost:3000/api/admin/promotions";

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(promoData)
      });

      if (response.ok) {
        toast.success(isEdit ? "Promoción actualizada" : "Promoción creada");
        handleCloseModal();
        fetchData();
      }
    } catch (error) {
      toast.error("Error al guardar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Desactivar esta promoción?")) return;
    try {
      const response = await fetch(`http://localhost:3000/api/admin/promotions/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.ok) {
        toast.success("Promoción desactivada");
        fetchData();
      }
    } catch (error) {
      toast.error("Error al desactivar");
    }
  };

  const filteredPromotions = promotions.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || (filterStatus === "active" ? p.is_active : !p.is_active);
    const matchesDiscount = p.discount >= minDiscount;
    return matchesSearch && matchesStatus && matchesDiscount;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, minDiscount]);

  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
  const paginatedPromotions = filteredPromotions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-display font-bold">Promociones y Ofertas</h1>
            <p className="text-muted-foreground mt-1 text-xs tracking-widest uppercase font-bold">Estrategia Comercial de NovaTech</p>
          </div>
          
          <button 
            onClick={() => { setEditingPromotion(null); setImagePreview(null); setModalOpen(true); }}
            className="btn-primary h-12 gap-2 border-none"
          >
            <Plus className="w-5 h-5" /> Nueva Promoción
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="card p-6 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <Package className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Inventario Total</span>
            </div>
            <div className="text-4xl font-display font-bold">{stats.totalProducts}</div>
            <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold">Artículos activos en sistema</p>
          </div>

          <div className="card p-6 border-rose-500/20 bg-rose-500/5 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-rose-500 uppercase tracking-tighter italic">Alerta de Ocupación</span>
            </div>
            <div className="text-4xl font-display font-bold text-rose-500">{stats.stagnantProducts}</div>
            <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold">Productos estancados (+30 días)</p>
            <TrendingDown className="absolute bottom-4 right-4 w-12 h-12 text-rose-500/10 -rotate-12" />
          </div>

          <div className="card p-6 border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                <Flame className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-tighter underline">Campañas Activas</span>
            </div>
            <div className="text-4xl font-display font-bold text-emerald-500">{stats.activePromotions}</div>
            <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold">Estrategias de venta en curso</p>
            <Flame className="absolute bottom-4 right-4 w-12 h-12 text-emerald-500/10" />
          </div>
        </div>

        {/* Filters Section */}
        <div className="card p-8 mb-10">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="flex-1 w-full relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                placeholder="Buscar por título o descripción..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full pl-12 bg-secondary/50 h-14 border-transparent focus:bg-background italic"
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full lg:w-auto">
               <div className="space-y-1.5 min-w-[140px]">
                  <span className="label text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Estado</span>
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="input w-full bg-secondary/80 h-10 border-border/50 appearance-none cursor-pointer hover:bg-secondary text-xs"
                  >
                    <option value="all">Todas</option>
                    <option value="active">Activas</option>
                    <option value="inactive">Inactivas</option>
                  </select>
               </div>

               <div className="space-y-1.5 min-w-[140px]">
                  <span className="label text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Descuento Mín.</span>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={minDiscount}
                      onChange={(e) => setMinDiscount(parseInt(e.target.value) || 0)}
                      className="input w-full pr-10 bg-secondary/80 h-10 border-border/50 text-xs"
                    />
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  </div>
               </div>

               <button 
                onClick={() => { setSearchTerm(""); setFilterStatus("all"); setMinDiscount(0); }}
                className="btn-secondary h-10 mt-auto col-span-2 md:col-span-1 gap-2 text-[10px] uppercase font-bold tracking-widest w-full"
               >
                 <X className="w-3 h-3 transition-transform" /> Limpiar
               </button>
            </div>
          </div>
        </div>

        {/* Promotions List */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            <AnimatePresence>
               {paginatedPromotions.map((promo) => (
                  <motion.div 
                     key={promo.id} 
                     layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`relative aspect-[4/3] card p-0 overflow-hidden group transition-all hover:-translate-y-1 ${promo.is_active ? 'border-border/50' : 'border-rose-500/20 opacity-70 grayscale'}`}
              >
                <img src={promo.image_url} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-black italic shadow-lg">
                    <Tag className="w-3 h-3" />
                    -{promo.discount}%
                  </div>
                </div>

                <div className="absolute inset-x-6 bottom-6 flex flex-col items-start gap-2">
                  <h4 className="text-lg font-display font-black text-white leading-tight uppercase tracking-tight">{promo.title}</h4>
                  <p className="text-xs text-white/70 line-clamp-2">{promo.description}</p>
                  
                  <div className="flex items-center justify-between w-full mt-2">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => { setEditingPromotion(promo); setModalOpen(true); }}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(promo.id)}
                        className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-500 backdrop-blur-md transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {!promo.is_active && (
                       <span className="text-[8px] font-black text-rose-500 uppercase tracking-[0.2em] bg-white px-2 py-1 rounded-full">Inactiva</span>
                    )}
                  </div>
                </div>
                  </motion.div>
               ))}
            </AnimatePresence>
         </div>

         <AdminPagination 
           currentPage={currentPage}
           totalPages={totalPages}
           onPageChange={setCurrentPage}
           totalItems={filteredPromotions.length}
           itemsPerPage={itemsPerPage}
         />

        {/* Promotion Modal */}
        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-4xl card p-10 shadow-2xl overflow-hidden">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-2xl font-display font-bold">
                        {editingPromotion ? "Estrategia de Venta" : "Lanzar Nueva Promoción"}
                      </h3>
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">NovaTech Marketing Operations</p>
                    </div>
                    <button onClick={handleCloseModal} className="p-2 hover:bg-secondary rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                  </div>

                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2 col-span-full">
                             <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Título de Campaña</label>
                             <input name="title" defaultValue={editingPromotion?.title} required placeholder="Ej: VENTA RELÁMPAGO" className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" />
                           </div>
                           <div className="space-y-2 col-span-full">
                             <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Descuento (%)</label>
                             <div className="relative">
                               <input type="number" name="discount" defaultValue={editingPromotion?.discount} required className="input w-full pr-10 bg-secondary/50 h-14 border-transparent focus:bg-background font-display text-lg" />
                               <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                             </div>
                           </div>
                        </div>

                        <div className="space-y-2">
                          <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Descripción Persuasiva</label>
                          <textarea name="description" defaultValue={editingPromotion?.description} rows={3} required placeholder="Describe por qué el cliente DEBE comprar esto..." className="input w-full px-4 py-3 bg-secondary/50 border-transparent focus:bg-background resize-none h-auto min-h-[100px] italic" />
                        </div>
                    </div>

                    <div className="space-y-6 flex flex-col h-full">
                       <div className="space-y-4 flex-1">
                          <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Visual de Campaña</label>
                          <div className="relative group aspect-video rounded-3xl bg-secondary/50 border-2 border-dashed border-border flex items-center justify-center overflow-hidden hover:bg-muted/50 transition-colors">
                            {imagePreview || editingPromotion?.image_url ? (
                              <img src={imagePreview || editingPromotion?.image_url} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                                <span className="text-[10px] uppercase font-bold text-muted-foreground/60">Sube el arte aquí</span>
                              </div>
                            )}
                            <input type="file" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                            {uploading && (
                               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full" />
                               </div>
                            )}
                          </div>
                          <input type="hidden" name="image_url" value={editingPromotion?.image_url || ""} />
                       </div>
                       
                       <div className="space-y-6">
                           <div className="space-y-2">
                             <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Fecha de Expiración</label>
                             <div className="relative">
                                <input type="date" name="expires_at" defaultValue={editingPromotion?.expires_at ? new Date(editingPromotion.expires_at).toISOString().split('T')[0] : ''} className="input w-full pl-10 pr-4 bg-secondary/50 h-14 border-transparent focus:bg-background" />
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                             </div>
                           </div>
                           <div className="flex items-center gap-3 py-2">
                              <input type="checkbox" name="is_active" id="is_active" defaultChecked={editingPromotion === null ? true : editingPromotion?.is_active} className="w-4 h-4 rounded-sm border-primary text-primary focus:ring-primary bg-background cursor-pointer" />
                              <label htmlFor="is_active" className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0 cursor-pointer">Activar Campaña</label>
                           </div>
                       </div>

                       <div className="pt-4 flex gap-4 mt-auto">
                         <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1 h-14 text-[10px] font-bold tracking-widest uppercase">Cancelar</button>
                         <button type="submit" className="btn-primary flex-[2] h-14 border-none text-[10px] font-bold tracking-widest uppercase gap-2">
                            {editingPromotion ? 'Relanzar' : 'Disparar Ventas'}
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                         </button>
                       </div>
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
