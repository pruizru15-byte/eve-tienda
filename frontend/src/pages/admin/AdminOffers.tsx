import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Clock,
  Tag,
  Package,
  Calendar,
  Zap,
  ArrowRight,
  TrendingUp,
  Image as ImageIcon
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { toast } from "sonner";

export default function AdminOffers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchData = async () => {
    try {
      const [offerRes, prodRes] = await Promise.all([
        fetch("http://localhost:3000/api/admin/offers", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        }),
        fetch("http://localhost:3000/api/admin/products", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        })
      ]);
      const offerData = await offerRes.json();
      const prodData = await prodRes.json();
      if (Array.isArray(offerData)) setOffers(offerData);
      if (Array.isArray(prodData)) setProducts(prodData);
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
    setEditingOffer(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const offerData = Object.fromEntries(formData.entries());

    const isEdit = !!editingOffer?.id;
    const method = isEdit ? "PUT" : "POST";
    const url = isEdit 
      ? `http://localhost:3000/api/admin/offers/${editingOffer.id}` 
      : "http://localhost:3000/api/admin/offers";

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(offerData)
      });

      if (response.ok) {
        toast.success(isEdit ? "Oferta actualizada" : "Oferta lanzada");
        handleCloseModal();
        fetchData();
      }
    } catch (error) {
      toast.error("Error al procesar la oferta");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Desactivar esta oferta relámpago?")) return;
    try {
      const response = await fetch(`http://localhost:3000/api/admin/offers/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.ok) {
        toast.success("Oferta desactivada");
        fetchData();
      }
    } catch (error) {
      toast.error("Error al desactivar");
    }
  };

  const getTimeLeft = (endDate: string) => {
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    if (diff <= 0) return "Expirada";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  const filteredOffers = offers.filter(o => 
    o.product?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);
  const paginatedOffers = filteredOffers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              Ofertas Relámpago <Zap className="w-8 h-8 text-primary fill-primary" />
            </h1>
            <p className="text-muted-foreground mt-1 text-xs tracking-widest uppercase font-bold italic">Ventas de Alta Velocidad y Tiempo Limitado</p>
          </div>
          
          <button 
            onClick={() => { setEditingOffer(null); setModalOpen(true); }}
            className="btn-primary h-12 gap-2 border-none"
          >
            <Plus className="w-5 h-5" /> Nueva Oferta
          </button>
        </header>

        <div className="mb-10 relative group max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            placeholder="Buscar por producto u oferta..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full pl-12 bg-secondary/50 h-14 border-transparent focus:bg-background"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-10">
          <AnimatePresence>
            {paginatedOffers.map((offer) => (
              <motion.div 
                key={offer.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`group relative card p-0 flex flex-col transition-all hover:-translate-y-1 hover:border-primary/50 ${!offer.is_active && 'grayscale opacity-70'}`}
              >
                <div className="aspect-[4/3] bg-secondary/30 relative overflow-hidden">
                   <img src={offer.image_url || offer.product?.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                   
                   <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] font-black italic shadow-lg flex items-center gap-1">
                        <Tag className="w-3 h-3" /> -{offer.discount}%
                      </div>
                   </div>

                   <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-[10px] font-bold flex items-center gap-2 border border-white/10">
                        <Clock className="w-3 h-3 text-primary" />
                        {getTimeLeft(offer.end_date)}
                      </div>
                   </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                   <div className="flex justify-between items-start mb-2">
                       <h3 className="text-lg font-display font-bold leading-tight uppercase group-hover:text-primary transition-colors">{offer.title}</h3>
                       <div className="flex gap-1 ml-2">
                          <button onClick={() => { setEditingOffer(offer); setModalOpen(true); }} className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-primary hover:bg-primary/20 transition-all"><Edit2 className="w-3 h-3" /></button>
                          <button onClick={() => handleDelete(offer.id)} className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:text-white hover:bg-rose-500 transition-all"><Trash2 className="w-3 h-3" /></button>
                       </div>
                   </div>
                   <p className="text-xs text-muted-foreground line-clamp-2 mb-4 italic">"{offer.description}"</p>
                   
                   <div className="mt-auto pt-4 border-t border-border/30 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                         <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground leading-none">Producto Vinculado</p>
                         <p className="text-xs font-bold truncate">{offer.product?.name || "Oferta General"}</p>
                      </div>
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
           totalItems={filteredOffers.length}
           itemsPerPage={itemsPerPage}
         />

        {/* Offer Modal */}
        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-3xl card p-10 shadow-2xl overflow-hidden">
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                       <div className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                          <Zap className="w-6 h-6 fill-current" />
                       </div>
                       <div>
                          <h3 className="text-2xl font-display font-bold">Lanzar Flash Sale</h3>
                          <p className="text-[10px] text-primary font-black uppercase tracking-widest">NovaTech Urgent Marketing</p>
                       </div>
                    </div>
                    <button onClick={handleCloseModal} className="p-2 hover:bg-secondary rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Vincular Producto</label>
                          <select name="product_id" defaultValue={editingOffer?.product_id} className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background appearance-none">
                             <option value="">Ninguno (Oferta General)</option>
                             {products.map(p => <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Título de la Oferta</label>
                          <input name="title" defaultValue={editingOffer?.title} required placeholder="Ej: LIQUIDACIÓN DE STOCK" className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background uppercase font-black tracking-tight" />
                        </div>
                    </div>

                    <div className="space-y-2">
                      <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Eslogan de Urgencia</label>
                      <input name="description" defaultValue={editingOffer?.description} required placeholder="Ej: ¡Solo hoy! Hasta agotar existencias..." className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background italic" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Descuento (%)</label>
                          <div className="relative">
                            <input type="number" name="discount" defaultValue={editingOffer?.discount} required className="input w-full pr-10 bg-secondary/50 h-14 border-transparent focus:bg-background font-display text-lg" />
                            <Zap className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Fin de la Oferta</label>
                          <div className="relative">
                            <input type="datetime-local" name="end_date" defaultValue={editingOffer?.end_date ? new Date(editingOffer.end_date).toISOString().slice(0, 16) : ''} required className="input w-full pl-10 pr-4 bg-secondary/50 h-14 border-transparent focus:bg-background" />
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                      <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">URL de Imagen Alternativa (Opcional)</label>
                      <input name="image_url" defaultValue={editingOffer?.image_url} placeholder="Si se deja vacío, usará la del producto" className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" />
                    </div>

                    <div className="pt-4 flex gap-4">
                      <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1 h-14 text-[10px] uppercase font-bold tracking-[0.2em]">Abortar</button>
                      <button type="submit" className="btn-primary flex-[2] h-14 border-none uppercase text-[10px] tracking-[0.2em] gap-2 group">
                         {editingOffer ? 'Remasterizar Oferta' : '¡Lanzar Ataque de Ventas!'}
                         <Zap className="w-4 h-4 transition-transform group-hover:scale-125 fill-current" />
                      </button>
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
