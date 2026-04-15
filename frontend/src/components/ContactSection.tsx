import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare, Linkedin, Twitter, Github, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useContactSettings } from "../hooks/useContactSettings";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";

const contactSchema = z.object({
  name: z.string().min(2, "Nombre demasiado corto"),
  email: z.string().email("Ingresa un correo válido"),
  subject: z.string().min(3, "El asunto es requerido"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres")
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactSection() {
  const { data: settings, isLoading: settingsLoading } = useContactSettings();
  const [isSending, setIsSending] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data: ContactForm) => {
    setIsSending(true);
    try {
      const res = await fetch("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        toast.success("Mensaje enviado con éxito. Nuestro equipo te contactará pronto.");
        reset();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error("Hubo un error al enviar el mensaje. Inténtalo de nuevo.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="contacto" className="py-24 relative overflow-hidden bg-background">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
            <MessageSquare className="w-4 h-4" />
            <span>Estamos para ayudarte</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black mb-4">
            Conexión de <span className="text-gradient">Alta Ingeniería</span>
          </h2>
          <p className="text-sm font-medium text-muted-foreground mt-4 max-w-2xl mx-auto">
            ¿Tienes un proyecto especial o necesitas asesoría técnica personalizada? Nuestro equipo de expertos está listo para brindarte el soporte que mereces.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Left Side: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="card p-8 md:p-12 relative group shadow-2xl"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="label text-[10px] font-bold uppercase tracking-widest ml-1 text-muted-foreground">Nombre Completo</label>
                  <input 
                    {...register("name")}
                    placeholder="Ej. Ing. Alex Rivers"
                    className={`input h-14 bg-secondary/50 border-transparent focus:bg-background ${errors.name ? '!border-destructive' : ''}`}
                  />
                  {errors.name && <p className="text-[10px] font-bold text-destructive ml-1">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="label text-[10px] font-bold uppercase tracking-widest ml-1 text-muted-foreground">Correo Electrónico</label>
                  <input 
                    {...register("email")}
                    type="email" 
                    placeholder="alex@ingenieria.com"
                    className={`input h-14 bg-secondary/50 border-transparent focus:bg-background ${errors.email ? '!border-destructive' : ''}`}
                  />
                  {errors.email && <p className="text-[10px] font-bold text-destructive ml-1">{errors.email.message}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="label text-[10px] font-bold uppercase tracking-widest ml-1 text-muted-foreground">Asunto</label>
                <input 
                  {...register("subject")}
                  placeholder="Asesoría Técnica / Pedido Especial"
                  className={`input h-14 bg-secondary/50 border-transparent focus:bg-background ${errors.subject ? '!border-destructive' : ''}`}
                />
                {errors.subject && <p className="text-[10px] font-bold text-destructive ml-1">{errors.subject.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="label text-[10px] font-bold uppercase tracking-widest ml-1 text-muted-foreground">Mensaje</label>
                <textarea 
                  {...register("message")}
                  rows={4}
                  placeholder="Describe tus requerimientos técnicos..."
                  className={`input bg-secondary/50 border-transparent focus:bg-background min-h-[120px] py-4 resize-y ${errors.message ? '!border-destructive' : ''}`}
                />
                {errors.message && <p className="text-[10px] font-bold text-destructive ml-1">{errors.message.message}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isSending}
                className="btn-primary w-full h-14 text-xs font-bold uppercase tracking-widest shadow-xl group border-none"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isSending ? (
                     <>Procesando <Loader2 className="w-4 h-4 animate-spin" /></>
                  ) : (
                     <>Enviar Mensaje <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </span>
              </button>
            </form>
          </motion.div>

          {/* Right Side: Contact Info & Details */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col justify-between py-6 h-full"
          >
            <div className="space-y-12">
              <div className="flex items-start gap-6 group/info">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 group-hover/info:bg-primary group-hover/info:text-primary-foreground transition-all duration-500 shadow-xl group-hover/info:shadow-primary/20">
                  <Mail className="w-6 h-6 text-primary group-hover/info:text-current" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-black text-xl text-foreground uppercase tracking-tight">Email de Soporte</h4>
                  {settingsLoading ? (
                     <div className="space-y-2 mt-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-32" />
                     </div>
                  ) : (
                     <>
                        <p className="text-muted-foreground font-medium">{settings?.support_email}</p>
                        <p className="text-[10px] text-primary font-black uppercase tracking-widest">{settings?.email_subtext}</p>
                     </>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-6 group/info">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20 shrink-0 group-hover/info:bg-accent group-hover/info:text-accent-foreground transition-all duration-500 shadow-xl group-hover/info:shadow-accent/20">
                  <Phone className="w-6 h-6 text-accent group-hover/info:text-current" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-black text-xl text-foreground uppercase tracking-tight">Atención Directa</h4>
                  {settingsLoading ? (
                     <div className="space-y-2 mt-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-32" />
                     </div>
                  ) : (
                     <>
                        <p className="text-muted-foreground font-medium">{settings?.phone}</p>
                        <p className="text-[10px] text-accent font-black uppercase tracking-widest">{settings?.phone_subtext}</p>
                     </>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-6 group/info">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 group-hover/info:bg-primary group-hover/info:text-primary-foreground transition-all duration-500 shadow-xl group-hover/info:shadow-primary/20">
                  <MapPin className="w-6 h-6 text-primary group-hover/info:text-current" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-black text-xl text-foreground uppercase tracking-tight">Sede Central</h4>
                  {settingsLoading ? (
                     <div className="space-y-2 mt-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-32 mt-1" />
                     </div>
                  ) : (
                     <>
                        <p className="text-muted-foreground font-medium leading-tight">{settings?.address_line1}</p>
                        <p className="text-sm text-muted-foreground font-black uppercase tracking-tighter opacity-60">{settings?.address_line2}</p>
                     </>
                  )}
                </div>
              </div>
            </div>

            {/* Social Connect */}
            <div className="mt-16 lg:mt-0 pt-12 border-t border-border/30">
              <h5 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-8">Conecta con Ingeniería</h5>
              <div className="flex items-center gap-6">
                {[
                  { icon: Linkedin, color: "hover:text-blue-500", url: settings?.linkedin_url },
                  { icon: Twitter, color: "hover:text-cyan-400", url: settings?.twitter_url },
                  { icon: Github, color: "hover:text-white", url: settings?.github_url },
                ].map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -8, scale: 1.1 }}
                    className={`w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground transition-all duration-500 ${social.color} hover:bg-secondary hover:shadow-lg shadow-black/5 group`}
                  >
                    <social.icon className="w-5 h-5 transition-transform duration-500 group-hover:rotate-[360deg]" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
