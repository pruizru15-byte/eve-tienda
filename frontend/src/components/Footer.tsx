import { Link } from "react-router-dom";
import { 
  Mail, MapPin, Phone, Github, Twitter, Linkedin, 
  Instagram, Youtube, ChevronRight 
} from "lucide-react";
import { useContactSettings } from "../hooks/useContactSettings";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function Footer() {
  const { data: settings, isLoading: settingsLoading } = useContactSettings();
  
  const { data: categories, isLoading: categoriesLoading } = useQuery<any[]>({
    queryKey: ['featured-categories-footer'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/featured-categories`);
      if (!res.ok) throw new Error("Error fetching categories");
      return res.json();
    },
    staleTime: 1000 * 60 * 30 // 30 mins
  });

  const socialLinks = [
    { icon: Twitter, url: settings?.twitter_url, label: "Twitter" },
    { icon: Linkedin, url: settings?.linkedin_url, label: "LinkedIn" },
    { icon: Github, url: settings?.github_url, label: "GitHub" },
    // Acomodamos a lo que el modelo tiene, pero si pides IG/YT y no están en DB, no se renderizan
  ];

  return (
    <footer className="relative border-t border-border/50 bg-background overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12">
          
          {/* Column 1: Brand & Socials */}
          <div className="space-y-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-lg shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                N
              </div>
              <span className="font-display font-black text-2xl tracking-tighter uppercase italic">
                Nova<span className="text-primary">Tech</span>
              </span>
            </Link>
            
            <p className="text-sm text-muted-foreground leading-relaxed font-medium max-w-xs">
              Elevando el estándar de la tecnología premium. Ingeniería de vanguardia para arquitectos digitales y gamers de élite.
            </p>

            <div className="flex items-center gap-4">
              {settingsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="w-11 h-11 rounded-2xl bg-secondary" />
                ))
              ) : (
                socialLinks.map((social, i) => (
                  social.url && social.url !== "#" && (
                    <a
                      key={i}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 rounded-2xl bg-secondary/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary-foreground hover:bg-primary transition-all duration-500 hover:shadow-xl hover:shadow-primary/20 group"
                    >
                      <social.icon className="w-5 h-5 transition-transform duration-500 group-hover:rotate-12" />
                    </a>
                  )
                ))
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Navegación</h4>
            <ul className="space-y-4">
              {[
                { label: "Inicio", href: "/" },
                { label: "Productos", href: "/productos" },
                { label: "Ofertas", href: "/#ofertas" },
                { label: "Nosotros", href: "/#nosotros" }
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-all flex items-center gap-2 group"
                  >
                    <ChevronRight className="w-3 h-3 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Categories (Dynamic) */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Ecosistemas</h4>
            <ul className="space-y-4">
              {categoriesLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <li key={i}><Skeleton className="h-4 w-3/4 bg-secondary rounded-md" /></li>
                ))
              ) : (
                categories?.slice(0, 4).map((cat) => (
                  <li key={cat.id}>
                    <Link 
                      to={cat.category_id ? `/productos?categoria=${cat.category_id}` : "/productos"}
                      className="text-sm text-muted-foreground hover:text-foreground transition-all flex items-center gap-2 group"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary transition-colors" />
                      {cat.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Conexión Directa</h4>
            <ul className="space-y-6">
              {settingsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <li key={i} className="flex gap-4">
                    <Skeleton className="w-10 h-10 rounded-xl bg-secondary shrink-0" />
                    <div className="space-y-2 w-full pt-1">
                      <Skeleton className="h-4 w-1/2 bg-secondary" />
                      <Skeleton className="h-3 w-3/4 bg-secondary" />
                    </div>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="text-sm">
                      <p className="text-foreground font-black uppercase tracking-tighter">{settings?.address_line1}</p>
                      <p className="text-muted-foreground">{settings?.address_line2}</p>
                    </div>
                  </li>
                  <li className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="text-sm">
                      <p className="text-foreground font-black uppercase tracking-tighter">{settings?.phone}</p>
                      <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">{settings?.phone_subtext}</p>
                    </div>
                  </li>
                  <li className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="text-sm">
                      <p className="text-foreground font-black uppercase tracking-tighter">{settings?.support_email}</p>
                      <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">{settings?.email_subtext}</p>
                    </div>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 mt-20 pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
            <span>© {new Date().getFullYear()} NovaTech Store</span>
            <span className="hidden md:block opacity-20">|</span>
            <span className="italic">High-End Technology Experience</span>
          </div>
          
          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
            <a href="#" className="hover:text-primary transition-all">Privacidad</a>
            <a href="#" className="hover:text-primary transition-all">Términos</a>
            <a href="#" className="hover:text-primary transition-all">Soporte</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
