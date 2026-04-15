import React, { useEffect } from 'react';
import { useServices } from '../hooks/useServices';
import { SearchBar } from '../components/services/SearchBar';
import { CategorySelector } from '../components/services/CategorySelector';
import { PriceSlider } from '../components/services/PriceSlider';
import { ServiceGrid } from '../components/services/ServiceGrid';
import { Sparkles, SlidersHorizontal, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Capa de Presentación - Vista Principal
 * Arquitectura Limpia: Consume el Custom Hook y renderiza la UI modularizada.
 * No contiene lógica de negocio incrustada.
 */
const ServicesPage: React.FC = () => {
  const { 
    services, 
    categories, 
    loading, 
    error, 
    filters, 
    updateSearch, 
    updateCategory, 
    updateMaxPrice 
  } = useServices();

  const [companySettings, setCompanySettings] = React.useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchSettings = async () => {
      try {
        const { getCompanySettings } = await import('../services/settingsService');
        const settings = await getCompanySettings();
        setCompanySettings(settings);
      } catch (err) {
        console.error("Error loading company settings", err);
      }
    };
    fetchSettings();
  }, []);

  const handleCustomProjectClick = () => {
    const phone = companySettings?.whatsapp_main_number || '1234567890';
    const message = encodeURIComponent("¡Hola! Me gustaría consultar sobre un proyecto a medida que no está en el catálogo.");
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 flex flex-col">
      <Navbar />
      
      {/* Hero / Header Section */}
      <header className="pt-40 pb-16 px-6 lg:px-8 max-w-7xl mx-auto w-full relative overflow-hidden">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between border-b border-border/40 pb-12 relative z-10">
          <div className="space-y-6 max-w-3xl">
            <div className="card inline-flex items-center gap-2 text-primary font-black text-[10px] tracking-[0.3em] uppercase px-5 py-2.5 backdrop-blur-3xl animate-in fade-in slide-in-from-left-4 duration-700 w-fit">
              <Sparkles className="h-4 w-4" /> Soluciones NovaTech Premium
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-foreground leading-[0.85] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              Eleva tu <span className="text-primary italic relative">Visión<span className="absolute bottom-4 left-0 w-full h-2 bg-primary/20 -rotate-2 -z-10"></span></span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-xl leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              Catálogo exclusivo de servicios tecnológicos y académicos diseñados para la excelencia.
            </p>
          </div>
          
          <div className="w-full md:w-auto animate-in fade-in zoom-in-95 duration-700 delay-300">
            <SearchBar 
              value={filters.search || ''} 
              onChange={updateSearch} 
            />
          </div>
        </div>
        
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-0" />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-8 flex flex-col lg:flex-row gap-16 py-12">
        
        {/* Professional Filters Sidebar */}
        <aside className="w-full lg:w-80 space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="space-y-10 group">
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                <SlidersHorizontal className="w-4 h-4" /> Categorías de Expertos
              </div>
              <CategorySelector 
                categories={categories} 
                selectedId={filters.categoryId || 'all'} 
                onSelect={updateCategory} 
              />
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                💰 Escala de Inversión
              </div>
              <PriceSlider 
                max={5000} 
                value={filters.maxPrice || 2500} 
                onChange={updateMaxPrice} 
              />
            </section>
          </div>

          <div className="card bg-gradient-to-br from-secondary/40 to-muted/20 shadow-inner p-8">
            <h4 className="font-bold text-lg mb-2">{companySettings?.custom_project_title || "¿Necesitas algo a medida?"}</h4>
            <p className="text-sm text-muted-foreground font-medium mb-6">
              {companySettings?.custom_project_text || "Contáctanos para proyectos personalizados que no encuentras en nuestro catálogo."}
            </p>
            <button 
              onClick={handleCustomProjectClick}
              className="text-primary font-black text-xs uppercase tracking-widest hover:underline decoration-2 underline-offset-8 transition-all"
            >
              Consultar ahora &rarr;
            </button>
          </div>
        </aside>

        {/* Dynamic Results Grid */}
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {error && (
            <Alert variant="destructive" className="mb-12 rounded-3xl border-2 py-8 bg-destructive/5 backdrop-blur-md overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
              <Info className="h-6 w-6" />
              <AlertTitle className="text-xl font-black mb-1">Error de Sistema</AlertTitle>
              <AlertDescription className="text-base font-bold opacity-80">{error}</AlertDescription>
            </Alert>
          )}

          <div className="mb-8 flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">
              Mostrando <span className="text-foreground font-black">{services.length}</span> resultados premium
            </div>
          </div>

          <ServiceGrid 
            services={services} 
            loading={loading} 
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ServicesPage;
