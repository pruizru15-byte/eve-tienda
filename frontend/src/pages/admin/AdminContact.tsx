import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Phone, MapPin, Linkedin, Twitter, Github,
  MessageSquare, Save, Check, Eye, Trash2, Clock, User, FileText,
  Send, CheckCircle2, X, AlertCircle, Activity
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { format } from "date-fns";

export default function AdminContact() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const { register, handleSubmit, reset } = useForm();
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchData = async () => {
    try {
      const [settingsRes, messagesRes] = await Promise.all([
        fetch("http://localhost:3000/api/admin/contact-settings", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        }),
        fetch("http://localhost:3000/api/admin/messages", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        })
      ]);
      const settingsData = await settingsRes.json();
      const messagesData = await messagesRes.json();
      if (settingsData) reset(settingsData);
      setMessages(Array.isArray(messagesData) ? messagesData : []);
    } catch (error) {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [reset]);

  const onSettingsSubmit = async (data: any) => {
    setSaving(true);
    try {
      const res = await fetch("http://localhost:3000/api/admin/contact-settings", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) toast.success("Información corporativa actualizada");
    } catch (error) {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/admin/messages/${id}/read`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        toast.success("Mensaje archivado como leído");
        fetchData();
      }
    } catch (error) {
      toast.error("Error al marcar como leído");
    }
  };

  const handleReplyToMessage = async (id: string) => {
    if (!replyContent.trim()) {
      toast.error("La respuesta no puede estar vacía");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/admin/messages/${id}/reply`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ reply: replyContent })
      });

      if (response.ok) {
        toast.success("Respuesta enviada correctamente");
        setReplyContent("");
        setModalOpen(false);
        fetchData();
      } else {
        toast.error("Error al enviar respuesta");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión");
    }
  };

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-display font-black">Centro de Contacto</h1>
          <p className="text-muted-foreground mt-2 uppercase tracking-[0.2em] text-[10px] font-bold">Gestión de Leads e Información Corporativa</p>
        </header>

        <Tabs defaultValue="messages" className="space-y-8">
           <TabsList className="bg-secondary/50 p-1 rounded-2xl border border-border/10">
              <TabsTrigger value="messages" className="rounded-xl px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-bold text-xs uppercase tracking-widest">Leads Recibidos</TabsTrigger>
              <TabsTrigger value="info" className="rounded-xl px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-bold text-xs uppercase tracking-widest">Información Pública</TabsTrigger>
           </TabsList>

           <TabsContent value="messages">
              <div className="space-y-6">
                 <div className="card overflow-hidden border-none shadow-2xl">
                    <table className="w-full text-left">
                       <thead className="bg-secondary/50">
                          <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                             <th className="px-8 py-6">Remitente</th>
                             <th className="px-8 py-6">Asunto</th>
                             <th className="px-8 py-6">Mensaje</th>
                             <th className="px-8 py-6">Fecha</th>
                             <th className="px-8 py-6 text-right pr-10">Acciones</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-border/20">
                          {messages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(msg => (
                             <tr key={msg.id} className={`hover:bg-primary/5 transition-colors group ${msg.status === 'UNREAD' ? 'bg-primary/5' : ''}`}>
                                <td className="px-8 py-6">
                                   <div>
                                      <p className="font-black text-sm">{msg.name}</p>
                                      <p className="text-[10px] text-muted-foreground font-bold">{msg.email}</p>
                                   </div>
                                </td>
                                <td className="px-8 py-6 text-sm font-bold text-primary italic">
                                   {msg.subject || "Sin asunto"}
                                </td>
                                <td className="px-8 py-6 max-w-xs">
                                   <p className="text-xs text-muted-foreground truncate italic">"{msg.message}"</p>
                                </td>
                                <td className="px-8 py-6">
                                   <div className="flex flex-col text-[10px] font-black uppercase text-muted-foreground">
                                      <span>{format(new Date(msg.created_at), 'dd MMM yyyy')}</span>
                                      <span className="opacity-50">{format(new Date(msg.created_at), 'HH:mm')}</span>
                                   </div>
                                </td>
                                <td className="px-8 py-6 text-right pr-10">
                                   <div className="flex justify-end gap-2">
                                      <button 
                                         onClick={() => { setSelectedMsg(msg); setModalOpen(true); }} 
                                         className="px-4 py-2 bg-primary/10 text-primary rounded-xl border border-primary/20 text-[10px] font-black uppercase tracking-tighter hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                                      >
                                         <Eye className="w-3 h-3" /> Ver y Responder
                                      </button>
                                      {msg.status === 'UNREAD' && (
                                         <button onClick={() => markAsRead(msg.id)} className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 text-[10px] font-black uppercase tracking-tighter hover:bg-emerald-500 hover:text-white transition-all">Archivar</button>
                                      )}
                                      {msg.status === 'REPLIED' && (
                                         <div className="px-4 py-2 bg-emerald-500/5 text-emerald-500 rounded-xl border border-emerald-500/20 text-[10px] font-black uppercase tracking-tighter flex items-center gap-2 opacity-60">
                                            <CheckCircle2 className="w-3 h-3" /> Respondido
                                         </div>
                                      )}
                                   </div>
                                </td>
                             </tr>
                          ))}
                          {messages.length === 0 && (
                             <tr>
                                <td colSpan={5} className="py-20 text-center">
                                   <Clock className="w-12 h-12 text-muted-foreground/10 mx-auto mb-4" />
                                   <p className="text-muted-foreground font-display italic">Silencio total... No hay nuevos leads todavía.</p>
                                </td>
                             </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
                 <AdminPagination 
                   currentPage={currentPage}
                   totalPages={Math.ceil(messages.length / itemsPerPage)}
                   onPageChange={setCurrentPage}
                   totalItems={messages.length}
                   itemsPerPage={itemsPerPage}
                 />
              </div>
           </TabsContent>

           <TabsContent value="info">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="pt-4"
               >
                 <form onSubmit={handleSubmit(onSettingsSubmit)} className="space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                       <div className="card p-8 border-none bg-secondary/30 backdrop-blur-xl border border-white/5 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-bl-full -mr-20 -mt-20 group-hover:bg-primary/10 transition-all duration-700" />
                          
                          <div className="flex items-center gap-4 mb-10">
                             <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                               <Mail className="w-6 h-6" />
                             </div>
                             <div>
                               <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Canales de Enlace</h3>
                               <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Vías de contacto oficiales</p>
                             </div>
                          </div>

                          <div className="space-y-6">
                            <div className="space-y-2 relative group">
                               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Corporativo de Soporte</label>
                               <div className="relative">
                                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                 <input {...register("support_email")} className="input w-full pl-12 bg-background/50 h-14 border-border/10 focus:border-primary/50 transition-all font-bold" placeholder="soporte@novatech.com" />
                               </div>
                            </div>

                            <div className="space-y-2 relative group">
                               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Etiqueta de Compromiso</label>
                               <input {...register("email_subtext")} className="input w-full bg-background/50 h-12 border-border/10 focus:border-primary/50 transition-all text-xs italic" placeholder="Ej: Respuesta en menos de 2h" />
                            </div>

                            <div className="mt-8 pt-8 border-t border-border/10 space-y-6">
                               <div className="space-y-2 group">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Línea de Atención Directa</label>
                                  <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                    <input {...register("phone")} className="input w-full pl-12 bg-background/50 h-14 border-border/10 focus:border-primary/50 transition-all font-black tracking-tighter" placeholder="+1 234 567 890" />
                                  </div>
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Disponibilidad del Servicio</label>
                                  <input {...register("phone_subtext")} className="input w-full bg-background/50 h-12 border-border/10 focus:border-primary/50 transition-all text-xs" placeholder="Ej: Lun - Vie 9:00 - 18:00" />
                               </div>
                            </div>
                          </div>
                       </div>

                       <div className="space-y-8">
                          <div className="card p-8 border-none bg-secondary/30 backdrop-blur-xl border border-white/5 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16" />
                             <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 rounded-2xl bg-secondary text-foreground flex items-center justify-center shadow-inner">
                                  <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Sede Central</h3>
                                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Ubicación Geoespacial</p>
                                </div>
                             </div>

                             <div className="space-y-6">
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Dirección Maestra</label>
                                   <input {...register("address_line1")} placeholder="Edificio Platinum, Suite 402..." className="input w-full bg-background/50 h-14 border-border/10 focus:border-primary/50 transition-all" />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Región y Zona</label>
                                   <input {...register("address_line2")} placeholder="Parque Tecnológico, Buenos Aires..." className="input w-full bg-background/50 h-14 border-border/10 focus:border-primary/50 transition-all" />
                                </div>
                             </div>
                          </div>

                          <div className="card p-8 border-none bg-primary/[0.05] border border-primary/20 relative group shadow-lg shadow-primary/5">
                             <div className="flex items-center gap-3 mb-6">
                                <Activity className="w-4 h-4 text-primary animate-pulse" />
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Nodos Sociales</h3>
                             </div>
                             <div className="grid grid-cols-1 gap-4">
                                <div className="relative group">
                                  <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-blue-500 transition-colors" />
                                  <input {...register("linkedin_url")} placeholder="LinkedIn Protocol URL" className="input w-full pl-12 bg-background/40 h-12 border-border/10 text-[10px]" />
                                </div>
                                <div className="relative group">
                                  <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-sky-500 transition-colors" />
                                  <input {...register("twitter_url")} placeholder="Twitter Protocol URL" className="input w-full pl-12 bg-background/40 h-12 border-border/10 text-[10px]" />
                                </div>
                                <div className="relative group">
                                  <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-white transition-colors" />
                                  <input {...register("github_url")} placeholder="GitHub Protocol URL" className="input w-full pl-12 bg-background/40 h-12 border-border/10 text-[10px]" />
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>

                    <button type="submit" disabled={saving} className="btn-primary w-full h-16 border-none uppercase text-xs tracking-[0.4em] font-black shadow-2xl shadow-primary/20 justify-center disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]">
                       {saving ? (
                         <span className="flex items-center gap-3">
                           <Clock className="w-5 h-5 animate-spin" /> Sincronizando Imperio...
                         </span>
                       ) : (
                         <span className="flex items-center gap-3">
                           <Save className="w-5 h-5" /> Publicar Información Coorporativa
                         </span>
                       )}
                    </button>
                 </form>
               </motion.div>
            </TabsContent>
        </Tabs>
      </main>

      <AnimatePresence>
         {modalOpen && selectedMsg && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setModalOpen(false)}
                  className="absolute inset-0 bg-background/80 backdrop-blur-md"
               />
               <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-card w-full max-w-2xl rounded-[32px] shadow-2xl border border-border/10 overflow-hidden relative z-10"
               >
                  <div className="p-8 border-b border-border/10 bg-secondary/30 flex justify-between items-center">
                     <div>
                        <h3 className="text-xl font-display font-black">Reporte de Lead</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">Interacción # {selectedMsg.id.split('-')[0]}</p>
                     </div>
                     <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors"><X className="w-5 h-5" /></button>
                  </div>

                  <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1">
                           <span className="text-[10px] font-black uppercase text-primary tracking-widest">Remitente</span>
                           <p className="font-bold flex items-center gap-2 text-sm"><User className="w-4 h-4 text-muted-foreground" /> {selectedMsg.name}</p>
                        </div>
                        <div className="space-y-1">
                           <span className="text-[10px] font-black uppercase text-primary tracking-widest">Correo Electrónico</span>
                           <p className="font-bold flex items-center gap-2 text-sm text-primary underline"><Mail className="w-4 h-4 text-muted-foreground" /> {selectedMsg.email}</p>
                        </div>
                     </div>

                     <div className="space-y-2 p-6 bg-secondary/30 rounded-2xl border border-border/5">
                        <span className="text-[10px] font-black uppercase text-primary tracking-widest">Asunto del Mensaje</span>
                        <p className="text-sm font-bold italic">"{selectedMsg.subject || 'Sin asunto'}"</p>
                     </div>

                     <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase text-primary tracking-widest">Cuerpo de la Consulta</span>
                        <div className="p-6 bg-background rounded-2xl border border-border/10 text-xs leading-relaxed italic text-muted-foreground whitespace-pre-wrap">
                           {selectedMsg.message}
                        </div>
                     </div>

                     {/* Reply Section */}
                     <div className="pt-8 border-t border-border/10 space-y-4">
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-black uppercase text-primary tracking-widest">Respuesta Oficial</span>
                           {selectedMsg.status === 'REPLIED' && <span className="text-[9px] bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded-full font-black uppercase tracking-tighter">Mensaje Respondido</span>}
                        </div>
                        
                        <div className="relative group">
                           <FileText className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
                           <textarea 
                              disabled={selectedMsg.status === 'REPLIED'}
                              value={replyContent || selectedMsg.reply || ""}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Escribe tu respuesta aquí..."
                              className="input w-full pl-12 pt-4 bg-secondary/50 min-h-[150px] border-transparent focus:bg-background transition-all text-xs"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="p-8 bg-secondary/30 border-t border-border/10 flex justify-end gap-3">
                     <button 
                        onClick={() => setModalOpen(false)}
                        className="px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors"
                     >
                        Cerrar Vista
                     </button>
                     {selectedMsg.status !== 'REPLIED' && (
                        <button 
                           onClick={() => handleReplyToMessage(selectedMsg.id)}
                           className="btn-primary px-8 py-3 rounded-xl border-none shadow-xl shadow-primary/20 flex items-center gap-2"
                        >
                           <Send className="w-4 h-4" /> Enviar Respuesta
                        </button>
                     )}
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
