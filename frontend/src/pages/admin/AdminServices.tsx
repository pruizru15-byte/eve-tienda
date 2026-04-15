import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Edit2, 
  X, 
  Check, 
  Wrench,
  Layers,
  Info,
  DollarSign,
  Monitor,
  Cpu,
  Mouse,
  Settings,
  ShieldCheck,
  Zap,
  Globe,
  TrendingUp,
  AlertTriangle,
  FolderTree,
  Activity
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { Switch } from "../../components/ui/switch";
import { toast } from "sonner";

const iconOptions = [
  { name: 'wrench', icon: Wrench },
  { name: 'monitor', icon: Monitor },
  { name: 'cpu', icon: Cpu },
  { name: 'mouse', icon: Mouse },
  { name: 'settings', icon: Settings },
  { name: 'shield', icon: ShieldCheck },
  { name: 'zap', icon: Zap },
  { name: 'globe', icon: Globe }
];

export default function AdminServices() {
  const [activeTab, setActiveTab] = useState<"services" | "categories">("services");
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Form states for dynamic lists
  const [formFeatures, setFormFeatures] = useState<string[]>([]);
  const [formPlazo, setFormPlazo] = useState<string[]>([]);
  const [formNivel, setFormNivel] = useState<string[]>([]);
  const [formAvance, setFormAvance] = useState<string[]>([]);

  // Modal initializers
  useEffect(() => {
    if (editingService) {
      setFormFeatures(JSON.parse(editingService.features || "[]"));
      const opts = editingService.contact_options ? JSON.parse(editingService.contact_options) : { plazo: [], nivel: [], avance: [] };
      setFormPlazo(opts.plazo || []);
      setFormNivel(opts.nivel || []);
      setFormAvance(opts.avance || []);
    } else {
      setFormFeatures([]);
      setFormPlazo(["< 30 días", "1-3 meses", "> 3 meses"]);
      setFormNivel(["Pregrado", "Maestría", "Doctorado"]);
      setFormAvance(["Solo idea", "Borrador", "Necesito desde cero"]);
    }
  }, [editingService, modalOpen]);

  const addFeature = (val: string) => val.trim() && setFormFeatures([...formFeatures, val.trim()]);
  const removeFeature = (idx: number) => setFormFeatures(formFeatures.filter((_, i) => i !== idx));

  const addOption = (list: "plazo" | "nivel" | "avance", val: string) => {
    if (!val.trim()) return;
    const v = val.trim();
    if (list === "plazo") setFormPlazo([...formPlazo, v]);
    if (list === "nivel") setFormNivel([...formNivel, v]);
    if (list === "avance") setFormAvance([...formAvance, v]);
  };

  const removeOption = (list: "plazo" | "nivel" | "avance", idx: number) => {
    if (list === "plazo") setFormPlazo(formPlazo.filter((_, i) => i !== idx));
    if (list === "nivel") setFormNivel(formNivel.filter((_, i) => i !== idx));
    if (list === "avance") setFormAvance(formAvance.filter((_, i) => i !== idx));
  };

  const fetchData = async () => {
    try {
      const [servRes, catRes] = await Promise.all([
        fetch("http://localhost:3000/api/admin/services", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        }),
        fetch("http://localhost:3000/api/admin/services/categories", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        })
      ]);
      const servData = await servRes.json();
      const catData = await catRes.json();
      if (Array.isArray(servData)) setServices(servData);
      if (Array.isArray(catData)) setCategories(catData);
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
    setCatModalOpen(false);
    setEditingService(null);
    setEditingCategory(null);
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const serviceData: any = Object.fromEntries(formData.entries());
    
    // Use state-based fields
    serviceData.features = formFeatures;
    serviceData.contact_options = {
      plazo: formPlazo,
      nivel: formNivel,
      avance: formAvance
    };

    const isEdit = !!editingService?.id;
    const method = isEdit ? "PUT" : "POST";
    const url = isEdit 
      ? `http://localhost:3000/api/admin/services/${editingService.id}` 
      : "http://localhost:3000/api/admin/services";

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(serviceData)
      });

      if (response.ok) {
        toast.success(isEdit ? "Servicio actualizado" : "Servicio creado");
        handleCloseModal();
        fetchData();
      }
    } catch (error) {
      toast.error("Error al guardar");
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const catData = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("http://localhost:3000/api/admin/services/categories", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(catData)
      });

      if (response.ok) {
        toast.success("Categoría creada");
        handleCloseModal();
        fetchData();
      }
    } catch (error) {
      toast.error("Error al guardar categoría");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/services/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (response.ok) {
        toast.success(!currentStatus ? "Servicio activado" : "Servicio desactivado");
        fetchData();
      } else {
        toast.error("Error al cambiar estado");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleToggleCategoryStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/services/categories/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (response.ok) {
        toast.success(!currentStatus ? "Categoría activada" : "Categoría desactivada");
        fetchData();
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const filteredServices = services.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Métricas estratégicas
  const totalServicesCount = services.length;
  const activeServicesCount = services.filter(s => s.is_active).length;
  const totalCategoriesCount = categories.length;
  const averageServicePrice = services.length > 0 
    ? services.reduce((acc, s) => acc + s.price, 0) / services.length 
    : 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const paginatedServices = filteredServices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-black">Servicios Técnicos</h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
              <span>Catálogo de Soluciones</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
              onClick={() => { setEditingCategory(null); setCatModalOpen(true); }}
              className="p-3 bg-secondary/50 text-muted-foreground rounded-xl hover:bg-secondary hover:text-foreground transition-all"
              title="Nueva Categoría"
            >
              <FolderTree className="w-5 h-5" />
            </button>
            <button 
              onClick={() => { setEditingService(null); setModalOpen(true); }}
              className="btn-primary h-12"
            >
              <Plus className="w-5 h-5" /> Nuevo Servicio
            </button>
          </div>
        </header>

        {/* Tarjetas Estratégicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Soluciones Totales', value: totalServicesCount, icon: Wrench, color: 'blue' },
            { label: 'Capacidades Activas', value: activeServicesCount, icon: Activity, color: 'emerald' },
            { label: 'Divisiones Técnicas', value: totalCategoriesCount, icon: FolderTree, color: 'iris' },
            { label: 'Ticket Promedio', value: `S/. ${averageServicePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, color: 'amber' },
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
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className={`font-display font-black tracking-tighter truncate ${stat.label === 'Ticket Promedio' ? 'text-2xl' : 'text-3xl'}`}>{stat.value}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-border/50 mb-8 px-2">
          <button 
            onClick={() => setActiveTab("services")}
            className={`pb-4 text-sm font-bold uppercase tracking-widest relative transition-all ${activeTab === "services" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            Servicios ({services.length})
            {activeTab === "services" && <motion.div layoutId="tab" className="absolute bottom-0 inset-x-0 h-1 bg-primary rounded-t-full" />}
          </button>
          <button 
            onClick={() => setActiveTab("categories")}
            className={`pb-4 text-sm font-bold uppercase tracking-widest relative transition-all ${activeTab === "categories" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            Categorías ({categories.length})
            {activeTab === "categories" && <motion.div layoutId="tab" className="absolute bottom-0 inset-x-0 h-1 bg-primary rounded-t-full" />}
          </button>
        </div>

        {activeTab === "services" ? (
          <>
            <div className="mb-6 relative group max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                placeholder="Buscar servicios o categorías..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full pl-12 bg-secondary/50 h-14 border-transparent focus:bg-background"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
              {paginatedServices.map((service) => {
                const IconComp = iconOptions.find(i => i.name === service.icon)?.icon || Wrench;
                return (
                  <motion.div 
                    key={service.id}
                    layout
                    className={`card p-6 flex flex-col md:flex-row gap-6 relative group transition-all hover:-translate-y-1 ${service.is_active ? 'border-border/50' : 'border-rose-500/20 opacity-70 grayscale'}`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <IconComp className="w-8 h-8" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 px-2 py-0.5 rounded-full mb-1 inline-block">
                            {service.category?.title}
                          </span>
                          <h3 className="text-xl font-display font-bold">{service.title}</h3>
                        </div>
                        <div className="flex gap-4 items-center">
                           <button onClick={() => { setEditingService(service); setModalOpen(true); }} className="p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-primary transition-all hover:scale-110" title="Editar"><Edit2 className="w-4 h-4" /></button>
                           <div className="flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-xl border border-border/50">
                              <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">
                                 {service.is_active ? 'ON' : 'OFF'}
                              </span>
                              <Switch 
                                 checked={service.is_active} 
                                 onCheckedChange={() => handleToggleStatus(service.id, service.is_active)}
                              />
                           </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 italic">"{service.description}"</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {JSON.parse(service.features || "[]").map((f: string, i: number) => (
                          <span key={i} className="text-[10px] font-bold bg-secondary/80 text-foreground/80 px-2 py-1 rounded-lg flex items-center gap-1">
                            <Check className="w-2 h-2 text-green-500" /> {f}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-xs font-black">
                        <div className="flex items-center gap-1.5 text-primary">
                          <span className="text-[10px] bg-primary/10 px-1.5 py-0.5 rounded leading-none">S/.</span>
                          {service.price.toLocaleString()}
                        </div>
                        <div className="text-muted-foreground opacity-60">
                          {service.price_model}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <AdminPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredServices.length}
              itemsPerPage={itemsPerPage}
            />
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div key={cat.id} className={`card p-8 flex flex-col relative group transition-all hover:-translate-y-1 ${cat.is_active ? 'border-border/50' : 'border-rose-500/20 opacity-70 grayscale'}`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-display font-bold mb-2">{cat.title}</h3>
                  <div className="flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-xl border border-border/50">
                     <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">
                        {cat.is_active ? 'ON' : 'OFF'}
                     </span>
                     <Switch 
                        checked={cat.is_active} 
                        onCheckedChange={() => handleToggleCategoryStatus(cat.id, cat.is_active)}
                     />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-6 h-10 line-clamp-2">{cat.description}</p>
                <div className="flex items-center justify-between mt-auto">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{cat._count?.services || 0} Servicios asociados</span>
                   <button className="p-2 rounded-lg opacity-0 group-hover:opacity-100 bg-secondary/50 transition-all hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Service Modal */}
        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-4xl card p-10 shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]">
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-2xl font-display font-bold">{editingService ? "Configurar Solución" : "Definir Nuevo Servicio"}</h3>
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">NovaTech Global Solutions</p>
                    </div>
                    <button onClick={handleCloseModal} className="p-2 hover:bg-secondary rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                  </div>

                  <form onSubmit={handleServiceSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                       <div className="space-y-6">
                          <div className="grid grid-cols-1 gap-6">
                              <div className="space-y-2">
                                <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Categoría</label>
                                <select name="category_id" defaultValue={editingService?.category_id} required className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background appearance-none">
                                   <option value="">Seleccionar Categoría</option>
                                   {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Título Profesional</label>
                                <input name="title" defaultValue={editingService?.title} required className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" />
                              </div>
                          </div>

                          <div className="space-y-2">
                            <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Slogan del Servicio</label>
                            <input name="description" defaultValue={editingService?.description} required placeholder="Ej: Soluciones de hardware para alto..." className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background italic" />
                          </div>

                          <div className="space-y-2">
                            <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Descripción Detallada</label>
                            <textarea name="long_description" defaultValue={editingService?.long_description} rows={4} required className="input w-full bg-secondary/50 py-4 border-transparent focus:bg-background resize-none min-h-[100px] h-auto" />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Modelo de Precio</label>
                                <input name="price_model" defaultValue={editingService?.price_model} required placeholder="Ej: Desde $49.99" className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" />
                              </div>
                              <div className="space-y-2">
                                <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Inversión / Precio ($)</label>
                                <input type="number" name="price" defaultValue={editingService?.price || 0} required className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" />
                              </div>
                          </div>
                       </div>

                       <div className="space-y-6">
                           <div className="space-y-4">
                             <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Características del Servicio</label>
                             <div className="flex gap-2">
                                <input 
                                   id="new-feature"
                                   placeholder="Ej: Garantía 1 año" 
                                   className="input flex-1 bg-secondary/50 h-14 border-transparent focus:bg-background" 
                                   onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                         e.preventDefault();
                                         addFeature((e.target as HTMLInputElement).value);
                                         (e.target as HTMLInputElement).value = '';
                                      }
                                   }}
                                />
                                <button 
                                   type="button"
                                   onClick={() => {
                                      const input = document.getElementById('new-feature') as HTMLInputElement;
                                      addFeature(input.value);
                                      input.value = '';
                                   }}
                                   className="btn-primary w-14 h-14 p-0 border-none justify-center flex shrink-0"
                                >
                                   <Plus className="w-5 h-5" />
                                </button>
                             </div>
                             <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-secondary/20 rounded-2xl border border-dashed border-border/60">
                                {formFeatures.map((f, i) => (
                                   <span key={i} className="bg-primary/10 text-primary text-[10px] font-black py-1.5 px-3 rounded-lg flex items-center gap-2 animate-in zoom-in-50">
                                      {f}
                                      <button type="button" onClick={() => removeFeature(i)} className="hover:text-destructive transition-colors"><X className="w-3 h-3" /></button>
                                   </span>
                                ))}
                                {formFeatures.length === 0 && <span className="text-[10px] text-muted-foreground/40 italic p-1">No hay características añadidas...</span>}
                             </div>
                           </div>

                    <div className="space-y-6 p-6 bg-primary/5 rounded-[2.5rem] border border-primary/10">
                       <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                          <Zap className="w-3 h-3" /> Configuración de Contacto (WhatsApp)
                       </h4>
                       
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Número de WhatsApp (Sin +)</label>
                                 <input name="whatsapp_number" defaultValue={editingService?.whatsapp_number} placeholder="1234567890" className="input w-full bg-secondary/30 h-12 border-transparent focus:bg-background" />
                              </div>
                              <div className="space-y-2">
                                 <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Texto de Confianza</label>
                                 <input name="trust_text" defaultValue={editingService?.trust_text} placeholder="✅ +50 aprobados" className="input w-full bg-secondary/30 h-12 border-transparent focus:bg-background" />
                              </div>
                           </div>

                           <div className="space-y-6 pt-2">
                              <label className="label text-[10px] font-black uppercase tracking-widest text-primary ml-1 block">Constructor de Selectores</label>
                              
                              {(["plazo", "nivel", "avance"] as const).map((type) => (
                                 <div key={type} className="space-y-2">
                                    <label className="label text-[9px] font-bold uppercase text-muted-foreground ml-1 capitalize">{type}</label>
                                    <div className="flex gap-2">
                                       <input 
                                          id={`new-${type}`}
                                          placeholder={`Añadir opción de ${type}...`}
                                          className="input flex-1 bg-secondary/30 h-10 border-transparent focus:bg-background text-xs"
                                          onKeyDown={(e) => {
                                             if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addOption(type, (e.target as HTMLInputElement).value);
                                                (e.target as HTMLInputElement).value = '';
                                             }
                                          }}
                                       />
                                       <button 
                                          type="button"
                                          onClick={() => {
                                             const input = document.getElementById(`new-${type}`) as HTMLInputElement;
                                             addOption(type, input.value);
                                             input.value = '';
                                          }}
                                          className="px-4 bg-primary/20 text-primary rounded-lg text-xs font-bold hover:bg-primary/30 transition-all shrink-0"
                                       >
                                          Añadir
                                       </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                       {(type === "plazo" ? formPlazo : type === "nivel" ? formNivel : formAvance).map((opt, i) => (
                                          <span key={i} className="bg-secondary/50 text-foreground text-[9px] font-bold py-1 px-2 rounded-md flex items-center gap-2 border border-border/40">
                                             {opt}
                                             <button type="button" onClick={() => removeOption(type, i)} className="text-muted-foreground hover:text-destructive transition-colors"><X className="w-2.5 h-2.5" /></button>
                                          </span>
                                       ))}
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>

                        <div className="space-y-4">
                           <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Icono Identificador</label>
                           <div className="grid grid-cols-4 gap-2">
                              {iconOptions.map(opt => (
                                 <label key={opt.name} className="relative group cursor-pointer">
                                    <input type="radio" name="icon" value={opt.name} defaultChecked={editingService?.icon === opt.name} className="peer hidden" />
                                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-secondary/30 border border-transparent peer-checked:border-primary peer-checked:bg-primary/10 transition-all hover:bg-secondary/50">
                                       <opt.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                       <span className="text-[8px] uppercase font-bold mt-1 opacity-60 font-body">{opt.name}</span>
                                    </div>
                                 </label>
                              ))}
                           </div>
                        </div>

                        <div className="pt-4 flex gap-4 mt-auto">
                          <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1 h-14 text-[10px] font-bold tracking-widest uppercase">Descartar</button>
                          <button type="submit" className="btn-primary flex-[2] h-14 border-none text-[10px] font-bold tracking-widest uppercase gap-2">
                             Confirmar Solución
                          </button>
                        </div>
                       </div>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Category Modal */}
        <AnimatePresence>
          {catModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg card p-8 shadow-2xl overflow-hidden">
                <h3 className="text-2xl font-display font-bold mb-6">Nueva Área de Servicio</h3>
                <form onSubmit={handleCategorySubmit} className="space-y-6">
                   <div className="space-y-2">
                      <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nombre del Área</label>
                      <input name="title" required className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" />
                   </div>
                   <div className="space-y-2">
                      <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Enfoque Estratégico</label>
                      <textarea name="description" rows={3} required className="input w-full bg-secondary/50 py-4 border-transparent focus:bg-background resize-none min-h-[100px]" />
                   </div>
                   <div className="flex gap-4 pt-2">
                      <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1 h-12 text-[10px] uppercase font-bold tracking-widest">Cancelar</button>
                      <button type="submit" className="btn-primary flex-1 h-12 border-none text-[10px] uppercase font-bold tracking-widest">Crear Área</button>
                   </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
