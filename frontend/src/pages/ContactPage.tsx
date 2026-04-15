import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Instagram, Twitter, Linkedin, Github, Users, Shield, Target, Loader2, Facebook } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { getCompanySettings, sendContactMessage, type CompanySettings } from "@/services/settingsService";

const ContactPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSending, setIsSending] = useState(false);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getCompanySettings();
      setSettings(data);
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      const token = localStorage.getItem("token") || undefined;
      await sendContactMessage(formData, token);
      toast({
        title: "Mensaje Enviado",
        description: "Gracias por contactarnos. Te responderemos pronto.",
      });
      setFormData({ name: "", email: "", message: "" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al enviar",
        description: error.message || "No se pudo enviar el mensaje ahora.",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  // Helper to choose the right icon for social
  const socialIcons: Record<string, any> = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
    github: Github
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          
          {/* Section: Who We Are */}
          <section className="mb-32">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                Nosotros
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
                {settings?.about_innovation || "Innovación con Propósito"}
              </h1>
              <p className="text-muted-foreground text-lg italic">
                "{settings?.about_innovation_text || "Construimos el futuro de tu negocio con pasión y excelencia técnica."}"
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Users, title: settings?.about_team || "Equipo", text: settings?.about_team_text },
                { icon: Target, title: settings?.about_mission || "Misión", text: settings?.about_mission_text },
                { icon: Shield, title: settings?.about_values || "Valores", text: settings?.about_values_text },
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="card bg-secondary/20 hover:bg-primary/5 hover:border-primary/20 text-center group p-8"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Section: Contact Form */}
          <section className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              
              {/* Left: Info & Socials */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-12"
              >
                <div>
                  <h2 className="text-3xl font-display font-bold mb-6 text-primary">¿Tienes un Proyecto?</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Hablemos de cómo podemos transformar tus ideas en realidad digital. Nuestro equipo está listo para escucharte.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="card flex items-center gap-6 group hover:border-primary/30 p-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Escríbenos</p>
                      <p className="font-medium">{settings?.contact_email}</p>
                    </div>
                  </div>

                  <div className="card flex items-center gap-6 group hover:border-primary/30 p-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Llámanos</p>
                      <p className="font-medium">{settings?.contact_phone}</p>
                    </div>
                  </div>

                  <div className="card flex items-center gap-6 group hover:border-primary/30 p-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ubicación</p>
                      <p className="font-medium">{settings?.contact_location}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Nuestras Redes Sociales</p>
                  <div className="flex gap-4">
                    {[
                      { icon: Facebook, url: settings?.social_facebook },
                      { icon: Instagram, url: settings?.social_instagram },
                      { icon: Twitter, url: settings?.social_twitter },
                      { icon: Linkedin, url: settings?.social_linkedin },
                      { icon: Github, url: settings?.social_github }
                    ].map((platform, idx) => (
                      platform.url && platform.url !== "#" ? (
                        <motion.a 
                          key={idx}
                          href={platform.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.1, y: -4 }}
                          whileTap={{ scale: 0.9 }}
                          className="card flex items-center justify-center p-0 w-12 h-12 hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-lg"
                        >
                          <platform.icon className="w-5 h-5" />
                        </motion.a>
                      ) : null
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Right: Form */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="card bg-secondary/10 backdrop-blur-xl shadow-2xl relative overflow-hidden p-8 md:p-12"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Send className="w-48 h-48" />
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6 relative">
                  <div className="space-y-2">
                    <label className="label">Nombre Completo</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Ej: Juan Pérez"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="input bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="label">Correo Electrónico</label>
                    <input 
                      required
                      type="email" 
                      placeholder="juan@ejemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="input bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="label">Tu Mensaje</label>
                    <textarea 
                      required
                      rows={4} 
                      placeholder="Cuéntanos sobre tu proyecto o duda..."
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="input bg-background resize-none"
                    ></textarea>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSending}
                    className="btn-primary w-full py-5 text-lg shadow-xl shadow-primary/20 flex gap-3 justify-center disabled:opacity-50"
                  >
                    {isSending ? "Enviando..." : "Enviar Mensaje"}
                    <Send className={`w-5 h-5 ${isSending ? 'animate-ping' : ''}`} />
                  </motion.button>
                </form>
              </motion.div>

            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
