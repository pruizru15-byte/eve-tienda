import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Inbox, 
  Send, 
  MessageSquare, 
  Search, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle,
  X,
  Plus,
  ArrowRight,
  Eye,
  EyeOff,
  Edit2,
  Megaphone,
  Globe,
  Trash2
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { toast } from "sonner";

export default function AdminMessages() {
  const [activeTab, setActiveTab] = useState<"inbox" | "forum">("inbox");
  const [inbox, setInbox] = useState<any[]>([]);
  const [forumTopics, setForumTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      const [inboxRes, forumRes] = await Promise.all([
        fetch("http://localhost:3000/api/admin/messages/inbox", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        }),
        fetch("http://localhost:3000/api/admin/messages/forum", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        })
      ]);
      const inboxData = await inboxRes.json();
      const forumData = await forumRes.json();
      if (Array.isArray(inboxData)) setInbox(inboxData);
      if (Array.isArray(forumData)) setForumTopics(forumData);
    } catch (error) {
      toast.error("Error al sincronizar comunicaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReplyToMessage = async (id: string) => {
    if (!replyContent.trim()) {
      toast.error("La respuesta no puede estar vacía");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/admin/messages/inbox/${id}/reply`, {
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
        const err = await response.json();
        toast.error(err.error || "Error al enviar respuesta");
      }
    } catch (error) {
      toast.error("Error en la conexión");
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/messages/inbox/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        toast.success(`Mensaje marcado como ${status}`);
        fetchData();
        setModalOpen(false);
      }
    } catch (error) {
      toast.error("Error en la operación");
    }
  };

  const handleToggleReaction = async (id: string, type: string, isComment = false) => {
    try {
      const response = await fetch("http://localhost:3000/api/admin/messages/reactions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ [isComment ? 'comment_id' : 'topic_id']: id, type })
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      toast.error("Error al reaccionar");
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const imageFile = (form.querySelector('input[type="file"]') as HTMLInputElement)?.files?.[0];
    let mediaUrl = "";

    if (imageFile) {
       const uploadData = new FormData();
       uploadData.append('image', imageFile);
       const upRes = await fetch("http://localhost:3000/api/admin/upload", {
          method: "POST",
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
          body: uploadData
       });
       const upJson = await upRes.json();
       mediaUrl = upJson.url;
    }

    try {
      const response = await fetch("http://localhost:3000/api/admin/messages/forum", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          ...data,
          media_url: mediaUrl,
          media_type: mediaUrl ? 'IMAGE' : ''
        })
      });
      if (response.ok) {
        toast.success("Comunicado publicado con multimedia");
        fetchData();
        setModalOpen(false);
      }
    } catch (error) {
      toast.error("Error al publicar anuncio");
    }
  };

  const reactionIcons: any = {
    LIKE: "👍",
    FIRE: "🔥",
    TECH: "💻",
    WRENCH: "🔧",
    ROCKET: "🚀"
  };

  const deleteTopic = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este post?")) return;
    try {
      const response = await fetch(`http://localhost:3000/api/forum/topics/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.ok) {
        toast.success("Post eliminado");
        fetchData();
      }
    } catch (err) { toast.error("Error al eliminar"); }
  };

  const toggleTopicStatus = async (id: string, currentStatus: boolean) => {
    try {
      const resp = await fetch(`http://localhost:3000/api/forum/topics/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (resp.ok) {
        toast.success(currentStatus ? "Post desactivado" : "Post activado");
        fetchData();
      }
    } catch (err) { toast.error("Error al cambiar estado"); }
  };

  const handlePostReply = async (topicId: string) => {
    if (!replyContent.trim()) return;
    try {
      const response = await fetch("http://localhost:3000/api/forum/comments", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          topic_id: topicId,
          content: replyContent
        })
      });
      if (response.ok) {
        toast.success("Respuesta enviada");
        setReplyContent("");
        fetchData();
      }
    } catch (error) { toast.error("Error al responder"); }
  };

  const handleEditTopic = (topic: any) => {
    setSelectedTopic(topic);
    setSelectedMsg(null);
    setModalOpen(true);
  };

  const handleUpdateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`http://localhost:3000/api/forum/topics/${selectedTopic.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        toast.success("Post actualizado");
        fetchData();
        setModalOpen(false);
      }
    } catch (error) { toast.error("Error al actualizar"); }
  };

  const getStatusBadge = (status: string) => {
     switch(status) {
        case 'READ': return <span className="bg-blue-500/10 text-blue-500 text-[8px] font-black px-2 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-tighter">LEÍDO</span>;
        case 'REPLIED': return <span className="bg-green-500/10 text-green-500 text-[8px] font-black px-2 py-0.5 rounded-full border border-green-500/20 uppercase tracking-tighter">RESPONDIDO</span>;
        default: return <span className="bg-amber-500/10 text-amber-500 text-[8px] font-black px-2 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-tighter">PENDIENTE</span>;
     }
  };

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              Comunicaciones Estratégicas <MessageSquare className="w-8 h-8 text-primary" />
            </h1>
            <p className="text-muted-foreground mt-1 text-xs tracking-widest uppercase font-bold italic">Inbox Administrativo y Emisión de Anuncios</p>
          </div>
          
          <button 
            onClick={() => { setSelectedMsg(null); setSelectedTopic(null); setModalOpen(true); setActiveTab('forum'); }}
            className="btn-primary gap-2 font-black uppercase text-xs tracking-widest shadow-lg"
          >
            <Megaphone className="w-5 h-5" /> Nuevo Comunicado
          </button>
        </header>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-border/50 mb-8 px-2">
          <button 
            onClick={() => setActiveTab("inbox")}
            className={`pb-4 text-sm font-bold uppercase tracking-widest relative transition-all ${activeTab === "inbox" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            Buzón de Entrada ({inbox.filter(m => m.status === 'UNREAD').length} nuevos)
            {activeTab === "inbox" && <motion.div layoutId="tab" className="absolute bottom-0 inset-x-0 h-1 bg-primary rounded-t-full" />}
          </button>
          <button 
            onClick={() => setActiveTab("forum")}
            className={`pb-4 text-sm font-bold uppercase tracking-widest relative transition-all ${activeTab === "forum" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            Comunicados Públicos ({forumTopics.length})
            {activeTab === "forum" && <motion.div layoutId="tab" className="absolute bottom-0 inset-x-0 h-1 bg-primary rounded-t-full" />}
          </button>
        </div>

        {activeTab === "inbox" ? (
          <div className="space-y-4">
             {inbox.map((msg) => (
                <motion.div 
                  key={msg.id}
                  layout
                  onClick={() => { setSelectedMsg(msg); setModalOpen(true); }}
                  className={`card flex items-center gap-6 cursor-pointer hover:bg-secondary/30 ${msg.status === 'UNREAD' ? 'border-primary/30 bg-primary/5' : ''}`}
                >
                   <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-muted-foreground" />
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                         <div className="flex items-center gap-3">
                            <h4 className="text-sm font-bold">{msg.sender_name}</h4>
                            {getStatusBadge(msg.status)}
                         </div>
                         <span className="text-[10px] font-bold text-muted-foreground opacity-60 font-mono">
                            {new Date(msg.created_at).toLocaleDateString()}
                         </span>
                      </div>
                      <p className="text-xs font-bold text-foreground/80 mb-1">{msg.subject}</p>
                      <p className="text-xs text-muted-foreground truncate italic opacity-60">
                         "{msg.message}"
                      </p>
                   </div>
                </motion.div>
             ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {forumTopics.map((topic) => (
              <div key={topic.id} className={`card p-0 overflow-hidden flex flex-col group h-full relative ${!topic.is_active ? "opacity-50" : ""}`}>
                
                {/* Floating Admin Actions */}
                <div className="absolute top-6 right-6 flex gap-2 z-[20]">
                  <button onClick={() => handleEditTopic(topic)} className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all shadow-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleTopicStatus(topic.id, topic.is_active)} className={`p-2.5 rounded-2xl backdrop-blur-md border transition-all shadow-lg hover:scale-110 ${topic.is_active ? "bg-white/10 border-white/20 text-white hover:bg-orange-500 hover:border-orange-500" : "bg-primary border-primary text-primary-foreground"}`}>
                    {topic.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => deleteTopic(topic.id)} className="p-2.5 rounded-2xl bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white hover:scale-110 transition-all shadow-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {topic.media_url && (
                  <div className="w-full h-48 overflow-hidden relative">
                    {topic.media_type === 'IMAGE' ? (
                      <img src={topic.media_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-black/80 flex items-center justify-center text-primary"><Megaphone className="w-12 h-12" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  </div>
                )}
                
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <span className={`text-[8px] font-black px-3 py-1 rounded-full border tracking-widest uppercase italic ${topic.title?.startsWith('[COMUNICADO]') ? "bg-primary/10 text-primary border-primary/10" : "bg-blue-400/10 text-blue-400 border-blue-400/10"}`}>
                      {topic.title?.startsWith('[COMUNICADO]') ? "Oficial" : "Comunidad"}
                    </span>
                    {!topic.is_active && <span className="bg-amber-500/10 text-amber-500 text-[8px] font-black px-3 py-1 rounded-full border border-amber-500/10 tracking-widest uppercase italic">Inactivo</span>}
                    <span className="text-[10px] font-bold text-muted-foreground font-mono">{new Date(topic.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <h3 className="text-xl font-display font-bold mb-4">{topic.title}</h3>
                  <p className="text-xs text-muted-foreground mb-8 line-clamp-4 leading-relaxed italic opacity-80 flex-1">"{topic.content}"</p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-border/30">
                    <div className="flex gap-1">
                      {Object.keys(reactionIcons).map(type => {
                        const count = topic.reactions?.filter((r: any) => r.type === type).length || 0;
                        return (
                          <button key={type} onClick={(e) => { e.stopPropagation(); handleToggleReaction(topic.id, type); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/50 hover:bg-primary/10 hover:text-primary transition-all">
                            <span className="text-xs">{reactionIcons[type]}</span>
                            {count > 0 && <span className="text-[10px] font-black">{count}</span>}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button 
                      onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${expandedTopic === topic.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      {topic._count?.comments || 0} Mensajes
                    </button>
                  </div>

                  <AnimatePresence>
                    {expandedTopic === topic.id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 space-y-4 overflow-hidden"
                      >
                        <div className="space-y-3 pt-4 border-t border-border/20">
                            {topic.comments?.map((comment: any) => (
                              <div key={comment.id} className="p-4 rounded-[24px] bg-secondary/20 border border-border/30">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold">{comment.author?.name[0]}</div>
                                    <span className="text-[10px] font-black uppercase">{comment.author?.name}</span>
                                    <span className="text-[8px] opacity-50 font-mono">{new Date(comment.created_at).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                <p className="text-[11px] text-foreground/80 leading-relaxed italic mb-3">"{comment.content}"</p>
                                
                                {/* Comment Reactions */}
                                <div className="flex gap-2">
                                  {Object.keys(reactionIcons).map(type => {
                                    const count = comment.reactions?.filter((r: any) => r.type === type).length || 0;
                                    return (
                                      <button 
                                        key={type} 
                                        onClick={() => handleToggleReaction(comment.id, type, true)}
                                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-background/50 text-[9px] font-bold hover:bg-primary/10 transition-all"
                                      >
                                        <span>{reactionIcons[type]}</span>
                                        {count > 0 && <span>{count}</span>}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          <div className="pt-4 mt-2 relative">
                            <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Responder a este hilo..." className="input bg-secondary/50 resize-none text-xs leading-relaxed" rows={3} />
                            <button onClick={() => handlePostReply(topic.id)} className="absolute bottom-3 right-3 py-2 px-3 btn-primary shadow-lg">
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Dynamic Modal (Announcement or Inbox detail) */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-2xl card p-0 shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]">
              <div className="p-10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-display font-bold">
                     {selectedMsg ? 'Detalles del Mensaje' : selectedTopic ? 'Editar Post del Foro' : 'Publicar Comunicado'}
                  </h3>
                  <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-secondary rounded-xl transition-colors"><X className="w-6 h-6" /></button>
                </div>

                {selectedMsg ? (
                  <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-secondary/30 p-4 rounded-2xl">
                           <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">De:</p>
                           <p className="text-sm font-bold">{selectedMsg.sender_name}</p>
                           <p className="text-[10px] opacity-60">{selectedMsg.sender_email}</p>
                        </div>
                        <div className="bg-secondary/30 p-4 rounded-2xl">
                           <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Asunto:</p>
                           <p className="text-sm font-bold">{selectedMsg.subject}</p>
                        </div>
                     </div>
                     
                     <div className="p-6 bg-secondary/50 rounded-[32px] border border-border/50 italic opacity-80 leading-relaxed max-h-40 overflow-y-auto font-medium">
                        "{selectedMsg.message}"
                     </div>

                     {/* Reply System */}
                     <div className="space-y-4 pt-4 border-t border-border/20">
                        {selectedMsg.reply && (
                           <div className="p-6 bg-green-500/5 rounded-[32px] border border-green-500/20 shadow-inner">
                              <p className="text-[10px] font-black uppercase text-green-500 mb-2 flex items-center gap-2">
                                 <CheckCircle2 className="w-3 h-3" /> Respuesta de Ingeniería NovaTech
                              </p>
                              <p className="text-sm leading-relaxed text-foreground italic font-medium">"{selectedMsg.reply}"</p>
                              {selectedMsg.replied_at && (
                                 <p className="text-[9px] font-bold text-muted-foreground mt-3 font-mono opacity-60">
                                    Transmitido el {new Date(selectedMsg.replied_at).toLocaleString()}
                                 </p>
                              )}
                           </div>
                        )}

                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Responder al Cliente (Vía Email y Perfil)</label>
                           <textarea 
                              value={replyContent} 
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Redactar respuesta estratégica..."
                              className="input bg-secondary/20 resize-none leading-relaxed text-sm font-medium shadow-inner"
                              rows={4}
                           />
                        </div>

                        <div className="flex gap-4 pt-4">
                           <button onClick={() => handleUpdateStatus(selectedMsg.id, 'READ')} className="btn-secondary flex-1 py-4 font-black text-[10px] tracking-widest uppercase">Marcar Leído</button>
                           <button 
                              onClick={() => handleReplyToMessage(selectedMsg.id)} 
                              disabled={!replyContent.trim()}
                              className="btn-primary flex-[2] py-4 font-black text-[10px] tracking-widest uppercase shadow-lg shadow-primary/20 disabled:opacity-50 gap-2"
                           >
                              Desplegar Respuesta <Send className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  </div>
                ) : selectedTopic ? (
                  <form onSubmit={handleUpdateTopic} className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Título del Post</label>
                        <input name="title" defaultValue={selectedTopic.title} required className="input bg-secondary/50 font-bold uppercase" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Contenido</label>
                        <textarea name="content" defaultValue={selectedTopic.content} required rows={6} className="input bg-secondary/50 resize-none leading-relaxed" />
                     </div>
                     <div className="pt-4 flex gap-4">
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 py-4 font-black text-xs uppercase tracking-widest">Cancelar</button>
                        <button type="submit" className="btn-primary flex-[2] py-4 font-black text-xs uppercase tracking-widest shadow-lg">
                           Guardar Cambios
                        </button>
                     </div>
                  </form>
                ) : (
                  <form onSubmit={handleCreateAnnouncement} className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Cabecera del Publicación</label>
                        <input name="title" required placeholder="Ej: ACTUALIZACIÓN DE POLÍTICAS DE GARANTÍA" className="input bg-secondary/50 font-black uppercase tracking-tighter" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Cuerpo del Comunicado (Público)</label>
                        <textarea name="content" required rows={8} placeholder="Estimados ciudadanos de la red NovaTech..." className="input bg-secondary/50 resize-none leading-relaxed" />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Adjuntar Arte Multimedia (Opcional)</label>
                        <input type="file" accept="image/*" className="input bg-secondary/30 border-dashed cursor-pointer text-xs font-bold" />
                     </div>
                     
                     <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 flex gap-3 text-amber-600">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p className="text-[10px] font-bold leading-tight">ATENCIÓN: Este comunicado se publicará instantáneamente en el foro público. Será visible para todos los usuarios y visitantes anónimos.</p>
                     </div>

                     <div className="pt-4 flex gap-4">
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 py-4 font-black text-xs uppercase tracking-widest">Abortar Misión</button>
                        <button type="submit" className="btn-primary flex-[2] py-4 font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
                           Transmitir a la Población <Send className="w-4 h-4" />
                        </button>
                     </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
