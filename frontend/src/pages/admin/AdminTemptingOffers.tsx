import { useEffect, useState } from "react";
import { 
  Plus, Search, Edit2, Trash2, X, Sparkles, Image as ImageIcon, 
  BarChart2, MousePointer2, Target, Link as LinkIcon
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { toast } from "sonner";

export default function AdminTemptingOffers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchData = async () => {
    try {
      const [offerRes, prodRes] = await Promise.all([
        fetch("http://localhost:3000/api/admin/tempting-offers", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        }),
        fetch("http://localhost:3000/api/admin/products", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        })
      ]);
      const offerData = await offerRes.json();
      const prodData = await prodRes.json();
      setOffers(Array.isArray(offerData) ? offerData : []);
      setProducts(Array.isArray(prodData) ? prodData : []);
    } catch (error) {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     if (!e.target.files?.[0]) return;
     setUploading(true);
     const formData = new FormData();
     formData.append('image', e.target.files[0]);
     try {
       const res = await fetch("http://localhost:3000/api/admin/upload", {
         method: "POST",
         headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
         body: formData
       });
       const data = await res.json();
       if (data.url) {
         toast.success("Imagen subida");
         setEditingOffer((prev: any) => ({ ...prev, image_url: data.url }));
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
    const data = Object.fromEntries(formData.entries());
    
    if (editingOffer?.image_url) {
        data.image_url = editingOffer.image_url;
    }

    const isEdit = !!editingOffer?.id;
    const method = isEdit ? "PUT" : "POST";
    const url = isEdit 
      ? `http://localhost:3000/api/admin/tempting-offers/${editingOffer.id}` 
      : "http://localhost:3000/api/admin/tempting-offers";

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        toast.success(isEdit ? "Banner actualizado" : "Banner creado");
        setModalOpen(false);
        setEditingOffer(null);
        fetchData();
      }
    } catch (error) {
      toast.error("Error al guardar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este banner de Cosas Tentadoras?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/admin/tempting-offers/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        toast.success("Banner eliminado");
        fetchData();
      }
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  const totalPages = Math.ceil(offers.length / itemsPerPage);
  const paginatedOffers = offers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              Cosas Tentadoras <Sparkles className="w-8 h-8 text-primary" />
            </h1>
            <p className="text-muted-foreground mt-1 text-xs tracking-widest uppercase font-bold italic">Bento Grid Dinámico para la Landing</p>
          </div>
          <button 
            onClick={() => { setEditingOffer(null); setModalOpen(true); }}
            className="btn-primary h-12 gap-2 border-none"
          >
            <Plus className="w-5 h-5" /> Nuevo Banner
          </button>
        </header>

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/20">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estructura del Banner</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ubicación Producto</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Rendimiento (Clics)</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Éxito (Conv.)</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Estado</th>
                  <th className="px-6 py-5 text-right uppercase tracking-[0.2em] text-[10px] font-black pr-10">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {paginatedOffers.map(offer => (
                  <tr key={offer.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-20 h-14 rounded-2xl bg-secondary overflow-hidden shrink-0 border border-white/5 relative">
                          <img src={offer.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-1">
                             <span className="text-[7px] text-white font-black uppercase tracking-tighter opacity-80">{offer.subtitle}</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase leading-tight tracking-tight mb-1">{offer.title}</p>
                          <p className="text-[10px] font-bold text-muted-foreground italic">Botón: {offer.button_text}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                       <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-xl w-fit border border-border/50">
                          <LinkIcon className="w-3 h-3 text-primary" />
                          <span className="text-xs font-bold truncate max-w-[150px]">{offer.product?.name || "No vinculado"}</span>
                       </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                       <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20">
                          <MousePointer2 className="w-3 h-3" />
                          <span className="font-mono font-black text-sm">{offer.clicks}</span>
                       </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                       <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
                          <Target className="w-3 h-3" />
                          <span className="font-mono font-black text-sm">{offer.conversions}</span>
                       </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                       <button 
                         onClick={async () => {
                           try {
                             const res = await fetch(`http://localhost:3000/api/admin/tempting-offers/${offer.id}`, {
                               method: "PUT",
                               headers: { 
                                 "Content-Type": "application/json",
                                 "Authorization": `Bearer ${localStorage.getItem("token")}`
                               },
                               body: JSON.stringify({ is_active: !offer.is_active })
                             });
                             if (res.ok) {
                               toast.success(offer.is_active ? "Banner desactivado" : "Banner activado");
                               fetchData();
                             }
                           } catch (error) {
                             toast.error("Error al actualizar estado");
                           }
                         }}
                         className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border ${
                           offer.is_active 
                             ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white" 
                             : "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500 hover:text-white"
                         }`}
                       >
                         {offer.is_active ? "Activo" : "Inactivo"}
                       </button>
                    </td>
                    <td className="px-6 py-6 text-right pr-10">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => { setEditingOffer(offer); setModalOpen(true); }} className="p-3 bg-secondary/80 rounded-2xl hover:bg-primary hover:text-primary-foreground transition-all"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(offer.id)} className="p-3 bg-secondary/80 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {offers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                       <Sparkles className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                       <p className="text-muted-foreground font-display font-medium italic">No hay banners tentadores activos... ¿Lanzamos uno?</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <AdminPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={offers.length}
            itemsPerPage={itemsPerPage}
          />
        </div>

        {/* Dynamic Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/60 backdrop-blur-2xl" onClick={() => setModalOpen(false)} />
            <div className="relative w-full max-w-2xl card p-10 overflow-hidden shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)]">
               <div>
                  <div className="flex justify-between items-center mb-10">
                     <div className="flex items-center gap-4">
                        <div className="p-4 bg-primary text-primary-foreground rounded-2xl shadow-xl shadow-primary/20">
                           <Sparkles className="w-6 h-6 fill-current" />
                        </div>
                        <div>
                           <h3 className="text-2xl font-display font-bold">{editingOffer ? "Editar Tentación" : "Nueva Tentación"}</h3>
                           <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Configurador de Banner Persuasivo</p>
                        </div>
                     </div>
                     <button onClick={() => setModalOpen(false)} className="p-3 bg-secondary rounded-2xl hover:bg-muted transition-colors"><X /></button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-2">
                         <label className="label text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Eslabón de Categoría</label>
                         <input name="subtitle" defaultValue={editingOffer?.subtitle} required placeholder="EJ: HARDWARE" className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" />
                       </div>
                       <div className="space-y-2">
                         <label className="label text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Producto Vinculado</label>
                         <select name="product_id" defaultValue={editingOffer?.product_id} required className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background appearance-none">
                           <option value="">Seleccionar...</option>
                           {products.map(p => <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>)}
                         </select>
                       </div>
                     </div>

                     <div className="space-y-2">
                       <label className="label text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mensaje de Impacto (Título)</label>
                       <input name="title" defaultValue={editingOffer?.title} required placeholder="EJ: TU ESTACIÓN MEJOR EQUIPADA" className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background font-black uppercase tracking-tight" />
                     </div>

                     <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-2">
                         <label className="label text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Texto del Botón</label>
                         <input name="button_text" defaultValue={editingOffer?.button_text || "¡LO QUIERO!"} className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" />
                       </div>
                       <div className="space-y-2">
                          <label className="label text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Estética (Fondo/Lado)</label>
                          <div className="relative">
                             <input type="file" onChange={handleImageUpload} className="hidden" id="banner-image" />
                             <label htmlFor="banner-image" className="w-full flex items-center justify-center gap-3 bg-primary/10 text-primary h-14 border border-primary/20 rounded-2xl cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all font-black text-[10px] uppercase tracking-widest">
                                {uploading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" /> : <ImageIcon className="w-4 h-4" />}
                                {uploading ? "Codificando..." : editingOffer?.image_url ? "Imagen Lista" : "Subir Imagen"}
                             </label>
                          </div>
                       </div>
                     </div>

                     <input type="hidden" name="image_url" value={editingOffer?.image_url || ""} required />
                     
                     <div className="pt-4 flex gap-4">
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 h-14 uppercase text-[10px] font-bold tracking-widest">Cancelar</button>
                        <button type="submit" className="btn-primary flex-[2] h-14 border-none uppercase text-[10px] font-bold tracking-widest gap-3 shadow-primary/20">
                          {editingOffer ? "Remasterizar Banner" : "Lanzar al Bento Grid"}
                          <Sparkles className="w-4 h-4 fill-current" />
                        </button>
                     </div>
                  </form>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
