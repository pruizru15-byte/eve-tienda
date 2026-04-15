import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Building2, Mail, Phone, MapPin, Globe, Save, Loader2, 
  Info, Users, Target, Shield, Send, Facebook, Instagram, Twitter, Linkedin, Github 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCompanySettings, updateCompanySettings, type CompanySettings } from "@/services/settingsService";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getCompanySettings();
      setSettings(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los ajustes de la empresa."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token') || '';
      await updateCompanySettings(settings, token);
      toast({
        title: "Ajustes Actualizados",
        description: "La información de la empresa se ha guardado correctamente."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo guardar la configuración."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof CompanySettings, value: string) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  if (isLoading) {
    return (
      <div className="flex bg-background min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto flex items-center justify-center">
           <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="space-y-8 pb-20">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Configuración de Empresa</h1>
              <p className="text-muted-foreground">Administra la información de "Nosotros", contacto y redes sociales.</p>
            </div>
            <button onClick={handleSave} disabled={isSaving} className="btn-primary h-12 gap-2 border-none">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar Cambios
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Seccion: Nosotros */}
            <div className="card p-8 h-full space-y-6">
              <div className="flex items-center gap-3 text-primary font-bold border-b border-border/50 pb-4">
                <div className="p-2 bg-primary/10 rounded-xl"><Info className="w-5 h-5 fill-current" /></div>
                <h2 className="text-xl font-display">Sección "Nosotros"</h2>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Frase Hero (Innovación)</label>
                  <input 
                    className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background"
                    value={settings?.about_innovation || ''} 
                    onChange={(e) => handleChange('about_innovation', e.target.value)}
                  />
                  <textarea 
                    className="input w-full bg-secondary/50 py-4 border-transparent focus:bg-background resize-none min-h-[100px]"
                    value={settings?.about_innovation_text || ''} 
                    onChange={(e) => handleChange('about_innovation_text', e.target.value)}
                    placeholder="Texto descriptivo de innovación..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2"><Users className="w-3 h-3" /> Título Equipo</label>
                    <input className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" value={settings?.about_team || ''} onChange={(e) => handleChange('about_team', e.target.value)} />
                    <textarea className="input w-full bg-secondary/50 py-4 border-transparent focus:bg-background resize-none min-h-[100px]" value={settings?.about_team_text || ''} onChange={(e) => handleChange('about_team_text', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2"><Target className="w-3 h-3" /> Título Misión</label>
                    <input className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" value={settings?.about_mission || ''} onChange={(e) => handleChange('about_mission', e.target.value)} />
                    <textarea className="input w-full bg-secondary/50 py-4 border-transparent focus:bg-background resize-none min-h-[100px]" value={settings?.about_mission_text || ''} onChange={(e) => handleChange('about_mission_text', e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2"><Shield className="w-3 h-3" /> Título Valores</label>
                  <input className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" value={settings?.about_values || ''} onChange={(e) => handleChange('about_values', e.target.value)} />
                  <textarea className="input w-full bg-secondary/50 py-4 border-transparent focus:bg-background resize-none min-h-[100px]" value={settings?.about_values_text || ''} onChange={(e) => handleChange('about_values_text', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Seccion: Contacto y Email */}
            <div className="space-y-8">
              <div className="card p-8 border-border space-y-6">
                <div className="flex items-center gap-3 text-primary font-bold border-b border-border/50 pb-4">
                  <div className="p-2 bg-primary/10 rounded-xl"><Phone className="w-5 h-5 opacity-80" /></div>
                  <h2 className="text-xl font-display">Información de Contacto</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Correo Público</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input className="input w-full pl-12 bg-secondary/50 h-14 border-transparent focus:bg-background" value={settings?.contact_email || ''} onChange={(e) => handleChange('contact_email', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Teléfono</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input className="input w-full pl-12 bg-secondary/50 h-14 border-transparent focus:bg-background" value={settings?.contact_phone || ''} onChange={(e) => handleChange('contact_phone', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Ubicación</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input className="input w-full pl-12 bg-secondary/50 h-14 border-transparent focus:bg-background" value={settings?.contact_location || ''} onChange={(e) => handleChange('contact_location', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-8 border-primary/20 bg-primary/5 space-y-6">
                <div className="flex items-center gap-3 text-primary font-bold border-b border-primary/10 pb-4">
                  <div className="p-2 bg-primary/10 rounded-xl"><Send className="w-5 h-5 opacity-80" /></div>
                  <h2 className="text-xl font-display">Configuración de Envío</h2>
                </div>
                <p className="text-xs text-primary/80 font-bold uppercase tracking-tighter">Esta dirección recibirá las notificaciones del formulario de contacto.</p>
                <div className="space-y-2">
                  <label className="label text-[10px] font-bold uppercase tracking-widest text-primary/70 ml-1">Email de Destino (Admin)</label>
                  <input 
                    className="input w-full h-14 border-transparent bg-background focus:border-primary/50 text-foreground" 
                    value={settings?.target_email || ''} 
                    onChange={(e) => handleChange('target_email', e.target.value)} 
                    placeholder="ej: admin@tuempresa.com"
                  />
                </div>
              </div>

              {/* Seccion: WhatsApp y Medida */}
              <div className="card p-8 border-green-500/20 bg-green-500/5 space-y-6">
                <div className="flex items-center gap-3 text-green-500 font-bold border-b border-green-500/10 pb-4">
                  <div className="p-2 bg-green-500/10 rounded-xl"><Target className="w-5 h-5 opacity-80" /></div>
                  <h2 className="text-xl font-display">Proyectos a Medida (Catálogo)</h2>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="label text-[10px] font-bold uppercase tracking-widest text-green-600/70 ml-1">WhatsApp Principal (Sin +)</label>
                    <input 
                      className="input w-full h-14 border-transparent bg-background focus:border-green-500 text-foreground" 
                      value={settings?.whatsapp_main_number || ''} 
                      onChange={(e) => handleChange('whatsapp_main_number', e.target.value)} 
                      placeholder="1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label text-[10px] font-bold uppercase tracking-widest text-green-600/70 ml-1">Título Sección Medida</label>
                    <input 
                      className="input w-full h-14 border-transparent bg-background focus:border-green-500 text-foreground" 
                      value={settings?.custom_project_title || ''} 
                      onChange={(e) => handleChange('custom_project_title', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label text-[10px] font-bold uppercase tracking-widest text-green-600/70 ml-1">Descripción Sección Medida</label>
                    <textarea 
                      className="input w-full bg-background py-4 border-transparent focus:border-green-500 resize-none min-h-[100px] text-foreground" 
                      value={settings?.custom_project_text || ''} 
                      onChange={(e) => handleChange('custom_project_text', e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Redes Sociales */}
            <div className="lg:col-span-2 card p-8 space-y-8">
              <div className="flex items-center gap-3 text-primary font-bold border-b border-border/50 pb-4">
                <div className="p-2 bg-primary/10 rounded-xl"><Globe className="w-5 h-5 opacity-80" /></div>
                <h2 className="text-xl font-display">Redes Sociales</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2"><Facebook className="w-4 h-4 text-blue-600" /> Facebook</label>
                  <input className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" value={settings?.social_facebook || ''} onChange={(e) => handleChange('social_facebook', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2"><Instagram className="w-4 h-4 text-pink-600" /> Instagram</label>
                  <input className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" value={settings?.social_instagram || ''} onChange={(e) => handleChange('social_instagram', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2"><Twitter className="w-4 h-4 text-sky-500" /> Twitter / X</label>
                  <input className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" value={settings?.social_twitter || ''} onChange={(e) => handleChange('social_twitter', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2"><Linkedin className="w-4 h-4 text-blue-700" /> LinkedIn</label>
                  <input className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" value={settings?.social_linkedin || ''} onChange={(e) => handleChange('social_linkedin', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2"><Github className="w-4 h-4" /> GitHub</label>
                  <input className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" value={settings?.social_github || ''} onChange={(e) => handleChange('social_github', e.target.value)} />
                </div>
              </div>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
