import React from 'react';
import { IService } from '../../domain/models';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ArrowRight, DollarSign, LucideIcon, Globe, Code, PenTool, Database, Cpu, MessageSquare, Wrench } from 'lucide-react';

import { ServiceContactModal } from './ServiceContactModal';

interface ServiceGridProps {
  services: IService[];
  loading: boolean;
}

const getIcon = (iconName: string): LucideIcon => {
  const icons: Record<string, LucideIcon> = {
    'globe': Globe,
    'code': Code,
    'pen-tool': PenTool,
    'database': Database,
    'cpu': Cpu,
    'message-square': MessageSquare,
    'wrench': Wrench,
  };
  return icons[iconName] || MessageSquare;
};

export const ServiceGrid: React.FC<ServiceGridProps> = ({ services, loading }) => {
  const [selectedService, setSelectedService] = React.useState<IService | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleContactClick = (service: IService) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card p-0 h-[400px] bg-secondary/20 animate-pulse border-none" />
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center p-20 text-center border-dashed border-border/60 shadow-inner bg-card/40 backdrop-blur-xl">
        <div className="bg-primary/10 p-6 rounded-full mb-6">
          <MessageSquare className="w-12 h-12 text-primary/40" />
        </div>
        <h3 className="text-2xl font-bold text-foreground">Sin resultados</h3>
        <p className="text-muted-foreground mt-2 max-w-sm">No encontramos servicios que coincidan con tus filtros. Prueba ajustando tu búsqueda o presupuesto.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {services.map((service) => {
          const Icon = getIcon(service.icon);
          return (
            <Card key={service.id} className="card p-0 group relative overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl border-none bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-2xl ring-1 ring-border/50">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon className="w-32 h-32 -mr-8 -mt-8" />
              </div>
              
              <CardHeader className="pt-8 px-8">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary/10 p-3 rounded-2xl">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold tracking-tighter uppercase px-3 py-1 bg-background/50 backdrop-blur-sm rounded-full">
                    {service.category?.title || 'General'}
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors leading-tight">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-sm line-clamp-2 mt-2 leading-relaxed font-medium">
                  {service.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 mt-4">
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center text-3xl font-black text-foreground">
                    <span className="text-lg opacity-40 mr-1">$</span>
                    {service.price.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none bg-secondary/30 px-2 py-1 rounded">
                    {service.price_model}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {service.features && JSON.parse(service.features as any).slice(0,3).map((f: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="bg-secondary/20 hover:bg-secondary/30 transition-colors border-none text-[10px] font-bold py-1 px-3">
                      • {f}
                    </Badge>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="p-4 bg-primary/[0.03] mt-4">
                <Button 
                  onClick={() => handleContactClick(service)}
                  className="btn-primary w-full h-14 text-lg justify-center shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 group px-0"
                >
                  Contratar ahora
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <ServiceContactModal 
        service={selectedService}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
