import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ThumbsUp, Heart, Zap, Flame, Smile, Send, User, ChevronRight, Share2, MoreHorizontal, Globe, Megaphone, Edit2, Trash2, Eye, EyeOff, Check, X as CloseIcon, Monitor, Wrench, Rocket } from "lucide-react";
import { toast } from "sonner";

interface ForumComment {
  id: string;
  user: string;
  role: string;
  avatar: string;
  content: string;
  time: string;
  isActive: boolean;
  reactions: { type: string; count: number }[];
}

interface Topic {
  id: string;
  author_id: string;
  user: string;
  role: string;
  avatar: string;
  title?: string;
  content: string;
  time: string;
  isActive: boolean;
  media: { type: "image" | "video"; url: string }[];
  reactions: { type: string; count: number }[];
  comments: ForumComment[];
}

const EMOTIONS = ["🚀 Entusiasmado", "😍 Enamorado", "🤔 Curioso", "🔥 Motivado", "😭 Frustrado", "😴 Cansado"];

const REACTION_TYPES = [
  { id: "LIKE", icon: ThumbsUp, label: "Me Gusta", color: "text-blue-400", bg: "bg-blue-400/10" },
  { id: "FIRE", icon: Flame, label: "Fuego", color: "text-orange-400", bg: "bg-orange-400/10" },
  { id: "TECH", icon: Monitor, label: "Tech", color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { id: "WRENCH", icon: Wrench, label: "Mantenimiento", color: "text-amber-400", bg: "bg-amber-400/10" },
  { id: "ROCKET", icon: Rocket, label: "Propulsión", color: "text-purple-400", bg: "bg-purple-400/10" },
];

export default function ForumSection() {
  const [announcements, setAnnouncements] = useState<Topic[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);
  const { postId } = useParams();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (postId && !loading) {
       setReplyTo(postId);
       setTimeout(() => {
          const element = document.getElementById(`post-${postId}`);
          if (element) {
             element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
       }, 500);
    }
  }, [postId, loading]);

  const handleShare = (id: string) => {
    const url = `${window.location.origin}/foro/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("¡Enlace copiado! Corre la voz, panda.");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: any = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch("http://localhost:3000/api/forum/topics", { headers });
      const data = await response.json();
      
      const transform = (topic: any) => ({
        id: topic.id,
        user: topic.author?.name || "Anónimo",
        role: topic.author?.role || "Ciudadano",
        avatar: topic.author?.name?.[0] || "?",
        title: topic.title,
        content: topic.content,
        isActive: topic.is_active,
        time: new Date(topic.created_at).toLocaleDateString(),
        media: (topic.media_url && topic.media_type) ? [{ type: topic.media_type.toLowerCase() as any, url: topic.media_url }] : [],
        reactions: ["LIKE", "FIRE", "TECH", "WRENCH", "ROCKET"].map(type => ({
           type: type,
           count: topic.reactions?.filter((r: any) => r.type === type).length || 0
        })),
        comments: (topic.comments || []).map((c: any) => ({
           id: c.id,
           user: c.author?.name || "Anónimo",
           role: c.author?.role || "Ciudadano",
           avatar: c.author?.name?.[0] || "?",
           content: c.content,
           isActive: c.is_active,
           time: new Date(c.created_at).toLocaleDateString(),
           reactions: ["LIKE", "FIRE", "TECH", "WRENCH", "ROCKET"].map(type => ({
              type: type,
              count: c.reactions?.filter((r: any) => r.type === type).length || 0
           }))
        }))
      });

      if (data.topics) {
        setTopics(data.topics.map(transform));
        setAnnouncements(data.announcements.map(transform));
      }
    } catch (error) {
       console.error("Error al sincronizar foro público");
    } finally {
       setLoading(false);
    }
  };

  const deleteTopic = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este post, panda?")) return;
    const token = localStorage.getItem("token");
    try {
      const resp = await fetch(`http://localhost:3000/api/forum/topics/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resp.ok) {
        toast.success("Post eliminado");
        fetchData();
      }
    } catch (err) { toast.error("Error al eliminar"); }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const token = localStorage.getItem("token");
    try {
      const resp = await fetch(`http://localhost:3000/api/forum/topics/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (resp.ok) {
        toast.success(currentStatus ? "Post desactivado" : "Post reactivado");
        fetchData();
      }
    } catch (err) { toast.error("Error al cambiar estado"); }
  };

  const startEdit = (topic: Topic) => {
    setEditingTopic(topic.id);
    setEditTitle(topic.title || "");
    setEditContent(topic.content);
  };

  const saveEdit = async () => {
    const token = localStorage.getItem("token");
    try {
      const resp = await fetch(`http://localhost:3000/api/forum/topics/${editingTopic}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ title: editTitle, content: editContent })
      });
      if (resp.ok) {
        toast.success("Post actualizado");
        setEditingTopic(null);
        fetchData();
      }
    } catch (err) { toast.error("Error al editar"); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addReaction = async (id: string, type: string, isComment = false) => {
     const token = localStorage.getItem("token");
     if (!token) {
        toast.error("Inicia sesión para reaccionar, panda");
        return;
     }

     try {
        const response = await fetch("http://localhost:3000/api/forum/reactions", {
           method: "POST",
           headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
           },
           body: JSON.stringify({ 
              [isComment ? 'comment_id' : 'topic_id']: id, 
              type: type.toUpperCase() 
           })
        });
        if (response.ok) {
           fetchData();
        }
     } catch (err) {
        toast.error("Error al reaccionar");
     }
  };

  const submitReply = async (topicId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Inicia sesión para responder, panzón");
      return;
    }

    if (!replyContent.trim()) {
      toast.error("No puedes responder con el vacío, panda");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/forum/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          topic_id: topicId,
          content: replyContent
        })
      });

      if (response.ok) {
        toast.success("Respuesta enviada con éxito");
        setReplyContent("");
        setReplyTo(null);
        fetchData();
      } else {
        toast.error("Error al enviar la respuesta");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleMediaUpload = (type: "image" | "video") => {
    toast.info("Función de carga multimedia próximamente para ciudadanos estándar");
  };

  return (
    <section id="foro" className="py-24 bg-secondary/10 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
            <MessageSquare className="w-4 h-4" />
            <span>Comunidad Novatech</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black mb-4">
            Foro de <span className="text-gradient">Ingeniería Colectiva</span>
          </h2>
          <p className="text-sm font-medium text-muted-foreground mt-4 max-w-2xl mx-auto">
            Únete a la conversación técnica más avanzada. Comparte configuraciones, resuelve dudas de hardware y conecta con expertos.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Announcements Header & Grid */}
          {!loading && announcements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 text-primary font-bold tracking-widest uppercase text-xs">
                <Megaphone className="w-4 h-4" />
                <span>Comunicados Públicos ({announcements.length})</span>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-primary/30 to-transparent" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="card bg-primary/5 border border-primary/30 relative overflow-hidden group p-5 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300"
                   >
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                         <Megaphone className="w-12 h-12" />
                      </div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 block">{ann.time}</span>
                      <h4 className="font-display font-bold text-sm mb-2 line-clamp-1">{ann.title || "Anuncio oficial"}</h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-3 mb-4">{ann.content}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                           {ann.avatar}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-foreground/70">{ann.user}</span>
                      </div>
                   </div>
                 ))}
              </div>
            </motion.div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="card animate-pulse border-border/20 p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-secondary" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-secondary rounded w-1/4" />
                        <div className="h-3 bg-secondary rounded w-1/6" />
                      </div>
                    </div>
                    <div className="h-20 bg-secondary rounded-2xl w-full" />
                  </div>
                ))
              ) : topics.length > 0 ? (
                topics.map((topic) => (
                  <motion.div
                    key={topic.id}
                    id={`post-${topic.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -50 }}
                    className={`card hover:border-primary/20 transition-all duration-300 ${!topic.isActive ? "opacity-40 grayscale-[0.5]" : ""} ${postId === topic.id ? "ring-2 ring-primary ring-offset-4 ring-offset-background" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 font-bold text-primary">
                          {topic.avatar}
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-foreground flex items-center gap-2">
                            {topic.user}
                            <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded-md border border-primary/20">
                              {topic.role}
                            </span>
                            {!topic.isActive && (
                               <span className="text-[8px] uppercase tracking-widest bg-muted-foreground/20 text-muted-foreground px-1.5 py-0.5 rounded font-bold">Inactivo</span>
                            )}
                          </h4>
                          <p className="text-xs text-muted-foreground">{topic.time}</p>
                        </div>
                      </div>

                      {/* Admin Controls */}
                      {(user?.role === "ADMIN" || user?.id === topic.author_id) && editingTopic !== topic.id && (
                        <div className="flex gap-2">
                           <button onClick={() => startEdit(topic)} className="p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-primary transition-all">
                              <Edit2 className="w-4 h-4" />
                           </button>
                           {user?.role === "ADMIN" && (
                             <button onClick={() => toggleStatus(topic.id, topic.isActive)} className={`p-2 rounded-lg transition-all ${topic.isActive ? "bg-secondary text-muted-foreground hover:text-orange-400" : "bg-orange-400/20 text-orange-400 hover:bg-orange-400 hover:text-white"}`}>
                                {topic.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                             </button>
                           )}
                           <button onClick={() => deleteTopic(topic.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      )}
                    </div>

                    {editingTopic === topic.id ? (
                      <div className="space-y-4 mb-6 p-4 rounded-xl bg-secondary/20 border border-primary/20">
                         <input 
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Título"
                            className="input font-bold"
                         />
                         <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="input min-h-[120px] resize-y"
                         />
                         <div className="flex justify-end gap-3">
                            <button onClick={() => setEditingTopic(null)} className="btn-secondary text-xs tracking-widest uppercase gap-2 flex items-center">
                               <CloseIcon className="w-3 h-3" /> Cancelar
                            </button>
                            <button onClick={saveEdit} className="btn-primary text-xs tracking-widest uppercase gap-2 flex items-center">
                               <Check className="w-3 h-3" /> Guardar Cambios
                            </button>
                         </div>
                      </div>
                    ) : (
                      <div className="space-y-4 mb-6">
                        {topic.title && <h3 className="text-xl font-display font-bold text-primary">{topic.title}</h3>}
                        <p className="text-foreground/90 text-lg leading-relaxed">
                          {topic.content}
                        </p>

                        {topic.media && topic.media.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                            {topic.media.map((m, i) => (
                              <div key={i} className="rounded-2xl overflow-hidden border border-border/50 shadow-xl group/media">
                                {m.type === "image" ? (
                                  <img src={m.url} alt="post" className="w-full h-48 object-cover group-hover/media:scale-105 transition-transform duration-700" />
                                ) : (
                                  <video src={m.url} controls className="w-full h-48 object-cover" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/30 mb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {REACTION_TYPES.map((type) => {
                          const count = topic.reactions.find(r => r.type === type.id)?.count || 0;
                          return (
                            <motion.button
                              key={type.id}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => addReaction(topic.id, type.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300 ${
                                count > 0 
                                  ? `${type.bg} border-primary/20 ${type.color}` 
                                  : "bg-secondary/50 border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                              }`}
                            >
                              <type.icon className={`w-3.5 h-3.5 ${count > 0 ? "fill-current" : ""}`} />
                              <span className="text-xs font-bold">{count}</span>
                            </motion.button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        <button 
                          onClick={() => handleShare(topic.id)}
                          className="hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                          <Share2 className="w-3.5 h-3.5" /> Compartir
                        </button>
                        <button 
                          onClick={() => setReplyTo(replyTo === topic.id ? null : topic.id)}
                          className={`hover:text-foreground transition-colors flex items-center gap-1.5 ${replyTo === topic.id ? "text-primary" : ""}`}
                        >
                          Responder <ChevronRight className={`w-3.5 h-3.5 transition-transform ${replyTo === topic.id ? "rotate-90" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {/* Replies Section */}
                    {topic.comments && topic.comments.length > 0 && (
                      <div className="mt-4 space-y-4 pl-8 border-l-2 border-primary/10">
                        {topic.comments.map((reply) => (
                          <div key={reply.id} className={`p-4 rounded-xl bg-secondary/20 border border-border/30 ${!reply.isActive ? "opacity-30": ""}`}>
                            <div className="flex items-center justify-between mb-2">
                               <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10 font-bold text-primary text-xs">
                                   {reply.avatar}
                                 </div>
                                 <h5 className="text-xs font-bold text-foreground flex items-center gap-2">
                                   {reply.user}
                                   <span className="text-[8px] uppercase tracking-wider bg-primary/5 text-primary/70 px-1 py-0.5 rounded-sm border border-primary/10">
                                     {reply.role}
                                   </span>
                                 </h5>
                               </div>
                               {/* Admin can see deactivated comments too if allowed by endpoint */}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{reply.content}</p>
                            <div className="flex items-center gap-3">
                               {REACTION_TYPES.map((type) => {
                                 const count = reply.reactions.find(r => r.type === type.id)?.count || 0;
                                 return (
                                   <button 
                                     key={type.id} 
                                     onClick={() => addReaction(reply.id, type.id, true)}
                                     className={`flex items-center gap-1 text-[10px] font-bold transition-all ${count > 0 ? type.color : "text-muted-foreground hover:text-primary"}`}
                                   >
                                     <type.icon className={`w-3 h-3 ${count > 0 ? "fill-current" : ""}`} /> {count}
                                   </button>
                                 );
                               })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    <AnimatePresence>
                      {replyTo === topic.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 overflow-hidden"
                        >
                          <div className="p-4 rounded-2xl bg-secondary/30 border border-primary/20">
                            <textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder={`Escribe tu respuesta a ${topic.user}...`}
                              className="w-full bg-transparent border-none focus:ring-0 text-foreground placeholder:text-muted-foreground/50 resize-none min-h-[80px]"
                            />
                            <div className="flex items-center justify-between pt-3 border-t border-border/20">
                              <div className="flex gap-2">
                                <button className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground transition-colors">
                                  <Smile className="w-4 h-4" />
                                </button>
                              </div>
                              <button 
                                onClick={() => submitReply(topic.id)}
                                className="btn-primary text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                              >
                                Enviar <Send className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 card border-dashed border-border">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-bold italic">El foro está vacío. ¡Panzón, sé el primero en decir algo!</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="text-center pt-8">
            <button className="btn-secondary px-8 flex items-center gap-2 mx-auto text-[10px] uppercase font-bold tracking-widest group border border-border shadow-lg shadow-black/5">
              <span>Ver hilos más antiguos</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
