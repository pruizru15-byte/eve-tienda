import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Package, CreditCard, Ship, Clock } from "lucide-react";

interface Event {
  day: number;
  month: number;
  year: number;
  type: "purchase" | "delivery";
  title: string;
  item: string;
}

const EVENTS: Event[] = [
  { day: 15, month: 2, year: 2024, type: "purchase", title: "Compra Realizada", item: "NovaPro X1 Mouse" },
  { day: 22, month: 2, year: 2024, type: "delivery", title: "Entrega Estimada", item: "NovaPro X1 Mouse" },
  { day: 2, month: 2, year: 2024, type: "purchase", title: "Compra Realizada", item: "Teclado Quantum v2" },
  { day: 8, month: 2, year: 2024, type: "delivery", title: "Entregado", item: "Teclado Quantum v2" },
];

export default function ProfileCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 2, 1)); // Iniciamos en Marzo 2024
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const years = [2023, 2024, 2025, 2026];

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const handleMonthChange = (monthIdx: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIdx, 1));
  };

  const handleYearChange = (year: number) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
  };

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = Array.from({ length: daysInMonth(currentDate.getMonth(), currentDate.getFullYear()) }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth(currentDate.getMonth(), currentDate.getFullYear()) }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    return EVENTS.filter(e => e.day === day && e.month === currentDate.getMonth() && e.year === currentDate.getFullYear());
  };

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="glass p-6 rounded-[2rem] border border-border/50 bg-card/30 backdrop-blur-xl h-full shadow-2xl relative">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl font-display font-bold leading-none mb-1">Agenda Logística</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Seguimiento de compras y entregas</p>
        </div>
        
        {/* New Premium Selectors */}
        <div className="flex items-center gap-2">
          <select 
            value={currentDate.getMonth()} 
            onChange={(e) => handleMonthChange(parseInt(e.target.value))}
            className="bg-secondary/50 border border-border rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
          >
            {monthNames.map((m, i) => <option key={m} value={i} className="bg-background">{m}</option>)}
          </select>
          <select 
            value={currentDate.getFullYear()} 
            onChange={(e) => handleYearChange(parseInt(e.target.value))}
            className="bg-secondary/50 border border-border rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
          >
            {years.map(y => <option key={y} value={y} className="bg-background">{y}</option>)}
          </select>
          <div className="flex gap-1 ml-2">
            <button onClick={goToPrevMonth} className="p-2 rounded-xl bg-secondary/50 hover:bg-primary/20 transition-all text-muted-foreground hover:text-primary border border-border">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button onClick={goToNextMonth} className="p-2 rounded-xl bg-secondary/50 hover:bg-primary/20 transition-all text-muted-foreground hover:text-primary border border-border">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 px-2">
        <h4 className="text-2xl font-display font-bold text-primary">{monthNames[currentDate.getMonth()]} <span className="text-muted-foreground/30 font-light">{currentDate.getFullYear()}</span></h4>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 mb-4">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {blanks.map((b) => (
          <div key={`blank-${b}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const events = getEventsForDay(day);
          const hasEvents = events.length > 0;
          const hasPurchase = events.some(e => e.type === "purchase");
          const hasDelivery = events.some(e => e.type === "delivery");

          return (
            <motion.div
              key={day}
              whileHover={{ scale: 1.05 }}
              onClick={() => hasEvents && setSelectedDay(day)}
              className={`aspect-square rounded-xl p-1 relative flex items-center justify-center border transition-all cursor-pointer ${
                hasEvents 
                  ? "bg-primary/10 border-primary/40 shadow-[0_0_10px_rgba(var(--primary),0.1)]" 
                  : "bg-secondary/20 border-border/30 hover:bg-secondary/40"
              }`}
            >
              <span className={`text-sm font-bold ${hasEvents ? "text-primary" : "text-muted-foreground"}`}>
                {day}
              </span>
              
              <div className="absolute bottom-1.5 flex gap-1">
                {hasPurchase && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                {hasDelivery && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Event Details Modal Overlay */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDay(null)}
            className="absolute inset-0 z-50 rounded-[2rem] bg-background/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass p-8 rounded-3xl border border-primary/30 w-full max-w-sm space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-border pb-4">
                <h4 className="text-xl font-display font-bold">Día {selectedDay}</h4>
                <button onClick={() => setSelectedDay(null)} className="text-muted-foreground hover:text-foreground">Cerrar</button>
              </div>

              <div className="space-y-4">
                {selectedEvents.map((event, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-secondary/50 border border-border/50">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      event.type === "purchase" ? "bg-blue-500/10 text-blue-400" : "bg-green-500/10 text-green-400"
                    }`}>
                      {event.type === "purchase" ? <CreditCard className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{event.title}</p>
                      <p className="text-sm font-bold">{event.item}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {event.type === "purchase" 
                          ? "El color AZUL identifica una transacción confirmada en sistema." 
                          : "El color VERDE identifica el arribo de hardware a tu dirección."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-border/50 flex flex-wrap gap-4 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Fecha de Compra</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Llegada de Producto</span>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-[2px]">Próxima Entrega en 3 días</span>
        </div>
      </div>
    </div>
  );
}
