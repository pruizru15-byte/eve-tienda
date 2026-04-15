import { useState } from "react";
import { Plus, Trash2, GripVertical, Image as ImageIcon, Search, Check, ChevronDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { useEffect } from "react";



const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const fetchBundles = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin/bundles`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Error fetching bundles");
  return res.json();
};

const deleteBundle = async (id: string) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/admin/bundles/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Error deleting bundle");
};

export default function AdminBundles() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<any>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerUrl, setBannerUrl] = useState("");
  
  // Product Search State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { data: categories } = useQuery({
    queryKey: ["admin-categories-bundles"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Error fetching categories");
      return res.json();
    }
  });

  const { data: bundles, isLoading } = useQuery({
    queryKey: ["admin-bundles"],
    queryFn: fetchBundles
  });

  const { data: productsByCategory, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["admin-products-by-category", selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return [];
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/products?category_id=${selectedCategoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Error fetching products");
      const data = await res.json();
      return data.products || data;
    },
    enabled: !!selectedCategoryId
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/admin/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error("Error subir imagen");
      return res.json();
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem("token");
      const method = editingBundle ? "PUT" : "POST";
      const url = editingBundle ? `${API_URL}/admin/bundles/${editingBundle.id}` : `${API_URL}/admin/bundles`;
      
      const res = await fetch(url, {
        method,
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Error guardando el bundle");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bundles"] });
      toast.success("Ecosistema guardado con éxito");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Error al guardar el bundle")
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBundle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bundles"] });
      toast.success("Ecosistema eliminado");
    }
  });

  const handleOpenDialog = (bundle: any = null) => {
    if (bundle) {
      setEditingBundle(bundle);
      setTitle(bundle.title);
      setIsActive(bundle.is_active);
      setBannerUrl(bundle.image_url);
      setBannerFile(null);
      setSelectedProducts(bundle.items.map((i: any) => i.product));
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingBundle(null);
    setTitle("");
    setIsActive(true);
    setBannerUrl("");
    setBannerFile(null);
    setSelectedCategoryId("");
    setSelectedProducts([]);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || selectedProducts.length < 2) {
      toast.error("Un bundle necesita un título y al menos 2 productos.");
      return;
    }

    toast.loading("Guardando ecosistema...");
    try {
      let finalBannerUrl = bannerUrl;
      
      if (bannerFile) {
        const uploadRes = await uploadMutation.mutateAsync(bannerFile);
        finalBannerUrl = uploadRes.url;
      }

      if (!finalBannerUrl) {
        toast.dismiss();
        toast.error("Debes subir un banner.");
        return;
      }

      await saveMutation.mutateAsync({
        title,
        is_active: isActive,
        image_url: finalBannerUrl,
        items: selectedProducts.map(p => p.id)
      });
      toast.dismiss();
    } catch (e) {
      toast.dismiss();
      toast.error("Falló el guardado del ecosistema.");
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...selectedProducts];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    setSelectedProducts(newItems);
  };

  const moveDown = (index: number) => {
    if (index === selectedProducts.length - 1) return;
    const newItems = [...selectedProducts];
    [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
    setSelectedProducts(newItems);
  };

  const totalPages = Math.ceil((bundles?.length || 0) / itemsPerPage);
  const paginatedBundles = bundles?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="space-y-6">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black">Ecosistemas</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
            <span>Paquetes de Productos</span>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button onClick={() => handleOpenDialog()} className="btn-primary h-12 border-none">
              <Plus className="w-5 h-5" /> Nuevo Ecosistema
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full p-8 md:p-10 border-border">
            <DialogHeader>
              <DialogTitle>{editingBundle ? "Editar" : "Crear Nuevo"} Ecosistema</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 pt-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Título del Bundle</Label>
                  <input 
                    id="title" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Setup de Productividad" 
                    required 
                    className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background"
                  />
                </div>
                <div 
                  className="relative border-2 border-dashed border-border rounded-xl aspect-[21/9] flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer overflow-hidden group"
                  onClick={() => document.getElementById("banner-upload")?.click()}
                >
                   {bannerUrl || bannerFile ? (
                     <img 
                       src={bannerFile ? URL.createObjectURL(bannerFile) : bannerUrl} 
                       className="w-full h-full object-cover"
                       alt="Preview"
                     />
                   ) : (
                     <div className="flex flex-col items-center">
                       <ImageIcon className="w-8 h-8 text-muted-foreground mb-4" />
                       <p className="text-sm font-medium">Click para subir banner</p>
                       <p className="text-xs text-muted-foreground mt-1">Recomendado: 1920x1080px o 21:9</p>
                     </div>
                   )}
                   <Input 
                     id="banner-upload"
                     type="file" 
                     className="hidden" 
                     accept="image/*" 
                     onChange={(e) => {
                       if (e.target.files && e.target.files[0]) {
                         setBannerFile(e.target.files[0]);
                       }
                     }}
                   />
                </div>
              </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Productos <span className="opacity-50">(El 1° es Principal)</span></Label>
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">1. Selecciona Categoría</Label>
                    <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Elegir categoría..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">2. Añadir Producto</Label>
                    <Select onValueChange={(val) => {
                      const product = productsByCategory?.find((p: any) => p.id === val);
                      if (product && !selectedProducts.some(p => p.id === val)) {
                        setSelectedProducts([...selectedProducts, product]);
                      }
                    }} disabled={!selectedCategoryId}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder={selectedCategoryId ? "Buscar en esta categoría..." : "← Primero elige categoría"} />
                      </SelectTrigger>
                      <SelectContent>
                        {productsByCategory?.map((p: any) => {
                          const isSelected = selectedProducts.some(sp => sp.id === p.id);
                          return (
                            <SelectItem key={p.id} value={p.id} disabled={isSelected}>
                               <div className="flex items-center gap-2">
                                  <span>{p.name}</span>
                                  <span className="text-[10px] text-muted-foreground">${p.price}</span>
                               </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                
                <div className="space-y-2 border rounded-xl divide-y bg-background">
                  {selectedProducts.length === 0 ? (
                    <div className="p-4 flex flex-col items-center text-muted-foreground">
                      <p className="text-sm">No hay productos seleccionados.</p>
                      <p className="text-xs">El primer producto que añadas ocupará la tarjeta principal.</p>
                    </div>
                  ) : (
                    selectedProducts.map((p, index) => (
                      <div key={p.id} className="p-3 flex items-center justify-between bg-card hover:bg-muted/50 group">
                        <div className="flex items-center gap-4">
                           <div className="flex flex-col">
                             <Button type="button" variant="ghost" size="icon" className="h-4 w-4" onClick={() => moveUp(index)} disabled={index === 0}>▲</Button>
                             <Button type="button" variant="ghost" size="icon" className="h-4 w-4" onClick={() => moveDown(index)} disabled={index === selectedProducts.length - 1}>▼</Button>
                           </div>
                           <img src={p.image_url} className="w-10 h-10 object-cover rounded-md" />
                           {index === 0 && <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded font-bold uppercase">Principal</span>}
                           <span className="text-sm font-medium">{p.name}</span>
                        </div>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => setSelectedProducts(selectedProducts.filter(x => x.id !== p.id))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-6 flex flex-col h-full">
                <div className="space-y-4">
                  <Label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Imagen del Banner</Label>
                  <div 
                    className="relative border-2 border-dashed border-border rounded-[24px] aspect-[21/9] flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer overflow-hidden group bg-secondary/20"
                    onClick={() => document.getElementById("banner-upload")?.click()}
                  >
                     {bannerUrl || bannerFile ? (
                       <img 
                         src={bannerFile ? URL.createObjectURL(bannerFile) : bannerUrl} 
                         className="w-full h-full object-cover"
                         alt="Preview"
                       />
                     ) : (
                       <div className="flex flex-col items-center">
                         <ImageIcon className="w-8 h-8 text-muted-foreground mb-4" />
                         <p className="text-sm font-bold">Click para subir banner</p>
                         <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest leading-relaxed">Recomendado: 1920x1080px o 21:9</p>
                       </div>
                     )}
                     <input 
                       id="banner-upload"
                       type="file" 
                       className="hidden" 
                       accept="image/*" 
                       onChange={(e) => {
                         if (e.target.files && e.target.files[0]) {
                           setBannerFile(e.target.files[0]);
                         }
                       }}
                     />
                  </div>
                </div>

                <div className="flex items-center gap-3 py-4">
                  <input type="checkbox" name="active" id="active" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 rounded-sm border-primary text-primary focus:ring-primary bg-background cursor-pointer" />
                  <Label htmlFor="active" className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0 cursor-pointer">Paquete Activo</Label>
                </div>

                <div className="pt-2 flex gap-4 mt-auto">
                  <button type="button" onClick={() => setIsDialogOpen(false)} className="btn-secondary flex-1 h-14">Cancelar</button>
                  <button type="submit" className="btn-primary flex-[2] h-14 border-none text-[10px] uppercase font-bold tracking-widest">Guardar Ecosistema</button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {isLoading ? (
          <div className="col-span-full">Cargando ecosistemas...</div>
        ) : paginatedBundles && paginatedBundles.length > 0 ? (
          paginatedBundles.map((bundle: any) => (
             <div key={bundle.id} className="card p-0 overflow-hidden shadow-xl border-border/50 flex flex-col">
                <div className="relative aspect-video">
                  <img src={bundle.image_url} className="w-full h-full object-cover" alt="Banner" />
                  <div className="absolute top-4 right-4 flex gap-2">
                     <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest ${bundle.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                       {bundle.is_active ? 'Activo' : 'Inactivo'}
                     </span>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-lg font-bold font-display mb-3">{bundle.title}</h3>
                  <div className="flex gap-1.5 mb-5">
                    {bundle.items.slice(0,4).map((item: any, idx: number) => (
                      <div key={item.id} className="relative w-10 h-10 rounded-lg border bg-muted overflow-hidden">
                         <img src={item.product.image_url} className="w-full h-full object-cover" />
                         {idx === 0 && <div className="absolute bottom-0 inset-x-0 bg-primary/80 text-[6px] text-primary-foreground font-bold text-center uppercase tracking-widest">Ppal</div>}
                      </div>
                    ))}
                    {bundle.items.length > 4 && (
                      <div className="w-10 h-10 rounded-lg border bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                        +{bundle.items.length - 4}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button className="btn-secondary flex-1 h-10 text-[10px] uppercase tracking-widest" onClick={() => handleOpenDialog(bundle)}>Editar</button>
                    <button className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors" onClick={() => {
                      if (confirm("¿Seguro que quieres eliminar este ecosistema?")) {
                        deleteMutation.mutate(bundle.id);
                      }
                    }}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
             </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/50 rounded-2xl border border-dashed border-border/50">
            No tienes ningún ecosistema creado. ¡Crea el primero usando el botón de arriba!
          </div>
        )}
      </div>
      <AdminPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={bundles?.length || 0}
        itemsPerPage={itemsPerPage}
      />
        </div>
      </main>
    </div>
  );
}
