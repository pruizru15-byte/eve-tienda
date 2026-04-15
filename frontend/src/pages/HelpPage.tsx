import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Scale, Handshake, FileText, CheckCircle2, Info, ArrowRight, BookOpen, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { helpService, HelpSection } from "@/services/helpService";

const HelpPage = () => {
  const [sections, setSections] = useState<HelpSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<HelpSection | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [userAccepted, setUserAccepted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (storedUser?.terms_accepted) {
      setUserAccepted(true);
    }
    loadSections();
  }, []);

  const handleAcceptTerms = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Debes iniciar sesión para aceptar los términos y condiciones.", {
        description: "Solo usuarios autenticados pueden formalizar este acuerdo."
      });
      return;
    }

    try {
      setIsAccepting(true);
      const response = await helpService.acceptTerms();
      
      // Actualizar localStorage para reflejar el cambio
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ 
        ...storedUser, 
        terms_accepted: true,
        terms_accepted_at: response.user?.terms_accepted_at 
      }));
      
      setUserAccepted(true);
      
      toast.success("¡Acuerdo Formalizado!", {
        description: "Has aceptado los Términos y Condiciones de NovaTech con éxito."
      });
    } catch (error: any) {
      toast.error(error.message || "Error al procesar el acuerdo");
    } finally {
      setIsAccepting(false);
    }
  };

  const loadSections = async () => {
    try {
      const data = await helpService.getPublicSections();
      setSections(data);
    } catch (error) {
      console.error("Error al cargar ayuda:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('acuerdo') || t.includes('handshake')) return Handshake;
    if (t.includes('privacidad') || t.includes('seguridad')) return ShieldAlert;
    if (t.includes('reglas') || t.includes('legal')) return Scale;
    if (t.includes('propiedad') || t.includes('intelectual')) return FileText;
    return BookOpen;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              Centro de Ayuda
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              Términos y <span className="text-primary">Condiciones</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Sabemos que leer esto suele ser aburrido, así que lo hicimos bonito y fácil de entender. Todo legal, todo transparente, todo chevere.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {loading ? (
              // Skeleton loaders
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="card h-[280px] animate-pulse bg-secondary/10" />
              ))
            ) : sections.length > 0 ? (
              sections.map((section, idx) => {
                const Icon = getIcon(section.title);
                return (
                  <motion.div 
                    key={section.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setSelectedSection(section)}
                    className="card p-8 group relative overflow-hidden cursor-pointer hover:border-primary/30"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
                      <Icon className="w-32 h-32" />
                    </div>
                    
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/5 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="w-7 h-7" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4">{section.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                      {section.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary opacity-60 group-hover:opacity-100 transition-opacity">
                      Leer detalle legal <ArrowRight className="w-4 h-4" />
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                No hay secciones de ayuda disponibles por el momento.
              </div>
            )}
          </div>

          {!userAccepted && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card p-10 bg-primary/5 border-primary/20 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-4">¿Te parece justo?</h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  Nuestro objetivo es que tu experiencia sea perfecta. Si tienes alguna duda sobre estos términos, no dudes en contactarnos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={handleAcceptTerms}
                    disabled={isAccepting}
                    className="btn-primary px-8 py-3 text-lg rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed gap-2"
                  >
                    {isAccepting ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : null}
                    Acepto los Términos
                  </button>
                  <div 
                    onClick={() => sections[0] && setSelectedSection(sections[0])}
                    className="flex items-center gap-2 px-8 py-4 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <Info className="w-4 h-4" /> Ver versión completa (Legales)
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </main>

      <Footer />

      {/* Modal de Detalle Legal */}
      <AnimatePresence>
        {selectedSection && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedSection(null)} 
              className="absolute inset-0 bg-background/80 backdrop-blur-xl" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="relative w-full max-w-3xl glass card p-0 border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-border/50 flex justify-between items-center bg-secondary/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    {(() => {
                      const Icon = getIcon(selectedSection.title);
                      return <Icon className="w-6 h-6" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold">{selectedSection.title}</h3>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Marco Legal NovaTech</p>
                  </div>
                </div>
                <button onClick={() => setSelectedSection(null)} className="p-2 hover:bg-secondary rounded-xl transition-colors text-muted-foreground hover:text-foreground">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar">
                <div className="prose prose-invert max-w-none">
                  <div 
                    className="text-muted-foreground leading-relaxed text-lg space-y-6"
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {selectedSection.content}
                  </div>
                </div>
                
                <div className="mt-12 p-8 rounded-3xl bg-primary/5 border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h4 className="font-bold mb-1">¿Deseas una copia?</h4>
                    <p className="text-xs text-muted-foreground">Puedes imprimir estos términos para tu registro personal.</p>
                  </div>
                  <button 
                    onClick={() => window.print()}
                    className="btn-secondary rounded-xl text-xs uppercase tracking-widest"
                  >
                    Imprimir Documento
                  </button>
                </div>
              </div>
              
              <div className="p-6 bg-secondary/10 border-t border-border/50 text-center">
                <button 
                  onClick={() => setSelectedSection(null)}
                  className="btn-primary px-10 py-3 rounded-xl uppercase text-xs tracking-widest shadow-lg shadow-primary/20"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HelpPage;
