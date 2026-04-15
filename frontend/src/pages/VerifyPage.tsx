import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de verificación no encontrado.");
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/auth/verify?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "¡Cuenta verificada con éxito!");
          toast.success("¡Ya puedes iniciar sesión!");
          setTimeout(() => navigate("/auth"), 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Error al verificar la cuenta.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("No se pudo conectar con el servidor.");
      }
    };

    verifyToken();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass p-8 rounded-[32px] text-center shadow-2xl space-y-6"
      >
        <div className="flex justify-center">
          {status === "loading" && <Loader2 className="w-16 h-16 text-primary animate-spin" />}
          {status === "success" && <CheckCircle2 className="w-16 h-16 text-green-500" />}
          {status === "error" && <XCircle className="w-16 h-16 text-red-500" />}
        </div>

        <h1 className="text-2xl font-display font-bold">
          {status === "loading" && "Verificando cuenta..."}
          {status === "success" && "¡Confirmado!"}
          {status === "error" && "Error de Verificación"}
        </h1>

        <p className="text-muted-foreground">{message}</p>

        {status !== "loading" && (
          <Link 
            to="/auth" 
            className="inline-block w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/25"
          >
            Ir al Inicio de Sesión
          </Link>
        )}
      </motion.div>
    </div>
  );
}
