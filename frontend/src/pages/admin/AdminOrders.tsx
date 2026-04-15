import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Package,
  Printer,
  X,
  User,
  Mail,
  Calendar,
  CreditCard
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import OrderReceipt from "@/components/OrderReceipt";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { toast } from "sonner";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/admin/orders", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.ok) {
        setOrders(await response.json());
      }
    } catch (error) {
      toast.error("Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleComplete = async (id: string) => {
    if (processingId) return;
    setProcessingId(id);
    try {
      const response = await fetch(`http://localhost:3000/api/admin/orders/${id}/complete`, {
        method: 'PATCH',
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.ok) {
        toast.success("Venta realizada y stock actualizado");
        await fetchOrders();
        // Abrir voucher si es el seleccionado
        if (selectedOrder?.id === id) {
            setVoucherOpen(true);
        }
      } else {
        const err = await response.json();
        toast.error(err.error || "Error al completar venta");
      }
    } catch (error) {
      toast.error("Error al completar venta");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (processingId) return;
    setProcessingId(id);
    try {
      const response = await fetch(`http://localhost:3000/api/admin/orders/${id}/cancel`, {
        method: 'PATCH',
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.ok) {
        toast.success("Venta anulada");
        await fetchOrders();
      } else {
        const err = await response.json();
        toast.error(err.error || "Error al anular venta");
      }
    } catch (error) {
      toast.error("Error al anular venta");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Strategic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { 
              label: 'Ingresos Totales', 
              value: `S/. ${orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + o.total, 0).toLocaleString()}`, 
              icon: CreditCard, 
              color: 'emerald' 
            },
            { 
              label: 'Órdenes Pendientes', 
              value: orders.filter(o => o.status === 'PENDING').length, 
              icon: Clock, 
              color: 'amber' 
            },
            { 
              label: 'Ventas Cerradas', 
              value: orders.filter(o => o.status === 'COMPLETED').length, 
              icon: CheckCircle, 
              color: 'blue' 
            },
            { 
              label: 'Ticket Promedio', 
              value: `S/. ${(orders.reduce((sum, o) => sum + o.total, 0) / (orders.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 
              icon: ShoppingBag, 
              color: 'iris' 
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card p-6 flex items-center gap-5 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`p-4 rounded-[20px] bg-${stat.color}-500/10 text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-1">{stat.label}</p>
                <h3 className="text-2xl font-display font-black tracking-tight">{stat.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-secondary/30">
                    <th className="px-6 py-5">Identificador</th>
                    <th className="px-6 py-5">Ciudadano</th>
                    <th className="px-6 py-5">Monto Total</th>
                    <th className="px-6 py-5">Registro</th>
                    <th className="px-6 py-5 text-center">Estado Logístico</th>
                    <th className="px-6 py-5 text-center">Protocolos</th>
                  </tr>
               </thead>
               <thead>
                 <tr className="bg-secondary/30 text-[10px] uppercase tracking-widest font-bold text-muted-foreground border-b border-border/50">
                    <th className="px-6 py-4 font-bold">Orden ID</th>
                    <th className="px-6 py-4 font-bold">Cliente</th>
                    <th className="px-6 py-4 font-bold">Total</th>
                    <th className="px-6 py-4 font-bold">Fecha</th>
                    <th className="px-6 py-4 font-bold">Estado</th>
                    <th className="px-6 py-4 text-center font-bold">Acciones</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border/30">
                 {loading ? (
                    Array(5).fill(0).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                            <td colSpan={6} className="px-6 py-8 bg-secondary/10" />
                        </tr>
                    ))
                 ) : paginatedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-secondary/10 transition-colors group">
                        <td className="px-6 py-4 font-mono text-xs text-primary font-bold">
                            #{order.id.split('-')[0].toUpperCase()}
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="font-bold text-sm">{order.user?.name}</span>
                                <span className="text-[10px] text-muted-foreground">{order.user?.email}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 font-black text-sm text-foreground">
                            S/ {order.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-xs">
                            {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest ${
                                order.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                                order.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                                'bg-rose-500/10 text-rose-500'
                            }`}>
                                {order.status === 'PENDING' ? 'Pendiente' : order.status === 'COMPLETED' ? 'Vendido' : 'Anulado'}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => { setSelectedOrder(order); setVoucherOpen(false); }}
                                  className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-white transition-all shadow-sm"
                                  title="Ver Detalles"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                                {order.status === 'PENDING' && (
                                    <>
                                        <button 
                                          onClick={() => handleComplete(order.id)}
                                          disabled={!!processingId}
                                          className={`p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-sm ${processingId === order.id ? 'animate-pulse opacity-50' : ''}`}
                                          title="Marcar como Vendido"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                        <button 
                                          onClick={() => handleCancel(order.id)}
                                          disabled={!!processingId}
                                          className={`p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm ${processingId === order.id ? 'animate-pulse opacity-50' : ''}`}
                                          title="Anular Pedido"
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                                {order.status === 'COMPLETED' && (
                                    <button 
                                      onClick={() => { setSelectedOrder(order); setVoucherOpen(true); }}
                                      className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                      title="Imprimir Boleta"
                                    >
                                        <Printer className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                 ))}
               </tbody>
            </table>
          </div>
          <AdminPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredOrders.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </main>

      {/* Modal logic */}
      <AnimatePresence>
         {/* Details Modal */}
         {selectedOrder && !voucherOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }}
                 onClick={() => setSelectedOrder(null)}
                 className="absolute inset-0 bg-background/80 backdrop-blur-sm"
               />
               <motion.div
                 initial={{ opacity: 0, scale: 0.95, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95, y: 20 }}
                 className="relative w-full max-w-2xl card overflow-hidden flex flex-col shadow-2xl"
               >
                    <div className="p-8 border-b border-border/50 bg-secondary/30 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <Package className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-display font-black text-2xl uppercase tracking-tighter">Orden #{selectedOrder.id.split('-')[0].toUpperCase()}</h3>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(selectedOrder.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-secondary rounded-xl transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-8 flex-1 overflow-y-auto max-h-[60vh]">
                        <div className="grid grid-cols-2 gap-8 mb-10">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Datos del Cliente</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-sm font-bold"><User className="w-4 h-4 text-muted-foreground" /> {selectedOrder.user?.name}</div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground"><Mail className="w-4 h-4 text-muted-foreground" /> {selectedOrder.user?.email}</div>
                                </div>
                            </div>
                            <div className="space-y-4 text-right">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Resumen de Pago</h4>
                                <div className="space-y-2">
                                    <div className="text-xs text-muted-foreground uppercase font-bold text-primary">Total Consolidado</div>
                                    <div className="text-4xl font-display font-black text-foreground drop-shadow-sm">S/ {selectedOrder.total.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Ítems Seleccionados</h4>
                            <div className="space-y-3">
                                {JSON.parse(selectedOrder.items).map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/10 hover:bg-secondary/30 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm tracking-tight">{item.name}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Cant: {item.quantity}</span>
                                        </div>
                                        <span className="font-black text-primary text-sm whitespace-nowrap leading-none px-2 py-1 rounded bg-primary/10">S/ {(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 border-t border-border/50 bg-secondary/10 flex gap-4">
                        {selectedOrder.status === 'PENDING' ? (
                            <>
                            <button 
                                onClick={() => handleComplete(selectedOrder.id)}
                                disabled={!!processingId}
                                className={`btn-primary bg-emerald-500 border-none hover:bg-emerald-600 shadow-emerald-500/20 flex-1 h-14 text-[10px] uppercase font-bold tracking-widest ${processingId === selectedOrder.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {processingId === selectedOrder.id ? 'Procesando...' : 'Confirmar Venta Realizada'}
                            </button>
                            <button 
                                onClick={() => handleCancel(selectedOrder.id)}
                                disabled={!!processingId}
                                className={`btn-secondary border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white px-8 h-14 uppercase tracking-widest font-bold text-[10px] ${processingId === selectedOrder.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Anular
                            </button>
                            </>
                        ) : (
                            <button 
                                onClick={() => setVoucherOpen(true)}
                                className="btn-primary w-full h-14 border-none text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2"
                            >
                                <Printer className="w-5 h-5" /> Ver Comprobante
                            </button>
                        )}
                    </div>
               </motion.div>
            </div>
         )}

         {/* Receipt Modal (Stand-alone) */}
         {voucherOpen && selectedOrder && (
            <OrderReceipt 
                order={selectedOrder} 
                onClose={() => { setVoucherOpen(false); }} 
            />
         )}
      </AnimatePresence>
    </div>
  );
}
