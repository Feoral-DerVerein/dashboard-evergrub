
import Dashboard from "@/components/Dashboard";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Si estamos en la ruta raíz, redirigir al dashboard
    if (window.location.pathname === "/") {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Dashboard />
    </div>
  );
};

export default Index;
