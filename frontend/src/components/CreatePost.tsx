import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Send, X, Plus, Terminal, AlertCircle } from "lucide-react";
import { forumService } from "../services/forumService";

interface CreatePostProps {
  onPostCreated?: (newPost: any) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen es demasiado grande (máx 5MB)");
        return;
      }
      setMedia(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const removeMedia = () => {
    setMedia(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      setError("Título y contenido son obligatorios");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (media) {
        formData.append("media", media);
      }

      const newPost = await forumService.createPost(formData);
      
      // Reset form
      setTitle("");
      setContent("");
      removeMedia();
      setIsOpen(false);
      
      if (onPostCreated) {
        onPostCreated(newPost);
      }
    } catch (err: any) {
      setError(err.message || "Error al crear el post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-12">
      {!isOpen ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(true)}
          className="card w-full bg-secondary/10 border-dashed border-primary/30 flex items-center justify-between group hover:border-primary/60"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <Plus className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-bold text-lg">Nueva Discusión</p>
              <p className="text-sm text-muted-foreground">Comparte tus ideas con la comunidad Nova</p>
            </div>
          </div>
          <Terminal className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 bg-secondary/20 border-primary/20 shadow-2xl shadow-primary/5"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-display font-bold flex items-center gap-3">
              <span className="w-2 h-8 bg-primary rounded-full" />
              Crear Nuevo Post
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <input
                id="post-title-input"
                type="text"
                placeholder="Título de la discusión..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input text-xl font-bold border-border/50 p-4"
              />
              
              <textarea
                id="post-content-textarea"
                placeholder="¿Qué tienes en mente?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="input text-base resize-y border-border/50 p-4"
              />
            </div>

            {previewUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-secondary/10">
                <img src={previewUrl} alt="Preview" className="w-full max-h-80 object-cover" />
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all backdrop-blur-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary flex items-center gap-2 text-sm font-bold"
                >
                  <ImageIcon className="w-4 h-4" />
                  {media ? "Cambiar Imagen" : "Adjuntar Imagen"}
                </button>
              </div>

              <button
                id="submit-post-button"
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full sm:w-auto gap-3 px-8 py-3.5 shadow-lg shadow-primary/20 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Publicar Ahora
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default CreatePost;
