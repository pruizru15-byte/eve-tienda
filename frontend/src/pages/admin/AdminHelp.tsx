import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  FileText,
  Eye,
  EyeOff,
  GripVertical,
  BookOpen
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { toast } from "sonner";
import { helpService, HelpSection } from "@/services/helpService";

export default function AdminHelp() {
  const [sections, setSections] = useState<HelpSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HelpSection | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await helpService.getAllSections();
      setSections(data);
    } catch (error) {
      toast.error("Error al cargar secciones de ayuda");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingSection(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = Object.fromEntries(formData.entries());
    
    data.is_active = formData.get("is_active") === "on";
    data.order_index = parseInt(data.order_index) || 0;

    try {
      if (editingSection) {
        await helpService.updateSection(editingSection.id, data);
        toast.success("Sección actualizada con éxito");
      } else {
        await helpService.createSection(data);
        toast.success("Sección creada con éxito");
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      toast.error("Error al guardar la sección");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta sección de ayuda? Esta acción no se puede deshacer.")) return;
    try {
      await helpService.deleteSection(id);
      toast.success("Sección eliminada");
      fetchData();
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  const filteredSections = sections.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredSections.length / itemsPerPage);
  const paginatedSections = filteredSections.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-display font-bold">Centro de Ayuda</h1>
            <p className="text-muted-foreground mt-1 text-xs tracking-widest uppercase font-bold">Gestión de Términos, Condiciones y Documentación</p>
          </div>
          
          <button 
            onClick={() => { setEditingSection(null); setModalOpen(true); }}
            className="btn-primary h-12 gap-2 border-none"
          >
            <Plus className="w-5 h-5" /> Nueva Sección
          </button>
        </header>

        <div className="mb-8 relative group max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            placeholder="Buscar por título o descripción..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background pl-12"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedSections.map((section) => (
              <motion.div 
                key={section.id}
                layout
                className={`card flex items-center gap-6 group hover:border-primary/30 ${!section.is_active && 'opacity-60 bg-secondary/10'}`}
              >
                <div className="hidden md:flex items-center text-muted-foreground/30 group-hover:text-primary/40 transition-colors">
                  <GripVertical className="w-6 h-6" />
                </div>

                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold truncate">{section.title}</h3>
                    {!section.is_active && (
                      <span className="text-[8px] font-black uppercase tracking-widest bg-muted text-muted-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
                        <EyeOff className="w-2 h-2" /> Oculto
                      </span>
                    )}
                    {section.is_active && (
                      <span className="text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Eye className="w-2 h-2" /> Visible
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{section.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden lg:flex flex-col items-end mr-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Orden: {section.order_index}</span>
                    <span>Modificado: {new Date(section.updated_at || "").toLocaleDateString()}</span>
                  </div>
                  <button 
                    onClick={() => { setEditingSection(section); setModalOpen(true); }} 
                    className="p-3 rounded-xl bg-secondary/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(section.id)} 
                    className="p-3 rounded-xl bg-secondary/50 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}

            {filteredSections.length === 0 && (
              <div className="text-center py-20 card border-dashed border-border">
                <p className="text-muted-foreground">No se encontraron secciones que coincidan con tu búsqueda.</p>
              </div>
            )}
            
            <AdminPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredSections.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}

        {/* Modal para Crear/Editar */}
        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.9, opacity: 0, y: 20 }} 
                className="relative w-full max-w-3xl card p-0 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-8 border-b border-border/50 flex justify-between items-center bg-secondary/20">
                  <div>
                    <h3 className="text-2xl font-display font-bold">{editingSection ? "Editar Sección" : "Nueva Sección de Ayuda"}</h3>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Configuración de Contenido Dinámico</p>
                  </div>
                  <button onClick={handleCloseModal} className="p-2 hover:bg-secondary rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3 space-y-2">
                      <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Título de la Sección</label>
                      <input 
                        name="title" 
                        defaultValue={editingSection?.title} 
                        required 
                        placeholder="Ej: Privacidad y Datos" 
                        className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Orden Visual</label>
                      <input 
                        name="order_index" 
                        type="number" 
                        defaultValue={editingSection?.order_index ?? 0} 
                        required 
                        className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Resumen / Descripción Corta (Se muestra en la tarjeta)</label>
                    <input 
                      name="description" 
                      defaultValue={editingSection?.description} 
                      required 
                      placeholder="Una breve explicación de lo que trata esta sección..." 
                      className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Contenido Legal Completo (Markdown / HTML permitido)</label>
                    <textarea 
                      name="content" 
                      defaultValue={editingSection?.content} 
                      rows={10} 
                      required 
                      className="input w-full bg-secondary/50 py-4 border-transparent focus:bg-background resize-none min-h-[160px] font-mono text-sm leading-relaxed" 
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${editingSection?.is_active !== false ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {editingSection?.is_active !== false ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold">Estado de Visibilidad</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Define si los clientes pueden ver esta sección</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        name="is_active" 
                        type="checkbox" 
                        defaultChecked={editingSection ? editingSection.is_active : true} 
                        className="sr-only peer" 
                      />
                      <div className="w-14 h-7 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1 h-14 text-[10px] uppercase font-bold tracking-widest">
                      Cancelar
                    </button>
                    <button type="submit" className="btn-primary flex-[2] h-14 border-none text-[10px] uppercase font-bold tracking-widest shadow-lg shadow-primary/20 gap-2">
                      <Check className="w-5 h-5" /> {editingSection ? "Guardar Cambios" : "Publicar Sección"}
                    </button>
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
