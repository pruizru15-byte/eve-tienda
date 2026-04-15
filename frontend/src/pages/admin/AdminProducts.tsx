import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  ChevronRight,
  Filter,
  Image as ImageIcon,
  TrendingUp,
  AlertTriangle,
  Boxes,
  DollarSign
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { toast } from "sonner";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/admin/products", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast.error("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/admin/categories", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview
    setImagePreview(URL.createObjectURL(file));

    // Upload to server
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
        toast.success("Imagen subida con éxito");
        setEditingProduct((prev: any) => ({ ...prev, image_url: data.url }));
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
    const productData: any = Object.fromEntries(formData.entries());
    
    // Process checkbox
    productData.featured = formData.get("featured") === "on";
    productData.is_active = formData.get("is_active") === "on";

    const isEdit = !!editingProduct?.id;
    const method = isEdit ? "PUT" : "POST";
    const url = isEdit 
      ? `http://localhost:3000/api/admin/products/${editingProduct.id}` 
      : "http://localhost:3000/api/admin/products";

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        toast.success(editingProduct?.id ? "Producto actualizado" : "Producto creado");
        handleCloseModal();
        fetchProducts();
      } else {
        toast.error("Hubo un error al guardar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setImagePreview(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      const response = await fetch(`http://localhost:3000/api/admin/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });

      if (response.ok) {
        toast.success("Producto eliminado");
        fetchProducts();
      }
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Métricas estratégicas
  const totalProductsCount = products.length;
  const activeProductsCount = products.filter(p => p.is_active).length;
  const lowStockCount = products.filter(p => (p.stock || 0) <= (p.min_stock_alert || 5)).length;
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * (p.stock || 0)), 0);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-black">Gestión de Productos</h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
              <span>Control de Inventario</span>
            </div>
          </div>
          
          <button 
            onClick={() => { setEditingProduct(null); setImagePreview(null); setModalOpen(true); }}
            className="btn-primary h-12"
          >
            <Plus className="w-5 h-5" /> Nuevo Producto
          </button>
        </header>

        {/* Tarjetas Estratégicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Catálogo', value: totalProductsCount, icon: Package, color: 'blue' },
            { label: 'Unidades Activas', value: activeProductsCount, icon: Boxes, color: 'emerald' },
            { label: 'Alerta de Stock', value: lowStockCount, icon: AlertTriangle, color: 'rose', alert: lowStockCount > 0 },
            { label: 'Valor Estimado', value: `S/. ${totalInventoryValue.toLocaleString()}`, icon: TrendingUp, color: 'amber' },
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
                  <h3 className="text-3xl font-display font-black tracking-tighter">{stat.value}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              placeholder="Buscar por nombre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full pl-12 bg-secondary/50 h-14 border-transparent focus:bg-background"
            />
          </div>
          <button className="btn-secondary h-14">
            <Filter className="w-4 h-4" /> Categorías
          </button>
        </div>

        {/* Products Table */}
        <div className="card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-secondary/30 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Producto</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Categoría</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Precio</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stock</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estado</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-secondary/50 rounded w-full" /></td>
                  </tr>
                ))
              ) : paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-secondary/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center overflow-hidden border border-border/50">
                        {product.image_url ? (
                          <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold leading-none mb-1">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">ID: {product.id.split('-')[0]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-widest">
                      {product.category?.name || 'S/C'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-display font-medium text-sm">
                    S/. {product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-bold px-2.5 py-1 rounded-sm tracking-widest ${
                      product.stock <= product.min_stock_alert 
                        ? "bg-rose-500/10 text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.2)]" 
                        : "bg-emerald-500/10 text-emerald-500"
                    }`}>
                      {product.stock} UNIDADES
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {product.featured && (
                        <span className="inline-flex items-center w-max gap-1.5 px-2.5 py-1 rounded-sm text-[9px] font-bold text-amber-500 bg-amber-500/10 uppercase tracking-widest">
                          <Check className="w-3 h-3" /> Destacado
                        </span>
                      )}
                      <span className={`inline-flex items-center w-max gap-1.5 px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest ${product.is_active ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"}`}>
                        {product.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} {product.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingProduct(product); setModalOpen(true); }}
                        className="p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <AdminPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredProducts.length}
            itemsPerPage={itemsPerPage}
          />
        </div>

        {/* Product Modal */}
        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={handleCloseModal}
                className="absolute inset-0 bg-background/80 backdrop-blur-xl" 
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-4xl card overflow-hidden shadow-2xl"
              >
                <div className="p-8 md:p-10">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-display font-bold">
                      {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                    </h3>
                    <button onClick={handleCloseModal} className="p-2 hover:bg-secondary rounded-xl transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left Column: Core Data */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nombre</label>
                        <input name="name" defaultValue={editingProduct?.name} required className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Categoría</label>
                        <select name="category_id" defaultValue={editingProduct?.category_id} required className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background appearance-none">
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Precio Compra</label>
                          <input type="number" step="0.01" name="purchase_price" defaultValue={editingProduct?.purchase_price} required className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" />
                        </div>
                        <div className="space-y-2">
                          <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Precio Venta</label>
                          <input type="number" step="0.01" name="price" defaultValue={editingProduct?.price} required className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Precio Unit.</label>
                          <input type="number" step="0.01" name="unit_price" defaultValue={editingProduct?.unit_price} required className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" />
                        </div>
                        <div className="space-y-2">
                          <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Precio Mayor</label>
                          <input type="number" step="0.01" name="wholesale_price" defaultValue={editingProduct?.wholesale_price} required className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Stock Actual</label>
                          <input type="number" name="stock" defaultValue={editingProduct?.stock} required className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" />
                        </div>
                        <div className="space-y-2">
                          <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Alerta Stock Mín.</label>
                          <input type="number" name="min_stock_alert" defaultValue={editingProduct?.min_stock_alert} required className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" />
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Media, Description, States */}
                    <div className="space-y-6 flex flex-col h-full">
                      <div className="space-y-4">
                          <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Imagen del Producto</label>
                          <div className="flex items-center gap-4">
                            <div className="w-24 h-24 rounded-2xl bg-secondary/50 border-2 border-dashed border-border flex items-center justify-center overflow-hidden shrink-0">
                              {imagePreview || editingProduct?.image_url ? (
                                <img src={imagePreview || editingProduct?.image_url} alt="Preview" className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1">
                              <input 
                                type="file" 
                                onChange={handleImageChange}
                                className="hidden" 
                                id="image-upload" 
                                accept="image/*"
                              />
                              <label 
                                htmlFor="image-upload"
                                className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all"
                              >
                                {uploading ? "Subiendo..." : "Seleccionar Archivo"}
                              </label>
                              <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest leading-relaxed">
                                Recomendado: 800x800px. Máx 5MB.
                              </p>
                            </div>
                          </div>
                        <input type="hidden" name="image_url" value={editingProduct?.image_url || ""} />
                      </div>

                      <div className="space-y-2 flex-1 flex flex-col">
                        <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Descripción Comercial</label>
                        <textarea name="description" defaultValue={editingProduct?.description} required className="input flex-1 w-full p-4 bg-secondary/50 rounded-xl border border-transparent focus:bg-background resize-none min-h-[120px]" />
                      </div>

                      <div className="flex items-center gap-8 py-2">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" name="featured" id="featured" defaultChecked={editingProduct?.featured} className="w-4 h-4 rounded-sm border-primary text-primary focus:ring-primary bg-background cursor-pointer" />
                          <label htmlFor="featured" className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0 cursor-pointer">Destacar</label>
                        </div>
                        <div className="flex items-center gap-3">
                          <input type="checkbox" name="is_active" id="is_active" defaultChecked={editingProduct === null ? true : editingProduct?.is_active} className="w-4 h-4 rounded-sm border-primary text-primary focus:ring-primary bg-background cursor-pointer" />
                          <label htmlFor="is_active" className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0 cursor-pointer">Activo</label>
                        </div>
                      </div>

                      <div className="pt-2 flex gap-4 mt-auto">
                        <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1 h-14">Cancelar</button>
                        <button type="submit" className="btn-primary flex-[2] h-14 border-none text-[10px] uppercase font-bold tracking-widest">Guardar Cambios</button>
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
