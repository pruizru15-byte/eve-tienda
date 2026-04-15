import { useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import { motion } from "framer-motion";
import { MessageSquare, ExternalLink } from "lucide-react";

export default function WhatsAppBubble() {
  const [isDragging, setIsDragging] = useState(false);
  const { settings } = useSettings();
  const phoneNumber = settings?.whatsapp_main_number || "918389768";
  const message = "¡Hola! Estoy visitando NovaTech y me gustaría recibir asistencia personalizada.";
  const waLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <motion.a
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        // Pequeño delay para evitar que el click/navegación se dispare al soltar
        setTimeout(() => setIsDragging(false), 100);
      }}
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        if (isDragging) {
          e.preventDefault();
        }
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-28 right-8 z-[100] cursor-grab active:cursor-grabbing group flex items-center justify-center translate-x-0 translate-y-0"
    >
      {/* Tooltip Label */}
      <div className="absolute right-full mr-4 px-4 py-2 rounded-xl bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all shadow-xl pointer-events-none whitespace-nowrap">
         Hablar con Administrador
         <div className="absolute top-1/2 -translate-y-1/2 left-full w-2 h-2 bg-emerald-500 rotate-45 -ml-1" />
      </div>

      {/* WhatsApp Icon */}
      <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/30 hover:glow-green transition-all relative overflow-hidden">
          <svg 
            className="w-7 h-7 fill-current" 
            viewBox="0 0 24 24"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.481 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.305 1.656zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.89 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.743-.981zm11.387-5.464c-.301-.15-.1.011-1.203-.541-.12-.06-.211-.09-.301.045s-.346.436-.421.526-.15.105-.451-.045c-1.211-.605-2.026-1.035-2.834-2.424-.114-.197.114-.183.328-.611.06-.12.03-.225-.015-.315s-.406-1.02-.556-1.38c-.146-.351-.295-.303-.406-.308l-.346-.006c-.12 0-.315.045-.481.225s-.631.615-.631 1.5c0 .885.645 1.74.735 1.86s1.272 1.944 3.084 2.727c.431.186.767.296 1.029.381.433.137.827.117 1.138.071.347-.051.812-.331.927-.651s.115-.595.081-.65-.125-.09-.426-.24z"/>
          </svg>
          
          {/* Gloss Highlight */}
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Pulsing indicator */}
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400"></span>
      </span>
    </motion.a>
  );
}
