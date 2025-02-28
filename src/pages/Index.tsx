
import { useEffect } from "react";
import Dashboard from "@/components/Dashboard";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Dashboard />
    </div>
  );
};

export default Index;
