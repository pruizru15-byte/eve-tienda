import { useEffect, useState } from "react";
import { 
  Save, Sparkles, Image as ImageIcon, 
  CheckCircle2, Award, Truck, Shield, Zap, User, Quote
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { toast } from "sonner";
import { useForm, useFieldArray } from "react-hook-form";

export default function AdminVanguard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, control, watch, setValue } = useForm({
    defaultValues: {
      badge_top: "EXPERIENCIA DE ÉLITE",
      title: "Liderado por Ingeniería de Vanguardia",
      quote_text: "",
      author_name: "Ing. Nova S.",
      author_role: "Founder & Lead Tech Architect",
      main_image_url: "",
      image_badge_text: "100% FIABILIDAD",
      features: [
        { icon_name: "CheckCircle2", title: "Calidad al 100%", description: "Filtramos cada componente." },
        { icon_name: "Truck", title: "Envío Ultra-Seguro", description: "Logística premium." },
        { icon_name: "Shield", title: "Soporte de Ingeniería", description: "Asistencia técnica directa." },
        { icon_name: "Zap", title: "Innovación Real", description: "Acceso prioritario a lanzamientos." }
      ]
    }
  });

  const { fields } = useFieldArray({
    control,
    name: "features"
  });

  const mainImageUrl = watch("main_image_url");

  useEffect(() => {
    fetch("http://localhost:3000/api/admin/vanguard", {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.id) {
        reset(data);
      }
      setLoading(false);
    });
  }, [reset]);

  const onFormSubmit = async (data: any) => {
    setSaving(true);
    try {
      const res = await fetch("http://localhost:3000/api/admin/vanguard", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        toast.success("Módulo Vanguardia actualizado con éxito");
      }
    } catch (error) {
      toast.error("Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

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
        setValue("main_image_url", data.url);
        toast.success("Imagen de vanguardia cargada");
      }
    } catch (error) {
      toast.error("Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-black flex items-center gap-3">
               Vanguardia <Sparkles className="w-8 h-8 text-primary" />
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
              <span>Módulo "Sobre Nosotros"</span>
            </div>
          </div>
          <button 
             onClick={handleSubmit(onFormSubmit)}
             disabled={saving}
             className="btn-primary h-12 gap-2 border-none px-6"
          >
            {saving ? "Guardando..." : <><Save className="w-5 h-5" /> Guardar Vanguardia</>}
          </button>
        </header>

        <form className="space-y-10 pb-20">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Image Column */}
              <div className="lg:col-span-1 space-y-6">
                 <div className="card p-8 border border-border/50">
                    <h3 className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                       <ImageIcon className="w-4 h-4" /> Imagen Principal
                    </h3>
                    
                    <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-secondary border border-dashed border-primary/30 flex items-center justify-center group mb-6 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => document.getElementById("vanguard-img")?.click()}>
                       {mainImageUrl ? (
                          <img src={mainImageUrl} alt="" className="w-full h-full object-cover" />
                       ) : (
                          <div className="text-center p-6">
                             <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                             <p className="text-[10px] font-bold text-muted-foreground uppercase">Sin imagen cargada</p>
                          </div>
                       )}
                       <input type="file" id="vanguard-img" className="hidden" onChange={handleImageUpload} />
                    </div>

                    <div className="space-y-2">
                       <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Badge Flotante (Imagen)</label>
                       <input {...register("image_badge_text")} placeholder="100% FIABILIDAD" className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" />
                    </div>
                 </div>
              </div>

              {/* Texts Column */}
              <div className="lg:col-span-2 space-y-6">
                 <div className="card p-8 border border-border/50 space-y-8">
                    <h3 className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4">
                       <Award className="w-4 h-4" /> Textos de Venta
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                       <div className="space-y-2">
                          <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Etiqueta Superior</label>
                          <input {...register("badge_top")} className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background uppercase" />
                       </div>
                       <div className="space-y-2">
                          <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Título Principal</label>
                          <input {...register("title")} className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                          <Quote className="w-3 h-3" /> Cita / Descripción (Italic)
                       </label>
                       <textarea {...register("quote_text")} rows={4} className="input w-full bg-secondary/50 py-4 border-transparent focus:bg-background font-medium italic resize-none min-h-[120px] h-auto" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 pt-4 border-t border-border/20">
                       <div className="space-y-2">
                          <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                             <User className="w-3 h-3" /> Nombre del Autor
                          </label>
                          <input {...register("author_name")} className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" />
                       </div>
                       <div className="space-y-2">
                          <label className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Cargo / Role</label>
                          <input {...register("author_role")} className="input w-full bg-secondary/50 h-14 border-transparent focus:bg-background" />
                       </div>
                    </div>
                 </div>

                 {/* Indicators / Features Grid */}
                 <div className="card p-8 border border-border/50">
                    <h3 className="label text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-8 flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4" /> Cuadrícula de Valor (4 Bloques)
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                       {fields.map((field, index) => (
                          <div key={field.id} className="p-6 bg-secondary/30 rounded-2xl border border-border/50 space-y-4">
                             <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                   <Zap className="w-5 h-5" />
                                </div>
                                <input {...register(`features.${index}.title` as const)} placeholder="Título" className="bg-transparent outline-none font-bold text-sm tracking-widest flex-1" />
                             </div>
                             <textarea {...register(`features.${index}.description` as const)} rows={2} placeholder="Descripción breve..." className="w-full bg-transparent outline-none text-xs text-muted-foreground resize-none" />
                             <input type="hidden" {...register(`features.${index}.icon_name` as const)} />
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </form>
      </main>
    </div>
  );
}
