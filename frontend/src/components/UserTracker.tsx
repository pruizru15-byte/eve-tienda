import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function UserTracker() {
  const location = useLocation();

  useEffect(() => {
    const updateStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:3000/api/auth/status", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ 
            last_page_view: location.pathname 
          })
        });

        if (response.status === 403 || response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.reload();
        }
      } catch (error) {
        // Silent fail
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000); // Heartbeat every 1 minute

    return () => clearInterval(interval);
  }, [location.pathname]);

  return null;
}
