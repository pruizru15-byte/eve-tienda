import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, TrendingUp, Hash, Award, Bell, Filter, LayoutGrid, List } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ForumSection from "@/components/ForumSection";
import CreatePost from "@/components/CreatePost";

const ForumPage = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [activeTab, setActiveTab] = useState("recientes");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePostCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const sidebarStats = [
    { label: "Miembros Activos", value: "2.5k+", icon: Users },
    { label: "Hilos Hoy", value: "142", icon: TrendingUp },
    { label: "Soluciones", value: "85k", icon: Award },
  ];

  const categories = ["#Hardware", "#Gaming", "#Desarrollo", "#IA", "#Setup", "#Debate"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          
          {/* Forum Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                Comunidad Global
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-bold">
                Nova<span className="text-primary">Foro</span>
              </h1>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 bg-secondary/30 p-2 rounded-2xl border border-border/50"
            >
              <button 
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-xl transition-all ${viewMode === "list" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
              >
                <List className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-xl transition-all ${viewMode === "grid" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Sidebar Left: Stats & Trends */}
            <aside className="lg:col-span-3 space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-secondary/10 space-y-8 p-8"
              >
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" /> Estadísticas
                  </h3>
                  <div className="space-y-6">
                    {sidebarStats.map((stat, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xl font-bold">{stat.value}</p>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground">{stat.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-border/50">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-primary" /> Tendencias
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button key={cat} className="px-3 py-1.5 rounded-lg bg-secondary/50 border border-border text-xs font-bold hover:border-primary/50 hover:text-primary transition-all">
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card bg-primary/5 border-primary/20 text-center relative overflow-hidden group p-8"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                  <Award className="w-24 h-24" />
                </div>
                <h4 className="text-sm font-bold mb-4 relative z-10">Conviértete en <span className="text-primary">Colaborador Elite</span></h4>
                <p className="text-[10px] text-muted-foreground mb-6 leading-relaxed relative z-10">Gana insignias exclusivas y acceso anticipado a hardware NovaPro.</p>
                <button className="btn-primary w-full py-3 text-xs tracking-wider shadow-lg shadow-primary/20 relative z-10 uppercase">
                  Saber más
                </button>
              </motion.div>
            </aside>

            {/* Main Content: Forum Feed */}
            <div className="lg:col-span-9 space-y-12">
              <div className="flex items-center gap-8 border-b border-border/50 pb-4">
                {["recientes", "populares", "seguidos"].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div layoutId="activeTab" className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </button>
                ))}
                <button className="ml-auto flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                  <Filter className="w-4 h-4" /> Filtrar
                </button>
              </div>

              {/* Reused and Enhanced Forum Section Content */}
              <div className={viewMode === "grid" ? "grid grid-cols-1 xl:grid-cols-2 gap-8" : "space-y-8"}>
                <CreatePost onPostCreated={handlePostCreated} />
                <ForumSection key={refreshKey} />
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForumPage;
