import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Sparkles, ShoppingBag, Search } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  timestamp: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "¡Hola! Soy Nova, tu asistente de IA. ¿En qué hardware puedo ayudarte hoy?", sender: "bot", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue;
    const userMsg: Message = {
      id: Date.now(),
      text: userText,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Get last few messages for context
      const history = messages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const response = await fetch(`${API_URL}/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...history, { role: 'user', content: userText }]
        }),
      });

      if (!response.ok) throw new Error('Error en la comunicación con la IA');

      const data = await response.json();
      const botText = data.choices?.[0]?.message?.content || "Lo siento, tuve un problema procesando tu mensaje.";

      const botMsg: Message = {
        id: Date.now() + 1,
        text: botText,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Chatbot Error:', error);
      const errorMsg: Message = {
        id: Date.now() + 1,
        text: "Hubo un error de conexión. Por favor, intenta de nuevo.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div 
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        // Delay para evitar que el click se dispare justo al soltar
        setTimeout(() => setIsDragging(false), 100);
      }}
      className="fixed bottom-8 right-8 z-[100] cursor-grab active:cursor-grabbing flex flex-col items-end"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-6 w-[380px] h-[550px] glass rounded-[32px] border border-primary/20 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 bg-primary text-primary-foreground flex justify-between items-center shadow-lg cursor-default">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 relative">
                  <Bot className="w-6 h-6" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-primary rounded-full" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm">Nova AI Assistant</h3>
                  <div className="flex items-center gap-1.5 opacity-80">
                     <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                     <p className="text-[10px] uppercase font-bold tracking-widest leading-none">En Línea</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div 
              ref={scrollRef}
              className="flex-1 p-6 overflow-y-auto space-y-4 bg-secondary/10 custom-scrollbar cursor-default"
            >
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: m.sender === "bot" ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${m.sender === "bot" ? "justify-start" : "justify-end"}`}
                >
                  <div className={`max-w-[80%] flex items-end gap-2 ${m.sender === "bot" ? "flex-row" : "flex-row-reverse"}`}>
                     <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${m.sender === "bot" ? "bg-primary text-white" : "bg-accent text-white"}`}>
                        {m.sender === "bot" ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                     </div>
                     <div className={`p-4 rounded-2xl text-[13px] shadow-sm ${
                       m.sender === "bot" 
                       ? "bg-card border border-border text-foreground rounded-bl-none" 
                       : "bg-primary text-primary-foreground rounded-br-none"
                     }`}>
                        <p className="leading-relaxed">{m.text}</p>
                        <p className={`text-[9px] mt-2 opacity-60 text-right ${m.sender === "bot" ? "text-muted-foreground" : "text-white"}`}>
                          {m.timestamp}
                        </p>
                     </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                   <div className="bg-card border border-border p-4 rounded-2xl rounded-bl-none flex gap-1">
                      <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                   </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div className="px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-border/20 bg-secondary/5 cursor-default">
                {[
                  { text: 'Mejores Laptops', icon: ShoppingBag },
                  { text: 'Hardware Gaming', icon: Sparkles },
                  { text: 'Ofertas Hoy', icon: Search }
                ].map(s => (
                  <button 
                    key={s.text}
                    onClick={() => setInputValue(s.text)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-[10px] font-bold text-muted-foreground hover:border-primary hover:text-primary transition-all whitespace-nowrap"
                  >
                    <s.icon className="w-3 h-3" /> {s.text}
                  </button>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-card border-t border-border flex gap-3 cursor-default">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-secondary px-4 py-2.5 rounded-xl border border-transparent focus:border-primary outline-none text-sm transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="p-3 rounded-xl bg-primary text-primary-foreground hover:glow-blue disabled:opacity-50 disabled:hover:glow-none transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          if (!isDragging) setIsOpen(!isOpen);
        }}
        className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-2xl hover:glow-blue relative group overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
               <X className="w-8 h-8" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
               <MessageCircle className="w-8 h-8" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Pulsing indicator when closed */}
        {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-accent"></span>
            </span>
        )}
      </motion.button>
    </motion.div>
  );
}
