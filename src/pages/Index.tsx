
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to Orders page
    navigate("/orders");
  }, [navigate]);

  return (
    <div>
      <Dashboard />
    </div>
  );
};

export default Index;
