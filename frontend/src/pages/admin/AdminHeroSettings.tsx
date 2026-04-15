import { useState, useEffect } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useAdminHeroSettings, useUpdateHeroMode, useToggleProductHero } from "@/hooks/useHeroBanner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { AdminPagination } from "../../components/admin/AdminPagination";

export default function AdminHeroSettings() {
  const { data: settings, isLoading: loadingSettings } = useAdminHeroSettings();
  const updateModeParams = useUpdateHeroMode();
  const toggleHeroProduct = useToggleProductHero();
  const { toast } = useToast();

  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const mode = settings?.hero_mode || "AUTO";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/admin/products`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setProducts(data);
        }
      } catch (e) {
        console.error("Error cargando productos", e);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const handleModeChange = async (checked: boolean) => {
    const newMode = checked ? "MANUAL" : "AUTO";
    try {
        await updateModeParams.mutateAsync(newMode);
        toast({ title: "Modo Hero Layout Actualizado", description: `El carrusel ahora está en modo ${newMode}.` });
    } catch (error) {
        toast({ title: "Error", description: "No se pudo actualizar el modo.", variant: "destructive" });
    }
  };

  const handleToggleProduct = async (id: string, isHero: boolean) => {
      try {
          await toggleHeroProduct.mutateAsync({ id, isHero });
          setProducts(products.map(p => p.id === id ? { ...p, is_hero_carousel: isHero } : p));
          toast({ title: "Producto Actualizado", description: isHero ? "Agregado al Hero Banner" : "Removido del Hero Banner" });
      } catch (error) {
          toast({ title: "Error", description: "No se pudo actualizar el producto.", variant: "destructive" });
      }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const manualCount = products.filter(p => p.is_hero_carousel).length;

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-display font-bold">Configuración del Hero Banner</h2>
          <p className="text-muted-foreground mt-2">Controla qué productos aparecen en el carrusel interactivo de la página principal.</p>
        </div>

        {loadingSettings ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="p-6 bg-card border rounded-xl flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <Label className="text-lg font-bold">Modo del Carrusel</Label>
              <p className="text-sm text-muted-foreground">
                Automático escoge los más vendidos. Manual te permite elegir (actualmente {manualCount} elegidos).
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{mode === "AUTO" ? "Automático" : "Manual"}</span>
              <Switch 
                 checked={mode === "MANUAL"} 
                 onCheckedChange={handleModeChange} 
              />
            </div>
          </div>
        )}

        <div className={`space-y-6 transition-opacity duration-300 ${mode !== "MANUAL" ? "opacity-50 pointer-events-none" : ""}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Selección de Productos</h3>
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loadingProducts ? (
              <div className="space-y-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
          ) : (
            <>
              <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4 font-medium">Producto</th>
                      <th className="px-6 py-4 font-medium">Categoría</th>
                      <th className="px-6 py-4 font-medium">Rating</th>
                      <th className="px-6 py-4 font-medium text-right">Hero Banner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginatedProducts.map(product => (
                      <tr key={product.id} className="hover:bg-muted/30 transition-colors text-xs">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-md object-cover border" />
                          <span className="font-bold">{product.name}</span>
                        </td>
                        <td className="px-6 py-4">
                           <span className="bg-secondary px-2 py-1 rounded text-[10px] uppercase font-black">{product.category?.name || 'Genérica'}</span>
                        </td>
                        <td className="px-6 py-4 font-bold">{product.rating.toFixed(1)}⭐</td>
                        <td className="px-6 py-4 text-right">
                          <Switch 
                             checked={!!product.is_hero_carousel} 
                             onCheckedChange={(c) => handleToggleProduct(product.id, c)}
                          />
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No se encontraron productos</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <AdminPagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredProducts.length}
                itemsPerPage={itemsPerPage}
              />
            </>
          )}
        </div>
      </div>
     </main>
    </div>
  );
}
