import { motion } from "framer-motion";
import { Printer, X } from "lucide-react";

interface OrderReceiptProps {
  order: any;
  onClose: () => void;
}

export default function OrderReceipt({ order, onClose }: OrderReceiptProps) {
  if (!order) return null;

  const items = JSON.parse(order.items || "[]");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm no-print"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white text-black min-h-[500px] flex flex-col font-mono shadow-2xl overflow-hidden print:shadow-none print:p-0"
      >
        {/* Thermal Paper Jagged Edge Effect */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[radial-gradient(circle,transparent_0,transparent_4px,white_4px,white_100%)] bg-[length:16px_16px] z-10 no-print" />
        
        <div className="p-8 flex-1 flex flex-col pt-10">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-black tracking-tighter leading-none mb-1">NOVATECH STORE</h2>
                <p className="text-[10px] uppercase tracking-widest font-bold">RUC: 20608745211</p>
                <p className="text-[9px] text-gray-500 italic">Av. Ingeniería de Vanguardia 101, Hub Tech</p>
                <p className="text-[9px] text-gray-500 italic">Lima, Perú</p>
                <div className="my-4 border-t border-dashed border-gray-300" />
                <div className="bg-black text-white py-1 px-4 inline-block font-bold text-sm tracking-widest uppercase mb-2">
                    Boleta de Venta
                </div>
                <p className="text-sm font-bold uppercase">B001-{order.id.split('-')[0].toUpperCase()}</p>
            </div>

            <div className="space-y-1 text-[11px] mb-6">
                <div className="flex justify-between">
                    <span className="text-gray-500 uppercase font-bold">FECHA:</span>
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500 uppercase font-bold">HORA:</span>
                    <span>{new Date(order.created_at).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500 uppercase font-bold">CLIENTE:</span>
                    <span className="font-bold">{(order.user?.name || "USUARIO").toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500 uppercase font-bold">ESTADO:</span>
                    <span className="font-bold text-primary">{order.status}</span>
                </div>
            </div>

            <div className="border-t border-dashed border-gray-300 pt-4 mb-4">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-dashed border-gray-300">
                            <th className="py-2 text-left">PRODUCTO</th>
                            <th className="py-2 text-center">CNT</th>
                            <th className="py-2 text-right">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item: any) => (
                            <tr key={item.id} className="border-b border-gray-50">
                                <td className="py-3 leading-tight pr-2">
                                    <span className="block font-bold text-[10px]">{item.name}</span>
                                    <span className="text-[9px] text-gray-400">P.U: S/. {item.price.toLocaleString()}</span>
                                </td>
                                <td className="py-3 text-center">x{item.quantity}</td>
                                <td className="py-3 text-right font-bold">S/. {(item.price * item.quantity).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="border-t-2 border-dashed border-black pt-4 mt-auto">
                <div className="flex justify-between items-center mb-1">
                    <span className="uppercase font-bold text-xs tracking-tighter">SUBTOTAL GRAVADO</span>
                    <span className="font-bold text-xs">S/. {order.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                    <span className="uppercase font-bold text-xs tracking-tighter">IGV (0%)</span>
                    <span className="font-bold text-xs">S/. 0.00</span>
                </div>
                <div className="flex justify-between items-center mt-4 border-t-2 border-black pt-2">
                    <span className="text-lg font-black uppercase tracking-tighter">TOTAL A PAGAR</span>
                    <span className="text-2xl font-black">S/. {order.total.toLocaleString()}</span>
                </div>
            </div>

            <div className="mt-8 text-center print:mt-4">
                <div className="w-full h-10 border border-black flex items-center justify-center mb-4">
                    <span className="text-[10px] font-bold tracking-[8px]">NOVAS-TOKEN-{order.id.split('-')[0].toUpperCase()}</span>
                </div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-gray-500 mb-6">
                    ¡Gracias por tu compra, panzón!
                    <br /> NovaTech • Ingeniería de Vanguardia
                </p>
                
                <div className="flex flex-col gap-2 no-print">
                    <button 
                        onClick={() => window.print()} 
                        className="w-full py-4 bg-black text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                    >
                        <Printer className="w-4 h-4" /> Imprimir / Guardar PDF
                    </button>
                    <button 
                        onClick={onClose} 
                        className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-bold uppercase text-[9px] tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                        <X className="w-3 h-3" /> Cerrar Boleta
                    </button>
                </div>
            </div>
        </div>
        
        {/* Bottom Jagged Edge */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-[radial-gradient(circle,transparent_0,transparent_4px,white_4px,white_100%)] bg-[length:16px_16px] rotate-180 no-print" />
      </motion.div>
    </div>
  );
}
