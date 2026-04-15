import React, { useState } from 'react';
import { IService } from '../../domain/models';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { MessageCircle, Calendar, GraduationCap, LineChart, ShieldCheck, X } from 'lucide-react';

interface ServiceContactModalProps {
  service: IService | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ServiceContactModal: React.FC<ServiceContactModalProps> = ({
  service,
  isOpen,
  onClose,
}) => {
  const [plazo, setPlazo] = useState<string>('');
  const [nivel, setNivel] = useState<string>('');
  const [avance, setAvance] = useState<string>('');

  if (!service) return null;

  // Parse dynamic options or use defaults
  const options = service.contact_options 
    ? JSON.parse(service.contact_options) 
    : {
        plazo: ["< 30 días", "1-3 meses", "> 3 meses"],
        nivel: ["Pregrado", "Maestría", "Doctorado"],
        avance: ["Solo idea", "Borrador", "Necesito desde cero"]
      };

  const handleWhatsAppRedirect = () => {
    const phoneNumber = service.whatsapp_number || '1234567890';
    const message = `Hola NovaTech! 👋 Estoy interesado en el servicio: *${service.title}*
Referencia de precio: $${service.price.toLocaleString()} (${service.price_model})

*Detalles de mi proyecto:*
- 🕒 *Plazo deseado:* ${plazo || 'No especificado'}
- 🎓 *Nivel académico:* ${nivel || 'No especificado'}
- 📈 *Avance actual:* ${avance || 'No especificado'}

¿Podrían darme más información?`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl card p-0 border-none shadow-2xl backdrop-blur-3xl overflow-hidden bg-gradient-to-br from-card/95 to-card/90">
        {/* Header Visual */}
        <div className="bg-primary/5 p-8 border-b border-border/40">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-none text-[10px] font-black uppercase tracking-widest px-3 py-1 mb-2">
                {service.category?.title || 'General'}
              </Badge>
              <DialogTitle className="text-3xl font-black tracking-tight text-foreground leading-tight">
                {service.title}
              </DialogTitle>
              <p className="text-muted-foreground font-medium text-sm max-w-sm italic">
                {service.description}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-primary">
                <span className="text-sm opacity-60 mr-1">$</span>
                {service.price.toLocaleString()}
              </div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {service.price_model}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Selectors Section */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
              <LineChart className="w-3 h-3" /> Califica tu Proyecto
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Plazo Deseado
                </label>
                <Select value={plazo} onValueChange={setPlazo}>
                  <SelectTrigger className="bg-secondary/30 border-border/40 rounded-xl h-12 font-bold focus:ring-primary/20">
                    <SelectValue placeholder="Seleccionar plazo..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/40 bg-card/95 backdrop-blur-xl">
                    {options.plazo.map((opt: string) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                  <GraduationCap className="w-3 h-3" /> Nivel Académico
                </label>
                <Select value={nivel} onValueChange={setNivel}>
                  <SelectTrigger className="bg-secondary/30 border-border/40 rounded-xl h-12 font-bold focus:ring-primary/20">
                    <SelectValue placeholder="Seleccionar nivel..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/40 bg-card/95 backdrop-blur-xl">
                    {options.nivel.map((opt: string) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                  💡 Avance Actual
                </label>
                <Select value={avance} onValueChange={setAvance}>
                  <SelectTrigger className="bg-secondary/30 border-border/40 rounded-xl h-12 font-bold focus:ring-primary/20">
                    <SelectValue placeholder="Seleccionar avance..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/40 bg-card/95 backdrop-blur-xl">
                    {options.avance.map((opt: string) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Trust Text */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-500/5 border border-green-500/10">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <div className="text-xs font-bold text-green-600/80 tracking-tight">
              {service.trust_text || "✅ +50 proyectos entregados exitosamente | Primera revisión técnica incluida."}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-8 bg-secondary/20 flex flex-col md:flex-row gap-4 mt-0">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="btn-secondary h-14 flex-1 uppercase text-xs tracking-widest justify-center"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleWhatsAppRedirect}
            className="btn-primary h-14 flex-[2] text-sm shadow-xl shadow-primary/20 flex gap-3 px-8 uppercase tracking-widest items-center justify-center focus:scale-100"
          >
            <MessageCircle className="w-5 h-5" />
            Continuar a WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
