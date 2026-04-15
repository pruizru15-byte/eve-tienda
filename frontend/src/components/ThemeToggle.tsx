import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-secondary/50 border border-border/50 text-muted-foreground hover:text-primary transition-all relative overflow-hidden group"
      aria-label="Alternar tema"
    >
      <motion.div
        animate={{ rotate: isDark ? 0 : 180, scale: isDark ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <Moon className="w-5 h-5" />
      </motion.div>
      <motion.div
        animate={{ rotate: isDark ? -180 : 0, scale: isDark ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <Sun className="w-5 h-5" />
      </motion.div>
      <div className="opacity-0">
        <Sun className="w-5 h-5" />
      </div>
    </button>
  );
}
