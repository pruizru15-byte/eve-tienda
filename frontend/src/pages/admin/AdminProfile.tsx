import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, Mail, Lock, Camera, Save, Loader2, 
  ShieldCheck, KeyRound, AlertCircle, CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminProfile() {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const res = await fetch("http://localhost:3000/api/auth/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email
        })
      });

      if (res.ok) {
        const result = await res.json();
        localStorage.setItem("user", JSON.stringify(result.user));
        setUser(result.user);
        toast({
          title: "¡Perfil Actualizado!",
          description: "Tus datos han sido guardados correctamente, panzón.",
        });
      } else {
        const err = await res.json();
        throw new Error(err.error || "Error al actualizar");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Las contraseñas no coinciden."
      });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/change-password", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ 
          currentPassword: passData.currentPassword,
          newPassword: passData.newPassword 
        })
      });

      if (res.ok) {
        setIsChangingPass(false);
        setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        toast({
          title: "Contraseña Actualizada",
          description: "Tu seguridad ha sido reforzada.",
        });
      } else {
        const err = await res.json();
        throw new Error(err.error || "Error al cambiar contraseña");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("http://localhost:3000/api/auth/avatar", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });
      if (res.ok) {
        const result = await res.json();
        localStorage.setItem("user", JSON.stringify(result.user));
        setUser(result.user);
        toast({
          title: "Avatar Actualizado",
          description: "Ahora te ves más imponente.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo subir la imagen."
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex bg-background min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-background min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
          
          <header className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-display font-bold tracking-tight">Mi Perfil</h1>
              <p className="text-muted-foreground mt-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Panel de control de identidad administrativa
              </p>
            </div>
            <div className="hidden md:block">
               <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
                  Acceso Nivel: Super Administrador
               </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Sidebar Profile Info */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-8 text-center relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                
                <div className="relative z-10">
                  <div className="w-32 h-32 rounded-[24px] bg-gradient-to-br from-primary via-accent to-primary p-[2px] mx-auto mb-6 group-hover:scale-105 transition-transform relative">
                    <div className="w-full h-full rounded-[22px] bg-card flex items-center justify-center text-4xl font-bold overflow-hidden">
                      {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.split(" ").map((n: string) => n[0]).join("") || "A"
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-2xl cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-xl shadow-primary/30 border-4 border-background">
                      <Camera className="w-4 h-4" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </label>
                  </div>
                  
                  <h2 className="text-2xl font-display font-bold mb-1">{user?.name}</h2>
                  <p className="text-primary text-[10px] font-bold uppercase tracking-[4px] mb-6">Administrador</p>
                  
                  <div className="flex flex-col gap-3">
                     <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/30 text-xs text-muted-foreground border border-transparent hover:border-border transition-colors">
                        <Mail className="w-4 h-4 text-primary" />
                        <span className="truncate">{user?.email}</span>
                     </div>
                     <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/30 text-xs text-muted-foreground border border-transparent hover:border-border transition-colors">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>Cuenta Verificada</span>
                     </div>
                  </div>
                </div>
              </motion.div>

              <div className="card p-6 space-y-4">
                 <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">Tips de Seguridad</h4>
                 <div className="space-y-3">
                    <div className="flex gap-3 text-xs leading-relaxed">
                       <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                       <p>No compartas tus credenciales con otros administradores, panda.</p>
                    </div>
                    <div className="flex gap-3 text-xs leading-relaxed">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                       <p>Usa una contraseña fuerte con caracteres especiales.</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Main Form Area */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Personal Data */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card p-8 md:p-10 relative overflow-hidden"
              >
                <div className="absolute top-8 right-10 opacity-10 pointer-events-none">
                   <User className="w-24 h-24" />
                </div>
                
                <h3 className="text-xl font-display font-bold mb-8">Información de Usuario</h3>
                
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="label text-[10px] text-muted-foreground font-bold uppercase tracking-widest ml-1">Nombre Completo</label>
                       <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                          <Input 
                             value={user?.name || ""} 
                             onChange={(e) => setUser({...user, name: e.target.value})}
                             className="input pl-12 h-14 bg-secondary/50 border-transparent focus:bg-background" 
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="label text-[10px] text-muted-foreground font-bold uppercase tracking-widest ml-1">Email Corporativo</label>
                       <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                          <Input 
                             value={user?.email || ""} 
                             onChange={(e) => setUser({...user, email: e.target.value})}
                             type="email"
                             className="input pl-12 h-14 bg-secondary/50 border-transparent focus:bg-background" 
                          />
                       </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSaving}
                      className="btn-primary h-14 px-10 text-[10px] font-bold uppercase tracking-widest shadow-xl gap-3 border-none"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Guardar Cambios
                    </Button>
                  </div>
                </form>
              </motion.div>

              {/* Security / Password */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="card p-8 md:p-10"
              >
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                        <Lock className="w-5 h-5" />
                     </div>
                     <h3 className="text-xl font-display font-bold">Seguridad y Acceso</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsChangingPass(!isChangingPass)}
                    className="text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 hover:text-primary"
                  >
                    {isChangingPass ? "Cancelar" : "Modificar Contraseña"}
                  </Button>
                </div>

                {isChangingPass ? (
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="space-y-2">
                       <label className="label text-[10px] text-muted-foreground font-bold uppercase tracking-widest ml-1">Contraseña Actual</label>
                       <div className="relative">
                          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                             type="password"
                             value={passData.currentPassword}
                             onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                             required
                             className="input pl-12 h-14 bg-secondary/50 border-transparent focus:bg-background" 
                          />
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="label text-[10px] text-muted-foreground font-bold uppercase tracking-widest ml-1">Nueva Contraseña</label>
                        <Input 
                           type="password"
                           value={passData.newPassword}
                           onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                           required
                           className="input h-14 bg-secondary/50 border-transparent focus:bg-background" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="label text-[10px] text-muted-foreground font-bold uppercase tracking-widest ml-1">Confirmar Contraseña</label>
                        <Input 
                           type="password"
                           value={passData.confirmPassword}
                           onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                           required
                           className="input h-14 bg-secondary/50 border-transparent focus:bg-background" 
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={isSaving}
                        className="btn-primary bg-rose-500 hover:bg-rose-600 border-none h-14 px-10 text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-rose-500/20 gap-3"
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        Actualizar Credenciales
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="p-6 rounded-2xl bg-secondary/10 border border-dashed border-border flex flex-col items-center justify-center text-center gap-2">
                      <ShieldCheck className="w-8 h-8 text-muted-foreground opacity-20" />
                      <p className="text-xs text-muted-foreground">Tus credenciales están protegidas con encriptación de grado militar.</p>
                  </div>
                )}
              </motion.div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
