import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, Mail, ShieldCheck, UserPlus, LogIn, Globe, Settings, ShoppingBag, MapPin, Phone, ChevronRight, ChevronLeft, CheckCircle2, Key, Wand2, ShieldAlert, Eye, EyeOff, RefreshCw, BadgeCheck, Navigation } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

type AuthMode = "login" | "register";
type UserRole = "cliente" | "administrador" | "invitado";

const countries = [
  { code: "+54", name: "Argentina", flag: "🇦🇷", length: 10 },
  { code: "+57", name: "Colombia", flag: "🇨🇴", length: 10 },
  { code: "+52", name: "México", flag: "🇲🇽", length: 10 },
  { code: "+34", name: "España", flag: "🇪🇸", length: 9 },
  { code: "+1", name: "USA/Canada", flag: "🇺🇸", length: 10 },
  { code: "+56", name: "Chile", flag: "🇨🇱", length: 9 },
  { code: "+51", name: "Perú", flag: "🇵🇪", length: 9 },
  { code: "+58", name: "Venezuela", flag: "🇻🇪", length: 10 },
  { code: "+598", name: "Uruguay", flag: "🇺🇾", length: 8 },
  { code: "+593", name: "Ecuador", flag: "🇪🇨", length: 9 },
];

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [selectedRole, setSelectedRole] = useState<UserRole>("cliente");
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [step, setStep] = useState(1);
  const [regData, setRegData] = useState({ 
    name: "", 
    lastname: "",
    phonePrefix: countries[0].code,
    phone: "",
    address: "",
    city: "",
    country: "",
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    setPasswordStrength(score);
  };

  const generateSecurePassword = () => {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setRegData(prev => ({ ...prev, password: retVal, confirmPassword: retVal }));
    calculateStrength(retVal);
    toast.success("Contraseña imperial generada", {
      description: "Tu seguridad es ahora impenetrable."
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegData(prev => ({ ...prev, [name]: value }));
    if (name === "password") calculateStrength(value);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Tu navegador es tan viejo como tú, no soporta GPS.");
      return;
    }

    toast.promise(
      new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
              const data = await res.json();
              
              if (data.address) {
                const street = data.address.road || data.address.pedestrian || "";
                const houseNumber = data.address.house_number || "";
                const city = data.address.city || data.address.town || data.address.village || "";
                const country = data.address.country || "";
                
                setRegData(prev => ({
                  ...prev,
                  address: `${street} ${houseNumber}`.trim() || data.display_name.split(',')[0],
                  city: city,
                  country: country
                }));
                resolve(data);
              } else {
                reject("No pude encontrar tu calle");
              }
            } catch (err) {
              reject(err);
            }
          },
          (err) => reject(err),
          { timeout: 10000 }
        );
      }),
      {
        loading: 'Rastreando al panda...',
        success: 'Localización fijada. No intentes huir.',
        error: 'Error al encontrarte. ¿Vives en una cueva, panzón?'
      }
    );
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      navigate(user.role === "ADMIN" ? "/admin" : "/");
    }
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = (formData.get("email") as string) || regData.email;
    const password = (formData.get("password") as string) || regData.password;

    if (mode === "register") {
      if (step === 1) {
        if (regData.phone.length !== selectedCountry.length) {
          toast.error(`El número para ${selectedCountry.name} debe tener ${selectedCountry.length} dígitos, panzón.`);
          return;
        }
      }
      if (step < 3) {
        setStep(step + 1);
        return;
      }
      if (regData.password !== regData.confirmPassword) {
        toast.error("Las contraseñas no coinciden, panzón.");
        return;
      }
      if (passwordStrength < 3) {
        toast.error("Contraseña muy débil. ¿Quieres que te hackeen?");
        return;
      }
    }

    try {
      if (mode === "login") {
        const { user, token } = await authApi.login({ email, password });
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        toast.success("¡Bienvenido de nuevo!");
        navigate(user.role === "ADMIN" ? "/admin" : "/");
      } else {
        const response = await authApi.register({ 
          name: `${regData.name} ${regData.lastname}`, 
          email: regData.email, 
          password: regData.password, 
          role: selectedRole,
          phone: `${selectedCountry.code} ${regData.phone}`
        });
        toast.success(response.message || "Cuenta creada. Por favor verifica tu email.");
        setMode("login");
        setStep(1);
      }
    } catch (error: any) {
      toast.error(error.message || "Error en la autenticación");
    }
  };

  const roles = [
    { id: "cliente", label: "Cliente", icon: ShoppingBag },
    { id: "administrador", label: "Admin", icon: Settings },
    { id: "invitado", label: "Invitado", icon: Globe },
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
            step === s ? "bg-accent text-accent-foreground scale-110 shadow-lg" : 
            step > s ? "bg-green-500 text-white" : "bg-secondary text-muted-foreground"
          }`}>
            {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
          </div>
          {s < 3 && (
            <div className={`w-12 h-1 mx-1 rounded-full transition-all duration-500 ${step > s ? "bg-green-500" : "bg-secondary"}`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl glass rounded-[32px] border border-border/50 overflow-hidden shadow-2xl relative z-10"
      >
        <div className="p-8 md:p-10 bg-card/40 backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 hover:scale-105 transition-transform">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">N</div>
              <span className="font-display font-bold text-2xl tracking-tight">Nova<span className="text-primary">Tech</span></span>
            </Link>
            <h1 className="text-3xl font-display font-bold mb-2">
              {mode === "login" ? "¡Hola de nuevo!" : "Únete a la élite"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === "login" ? "Ingresa tus credenciales para continuar" : "Sigue los pasos para crear tu perfil profesional"}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="p-1 bg-secondary/50 rounded-2xl mb-8 flex relative">
            <button 
              onClick={() => { setMode("login"); setStep(1); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all relative z-10 ${mode === "login" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => { 
                setMode("register"); 
                setStep(1);
                if (selectedRole === "administrador") {
                  setSelectedRole("cliente");
                }
              }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all relative z-10 ${mode === "register" ? "text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Registrarse
            </button>
            <motion.div 
              animate={{ x: mode === "login" ? "0%" : "100%" }}
              className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-xl shadow-lg ${mode === "login" ? "bg-primary" : "bg-accent"}`}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>

          {/* Role selection mini */}
          <div className="flex gap-2 mb-8">
            {roles
              .filter(role => mode === "login" || role.id !== "administrador")
              .map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id as UserRole)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                    selectedRole === role.id ? "bg-primary/10 border-primary text-primary" : "bg-transparent border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <role.icon className="w-3 h-3" />
                  {role.label}
                </button>
              ))}
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <AnimatePresence mode="wait">
              {mode === "login" ? (
                <motion.div 
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Corporativo</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <input type="email" name="email" placeholder="nombre@novatech.com" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-secondary/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between ml-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Contraseña</label>
                      <a href="#" className="text-[10px] text-primary font-bold hover:underline tracking-widest uppercase">¿Olvidaste tu clave?</a>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <input type="password" name="password" placeholder="••••••••" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-secondary/30 border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all" required />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key={`step-${step}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  {renderStepIndicator()}
                  
                  {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Nombre</label>
                        <input 
                          type="text" 
                          name="name" 
                          value={regData.name}
                          onChange={handleInputChange}
                          placeholder="Alex" 
                          className="w-full px-4 py-3.5 rounded-2xl bg-secondary/30 border border-border focus:border-accent outline-none transition-all" 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Apellidos</label>
                        <input 
                          type="text" 
                          name="lastname"
                          value={regData.lastname}
                          onChange={handleInputChange}
                          placeholder="Rivers" 
                          className="w-full px-4 py-3.5 rounded-2xl bg-secondary/30 border border-border focus:border-accent outline-none transition-all" 
                          required 
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Teléfono Móvil</label>
                        <div className="flex gap-2">
                          <div className="relative">
                            <select 
                              onChange={(e) => {
                                const country = countries.find(c => c.code === e.target.value);
                                if (country) setSelectedCountry(country);
                              }}
                              className="appearance-none bg-secondary/30 border border-border rounded-2xl pl-10 pr-8 py-3.5 text-sm outline-none focus:border-accent transition-all cursor-pointer"
                            >
                              {countries.map(c => (
                                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                              ))}
                            </select>
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                          </div>
                          <div className="relative flex-1">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input 
                              type="tel" 
                              name="phone"
                              value={regData.phone}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, selectedCountry.length);
                                setRegData(prev => ({ ...prev, phone: val }));
                              }}
                              placeholder={`Ej: ${"9".repeat(selectedCountry.length)}`}
                              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-secondary/30 border border-border focus:border-accent outline-none transition-all" 
                              required 
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">
                              {regData.phone.length}/{selectedCountry.length}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <div className="flex justify-between items-end mb-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Dirección de Envío</label>
                          <button 
                            type="button"
                            onClick={handleGetLocation}
                            className="text-[10px] font-black text-accent hover:text-accent/80 flex items-center gap-1 uppercase tracking-tighter"
                          >
                            <Navigation className="w-3 h-3" /> Usar GPS
                          </button>
                        </div>
                        <div className="relative group">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                          <input 
                            type="text" 
                            name="address"
                            value={regData.address}
                            onChange={handleInputChange}
                            placeholder="Calle, Altura, Piso" 
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-secondary/30 border border-border focus:border-accent outline-none transition-all" 
                            required 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Ciudad</label>
                        <input 
                          type="text" 
                          name="city"
                          value={regData.city}
                          onChange={handleInputChange}
                          placeholder="Buenos Aires" 
                          className="w-full px-4 py-3.5 rounded-2xl bg-secondary/30 border border-border focus:border-accent outline-none transition-all" 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">País</label>
                        <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input 
                            type="text" 
                            name="country"
                            value={regData.country}
                            onChange={handleInputChange}
                            placeholder="Argentina" 
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-secondary/30 border border-border focus:border-accent outline-none transition-all" 
                            required 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Profesional</label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                          <input 
                            type="email" 
                            name="email" 
                            value={regData.email}
                            onChange={handleInputChange}
                            placeholder="alex.rivers@mail.com" 
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-secondary/30 border border-border focus:border-accent outline-none transition-all" 
                            required 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-end mb-1">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Contraseña de Élite</label>
                          <button 
                            type="button"
                            onClick={generateSecurePassword}
                            className="text-[10px] font-black text-accent hover:text-accent/80 flex items-center gap-1 uppercase tracking-tighter"
                          >
                            <RefreshCw className="w-3 h-3" /> Generar Segura
                          </button>
                        </div>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                          <input 
                            type={showPassword ? "text" : "password"} 
                            name="password" 
                            value={regData.password}
                            onChange={handleInputChange}
                            placeholder="••••••••" 
                            className="w-full pl-12 pr-12 py-4 rounded-2xl bg-secondary/30 border border-border focus:border-accent outline-none transition-all" 
                            required 
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        
                        {/* Strength Meter */}
                        <div className="px-1 pt-1">
                          <div className="flex gap-1 h-1 mb-2">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div 
                                key={level} 
                                className={`flex-1 rounded-full transition-all duration-500 ${
                                  passwordStrength >= level 
                                    ? (passwordStrength <= 2 ? "bg-red-500" : passwordStrength <= 4 ? "bg-yellow-500" : "bg-green-500") 
                                    : "bg-secondary"
                                }`} 
                              />
                            ))}
                          </div>
                          <p className={`text-[9px] font-bold uppercase tracking-tight ${
                            passwordStrength <= 2 ? "text-red-500" : passwordStrength <= 4 ? "text-yellow-500" : "text-green-500"
                          }`}>
                            {passwordStrength === 0 && "Ingresa una clave"}
                            {passwordStrength === 1 && "Nivel: Vulnerable"}
                            {passwordStrength === 2 && "Nivel: Débil"}
                            {passwordStrength === 3 && "Nivel: Aceptable"}
                            {passwordStrength === 4 && "Nivel: Fuerte"}
                            {passwordStrength === 5 && "Nivel: Inquebrantable"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Confirmar Contraseña</label>
                        <div className="relative group">
                          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                          <input 
                            type={showPassword ? "text" : "password"} 
                            name="confirmPassword" 
                            value={regData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="••••••••" 
                            className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-secondary/30 border outline-none transition-all ${
                              regData.confirmPassword && regData.password !== regData.confirmPassword ? "border-red-500" : "border-border focus:border-accent"
                            }`} 
                            required 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 pt-6">
              {mode === "register" && step > 1 && (
                <button 
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="p-4 rounded-2xl bg-secondary hover:bg-secondary/80 transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              <button 
                type="submit"
                className={`flex-1 py-4 rounded-2xl font-display font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  mode === "login" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-accent text-accent-foreground shadow-lg shadow-accent/25"
                }`}
              >
                {mode === "login" ? (
                  <>Acceder como {selectedRole} <LogIn className="w-5 h-5" /></>
                ) : (
                  <>
                    {step === 3 ? `Finalizar Registro como ${selectedRole}` : "Continuar"} 
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "¿Nuevo en NovaTech?" : "¿Ya tienes cuenta?"}{" "}
              <button 
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setStep(1); }}
                className={`font-bold hover:underline ${mode === "login" ? "text-accent" : "text-primary"}`}
              >
                {mode === "login" ? "Crea una cuenta ahora" : "Inicia sesión aquí"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
