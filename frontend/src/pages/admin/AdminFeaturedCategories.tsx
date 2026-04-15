import { useEffect, useState } from "react";
import { Reorder, motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, Edit2, Trash2, X, Sparkles, Image as ImageIcon, 
  GripVertical, Save, Check, Target, Link as LinkIcon, BarChart2
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";

export default function AdminFeaturedCategories() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const imageUrl = watch("image_url");

  const fetchData = async () => {
    try {
      const [featRes, prodCatRes] = await Promise.all([
        fetch("http://localhost:3000/api/admin/featured-categories", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        }),
        fetch("http://localhost:3000/api/admin/categories", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        })
      ]);
      const featData = await featRes.json();
      const catData = await prodCatRes.json();
      setItems(Array.isArray(featData) ? featData : []);
      setCategories(Array.isArray(catData) ? catData : []);
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
        setValue("image_url", data.url);
        toast.success("Imagen subida");
      }
    } catch (error) {
      toast.error("Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const onReorder = async (newItems: any[]) => {
    setItems(newItems);
    const reorderData = newItems.map((item, index) => ({
      id: item.id,
      order: index
    }));
    
    try {
      await fetch("http://localhost:3000/api/admin/featured-categories/reorder", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ items: reorderData })
      });
    } catch (error) {
      toast.error("Error al guardar el nuevo orden");
    }
  };

  const onFormSubmit = async (data: any) => {
    const isEdit = !!editingItem;
    const method = isEdit ? "PUT" : "POST";
    const url = isEdit 
      ? `http://localhost:3000/api/admin/featured-categories/${editingItem.id}`
      : "http://localhost:3000/api/admin/featured-categories";

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
        toast.success(isEdit ? "Categoría actualizada" : "Categoría añadida al showcase");
        setModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error("Error al guardar");
    }
  };

  const openModal = (item: any = null) => {
    setEditingItem(item);
    if (item) {
      reset({
        name: item.name,
        category_id: item.category_id,
        image_url: item.image_url,
        product_count: item.product_count,
        is_active: item.is_active
      });
    } else {
      reset({
        name: "",
        category_id: "",
        image_url: "",
        product_count: 0,
        is_active: true
      });
    }
    setModalOpen(true);
  };

  const deleteItem = async (id: string) => {
    if (!confirm("¿Eliminar del showcase?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/admin/featured-categories/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        toast.success("Eliminado");
        fetchData();
      }
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-black flex items-center gap-3">
               Escaparate <Sparkles className="w-8 h-8 text-primary" />
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
              <span>Gestión de Carrusel</span>
            </div>
          </div>
          <button 
            onClick={() => openModal()}
            className="btn-primary h-12 gap-2 border-none"
          >
            <Plus className="w-5 h-5" /> Nueva Destacada
          </button>
        </header>

        <div className="card p-0 border border-border/50 overflow-hidden shadow-2xl">
          <div className="p-6 bg-secondary/20 border-b border-border/50 flex items-center justify-between">
            <h2 className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground m-0">Arrastra para reordenar el carrusel</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-primary italic">
               <Target className="w-3 h-3" /> {items.length} Categorías Activas
            </div>
          </div>

          <Reorder.Group axis="y" values={items} onReorder={onReorder} className="divide-y divide-border/20">
            {items.map((item) => (
              <Reorder.Item 
                key={item.id} 
                value={item} 
                className="bg-card/50 hover:bg-muted/50 transition-colors group cursor-default"
              >
                <div className="flex items-center gap-5 px-6 py-4">
                  <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary transition-colors">
                     <GripVertical className="w-5 h-5" />
                  </div>
                  
                  <div className="w-20 h-16 rounded-2xl bg-secondary overflow-hidden shrink-0 border border-white/5 shadow-inner">
                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-black text-sm uppercase tracking-tight">{item.name}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 mt-1 italic">
                       <LinkIcon className="w-2.5 h-2.5" /> {item.category?.name || "Sin link directo"}
                    </p>
                  </div>

                  <div className="flex items-center gap-8">
                     <div className="text-center">
                        <p className="label text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Pop</p>
                        <div className="px-3 py-1 bg-secondary rounded-lg font-mono font-bold text-xs">{item.product_count}</div>
                     </div>
                     <div className="flex items-center gap-2">
                        {item.is_active ? 
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10">Activa</span> :
                           <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest text-rose-500 bg-rose-500/10">Inactiva</span>
                        }
                     </div>
                  </div>

                  <div className="flex gap-2 ml-10">
                    <button onClick={() => openModal(item)} className="btn-secondary h-10 px-4 text-[10px] uppercase tracking-widest">Editar</button>
                    <button onClick={() => deleteItem(item.id)} className="h-10 w-10 bg-rose-500/10 text-rose-500 flex items-center justify-center rounded-xl hover:bg-rose-500 hover:text-white transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </Reorder.Item>
            ))}
            {items.length === 0 && !loading && (
              <div className="py-20 text-center">
                <Sparkles className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground font-display italic">El showcase está vacío. ¡Dale vida!</p>
              </div>
            )}
          </Reorder.Group>
        </div>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="max-w-3xl card p-8 md:p-10 border-border overflow-hidden shadow-2xl">
                <div>
                   <DialogHeader className="mb-10 text-left">
                      <DialogTitle className="text-3xl font-display font-bold flex items-center gap-3">
                         {editingItem ? "Editar Categoría" : "Nueva Categoría"} 
                      </DialogTitle>
                   </DialogHeader>

                   <form onSubmit={handleSubmit(onFormSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                      <div className="space-y-6">
                         <div className="space-y-2">
                            <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Vincular Categoría Real</label>
                            <select {...register("category_id")} className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background appearance-none">
                               <option value="">(Solo Display)</option>
                               {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nombre Display</label>
                            <input {...register("name", { required: true })} placeholder="EJ: GAMING XPERIENCE" className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" />
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                         <div className="space-y-2">
                            <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Conteo (Manual si no vincula)</label>
                            <input type="number" {...register("product_count")} className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" />
                         </div>
                      </div>

                      <div className="space-y-6 flex flex-col h-full">
                         <div className="space-y-4 flex-1">
                            <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Carga de Imagen</label>
                            <div className="flex items-center gap-4">
                               <div className="w-24 h-24 rounded-2xl bg-secondary/50 border-2 border-dashed border-border flex items-center justify-center overflow-hidden shrink-0">
                                  {imageUrl ? (
                                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                  ) : (
                                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                  )}
                               </div>
                               <div className="flex-1">
                                  <input type="file" onChange={handleImageUpload} className="hidden" id="feat-cat-image" />
                                  <label htmlFor="feat-cat-image" className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all">
                                     {uploading ? "Subiendo..." : "Seleccionar Archivo"}
                                  </label>
                                  <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest leading-relaxed">
                                    Recomendado: 500x500px.
                                  </p>
                               </div>
                            </div>
                         </div>

                         <input type="hidden" {...register("image_url", { required: true })} />

                         <div className="flex items-center gap-3 py-4">
                           <input type="checkbox" id="is_active" {...register("is_active")} className="w-4 h-4 rounded-sm border-primary text-primary focus:ring-primary bg-background cursor-pointer" />
                           <label htmlFor="is_active" className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0 cursor-pointer">Mostrar en Landing</label>
                         </div>

                         <div className="pt-2 flex gap-4 mt-auto">
                            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 h-14 text-[10px] uppercase font-bold tracking-widest">Cancelar</button>
                            <button type="submit" className="btn-primary flex-[2] h-14 border-none text-[10px] uppercase font-bold tracking-widest">
                               Guardar Showcase
                            </button>
                         </div>
                      </div>
                   </form>
                </div>
            </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
